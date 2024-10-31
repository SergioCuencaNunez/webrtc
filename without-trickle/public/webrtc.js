// Version without Trickle ICE
const socket = io();

let localStream, remoteStream, peerConnection;
let iceCandidates = [];

const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

const localVideo = document.getElementById("local");
const remoteVideo = document.getElementById("remote");
const startCallButton = document.getElementById("startCallButton");
const finishCallButton = document.getElementById("finishCallButton");

startCallButton.addEventListener("click", startCall);
finishCallButton.addEventListener("click", finishCall);

async function startCall() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        console.log("Local media ready, joining room...");

        startCallButton.disabled = true;
        finishCallButton.disabled = false;

        socket.emit("join");
    } catch (error) {
        console.error("Couldn’t access media devices:", error);
    }
}

function finishCall() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
        console.log("Call finished");

        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
            remoteStream = null;
            remoteVideo.srcObject = null;
        }

        startCallButton.disabled = false;
        finishCallButton.disabled = true;
    }
}

function setupPeerConnection() {
    peerConnection = new RTCPeerConnection(config);

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = event => {
        if (!remoteStream) {
            remoteStream = new MediaStream();
            remoteVideo.srcObject = remoteStream;
        }
        remoteStream.addTrack(event.track);
    };

    // Get ICE candidates
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            const candidateInfo = extractCandidateInfo(event.candidate.candidate);
            console.log("ICE candidate gathered - IP:", candidateInfo.ip, "Port:", candidateInfo.port);
            
            iceCandidates.push(event.candidate);
        } else {
            // Send all ICE candidates when gathering is complete
            console.log("ICE gathering complete. Sending offer/answer with candidates.");
            socket.emit(peerConnection.localDescription.type, {
                description: peerConnection.localDescription,
                candidates: iceCandidates
            });
        }
    };

    // Nominated candidate pair
    peerConnection.oniceconnectionstatechange = () => {
        if (peerConnection.iceConnectionState === 'connected' || peerConnection.iceConnectionState === 'completed') {
            const localCandidate = extractCandidateInfo(peerConnection.currentLocalDescription.sdp);
            const remoteCandidate = extractCandidateInfo(peerConnection.currentRemoteDescription.sdp);
            console.log("Nominated candidate pair - Local IP:", localCandidate.ip, "Port:", localCandidate.port);
            console.log("Nominated candidate pair - Remote IP:", remoteCandidate.ip, "Port:", remoteCandidate.port);
        }
    };
}

function extractCandidateInfo(sdp) {
    const candidateLines = sdp.split('\n').find(line => line.includes("candidate"));
    if (candidateLines) {
        const parts = candidateLines.split(' ');
        return {
            ip: parts[4],
            port: parts[5]
        };
    }
    return { ip: null, port: null };
}

socket.on("joined", async () => {
    console.log("Room joined, creating an offer...");
    setupPeerConnection();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
});

socket.on("offer", async offer => {
    if (!peerConnection) setupPeerConnection();
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer.description));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    for (let candidate of offer.candidates) {
        try {
            await peerConnection.addIceCandidate(candidate);
        } catch (e) {
            console.warn("ICE candidate error:", e);
        }
    }
});

socket.on("answer", async answer => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer.description));
    answer.candidates.forEach(async candidate => {
        try {
            await peerConnection.addIceCandidate(candidate);
        } catch (e) {
            console.warn("ICE candidate error:", e);
        }
    });
});

const express = require("express");
const https = require("https");
const fs = require("fs");
const { Server } = require("socket.io");
const os = require("os");

const app = express();

// SSL
const sslOptions = {
    key: fs.readFileSync("certs/key.pem"),
    cert: fs.readFileSync("certs/cert.pem")
};

const server = https.createServer(sslOptions, app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("New user connected");

    socket.on("join", () => {
        socket.emit("joined");
    });

    socket.on("offer", (offer) => {
        socket.broadcast.emit("offer", offer);
    });

    socket.on("answer", (answer) => {
        socket.broadcast.emit("answer", answer);
    });

    socket.on("ice-candidate", (candidate) => {
        socket.broadcast.emit("ice-candidate", candidate);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        for (const iface of interfaces[interfaceName]) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return "localhost";
}

const localIP = getLocalIPAddress();
server.listen(3000, "0.0.0.0", () => {
    console.log(`Server is live at https://${localIP}:3000`);
});

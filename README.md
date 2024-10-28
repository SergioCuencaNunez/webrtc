# WebRTC Video Call Application

This application is a simple peer-to-peer (P2P) video call app built with WebRTC, utilizing two different ICE strategies: **Trickle ICE** and **Non-Trickle ICE**. It enables real-time communication between two peers using only a web browser and a signaling server.

## Features

- **Trickle ICE Version**: ICE candidates are sent to the remote peer as they are discovered, reducing connection setup time.
- **Non-Trickle ICE Version**: ICE candidates are collected first, then sent in a single batch after all are gathered.
- **Start and Finish Call Buttons**: Allows starting and ending calls multiple times in the same session.
- **IP and Port Logging**: Logs IP and Port information for each ICE candidate and the final nominated pair.

## Setup

### Prerequisites

- **Node.js** (v14 or higher recommended)
- **Web Browser** with WebRTC support (Chrome, Firefox)

### Installation

1. Clone this repository to your local machine:

    ```bash
    git clone https://github.com/your-username/webrtc-video-call-app.git
    cd webrtc-video-call-app
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

### Run the Signaling Server

The signaling server is set up using **Socket.IO** and **Express** with HTTPS. Ensure you have SSL certificates if running over HTTPS, or modify to HTTP for local testing.

1. Run the server:

    ```bash
    node server.js
    ```

2. Access the application in the browser at:

    ```plaintext
    https://<server-IP>:3000/webrtc.html
    ```

### Using the Application

1. **Start a Call**: Click the **Start Call** button to initiate the call. The application will:
   - Request access to your camera and microphone.
   - Join the signaling server room.
   - Display your video feed on the local video element.

2. **Finish a Call**: Click the **Finish Call** button to end the call. This will:
   - Close the peer connection.
   - Stop the remote video feed.
   - Allow you to restart a new call without refreshing the page.

### Console Logs

The application logs **IP and Port** information for each gathered ICE candidate and the nominated candidate pair once a connection is established.

Example logs:
```plaintext
ICE candidate gathered - IP: 192.168.1.5 Port: 61212
ICE candidate gathered - IP: 203.0.113.5 Port: 59123
Nominated candidate pair - Local IP: 192.168.1.5 Port: 61212
Nominated candidate pair - Remote IP: 203.0.113.5 Port: 59123
```

## Code Structure

- `webrtc.html`: Contains the HTML structure, video elements, and call buttons.
- `webrtc.js`: Handles WebRTC configuration, signaling, and peer connection setup.
  - `startCall()`: Initiates the media stream and sets up the peer connection.
  - `finishCall()`: Closes the connection and resets the call state.
  - `extractCandidateInfo()`: Extracts IP and port from each ICE candidate for logging.

## Versions

This repo contains two WebRTC versions:
- **Trickle ICE**: Immediate ICE candidate transmission.
- **Non-Trickle ICE**: Batch ICE candidate transmission after all are gathered.

## License

This project is open-source and available under the Apache License.

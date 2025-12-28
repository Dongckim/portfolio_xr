---
id: 3
title: 'Low-Latency Synchronization'
description: 'Engineered a Master-Client network architecture achieving ±3 frame synchronization accuracy across multiple standalone VR headsets using a custom NTP-like protocol.'
iconType: 'plane'
category: 'extended reality'
youtubeUrl: 'UoeiSMDjMIo'
gifs:
  - '/project/client.jpg'
technologies:
  - 'Node.js'
  - 'Socket.io'
  - 'Unity'
  - 'C#'
  - 'JSON'
---

To enable a shared VR concert experience where multiple users see the same performance simultaneously, I designed a **Master-Client network architecture** using Node.js and Socket.io. The goal was to synchronize 8K video playback across 5+ Meta Quest 3 devices with frame-level precision.

I implemented a custom **NTP-like time synchronization protocol**. Instead of relying on system time, the client calculates the RTT (Round Trip Time) to establish a precise global `timeOffset` relative to the server.

### **Performance Visualization**

To verify the synchronization logic, I logged the current frame of all connected clients in real-time.

| **Frame Synchronization Graph** | **Server Architecture** |
| :---: | :---: |
| ![Frame Sync Graph](/project/client.jpg) | ![Network Architecture](/project/sync.gif) |
| *Client 1 (Blue) vs Client 2 (Red) showing tight sync* | *Node.js Master-Client Broadcast Server Monitoring System* |


### **Synchronization Logic**

To handle network fluctuations, I engineered a "Future Timestamp Execution" strategy:

1.  **Time Sync**: Clients calculate `timeOffset` = `ServerTime` - `LocalTime` - `RTT/2`.
2.  **Command Broadcast**: The Master sends a `Play()` command with a future timestamp (e.g., `ServerTime + 3000ms`).
3.  **Local Scheduling**: Each client calculates the exact wait time:
    > `WaitTime` = `TargetTime` - (`LocalTime` + `timeOffset`)
    
    This ensures that even if packets arrive at different times, the `VideoPlayer.Prepare()` and `Play()` methods trigger at the exact same physical moment.

### **Verification Results**

| **Frame Logging Verification** |
| :---: |
|![Frame Sync Graph](/project/5clients.jpg)|

I developed a logging system that records the `CurrentFrame` of every client into a CSV file for analysis.

| **Metric** | **Result** |
| :--- | :--- |
| **Average Frame Diff** | **1~2 Frames** |

### **Optimization & Troubleshooting**

During the initial tests, broadcasting video time updates (`socket.broadcast.emit`) caused network congestion and stuttering on client devices.
* **Problem**: Every client receiving updates for every other client flooded the main thread.
* **Solution**: Refactored the server logic to use **Targeted Emits** (`io.to(guestId).emit`). The server now selectively sends synchronization data only to the specific client that needs correction, reducing CPU overhead and eliminating stutter.
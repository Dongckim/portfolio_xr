---
id: 2
title: 'Folding Birding: Mixed Reality Interaction Exhibit'
description: 'A Meta Quest 3 MR exhibit with hand-tracking gesture interaction and a persistent OVRSpatialAnchor system — UUID-serialized anchors relocalize content world-aligned across sessions. OpenCV real-time texturing maps physical paper birds onto 3D models.'
iconType: 'bird'
category: 'extended reality'
gifs:
  - '/project/interaction_affection.gif'
technologies:
  - 'Unity'
  - 'C#'
  - 'Meta XR SDK'
  - 'Meta Quest 3'
  - 'Spatial Anchors (OVRSpatialAnchor)'
  - 'Anchor Relocalization / Persistence'
  - 'Hand Tracking (Interaction SDK)'
  - 'MR Passthrough'
  - 'OpenCV'
  - 'Python'
  - 'REST API'
---

# **Folding Birding**
**An experiential exhibition where analog paper-folding emotions meet digital life.** This project moves beyond passive viewing to create a space where visitors interact with their own creations in Mixed Reality (MR).

|**Design System**|
|:--:|
|![](/project/design.png)|

---

### **1. Project Overview & Process**
The project aims to provide an immersive experience where anyone can become an artist, filling a void space with real-time digital life.

| **1. Texture Interface List** | **2. Selection & Application** | **3. MR Spatial Interaction** |
| :---: | :---: | :---:|
| ![Interface List](/project/interface_list.png) | ![Selection App](/project/selection_app.png) | ![MR Interaction](/project/mr_interaction.png) |
| Users access a visual list of bird textures registered on the server after donning the HMD. | Users select the button with their name to apply their custom design to the 3D bird model in real-time. | The final stage where users perform diverse interactions with their unique bird in a Mixed Reality environment. |

**Re-Dev-De (Research-Development-Design) Team Operation:**
* **Research**: Established project concepts, designed XR UX flows, and defined functional specifications.
* **Dev**: Focused on texturing, scan implementation, XR development, and admin tablet creation.
* **Design**: Developed the brand identity (Logo), 3D modeling/animation, and spatial environmental design.

---

### **2. Core Feature: OpenCV-Based Real-Time Texturing**
Using mobile cameras, the system captures physical paper birds and maps the unique user-decorated patterns onto 3D models.

| **Final 3D Texture Application Stage** |
| :---: |
| ![User Custom Texture in MR](/project/3dtexture.png) |
| *Final stage where customized 3D paper bird models are applied and interacted with in the MR environment.* |

* **Scan Workflow**: Images are captured via mobile, processed through OpenCV to extract contours/vertices, and sent via REST API to the server.
* **Unity Integration**: The server-stored texture is received by Unity and applied as a Material to the 3D bird model.

---

### **3. Interaction System Design**
The interaction logic is designed to facilitate a deep emotional connection through intuitive hand gestures.

**State-Interaction Diagram**:
| **State-Interaction Schematics** |
| :---: |
| ![Interaction Schematic](/project/interaction_flow.png) |
| *Visual mapping of bird states: Idle → Call → Follow → Direct → Affection → Bye.* |

---

### **4. Mixed Reality Interaction (Bonding Experience)**
Users engage with their digital birds using hand-tracking gestures detected by the HMD.

| **Call** | **Follow** | **Direct A** |
| :---: | :---: | :---: |
| ![Call GIF](/project/interaction_call.gif) | ![Follow GIF](/project/interaction_follow.gif) | ![DirectA GIF](/project/directA.gif) |
|Raising a hand above the head makes the bird fly closer.|The bird follows the user at a 1m distance. |Extending the index finger while folding all other fingers.|

| **Direct B** | **Affection** | **Bye** |
| :---: | :---: | :---: |
|![Direct B GIF](/project/directB.gif) | ![Affection GIF](/project/interaction_affection.gif) | ![Bye GIF](/project/interaction_bye.gif) |
|Opening the hand with the palm facing upward. |Touching the bird triggers a heart VFX. | A 'promise' gesture makes the bird fly away. |
---

### **5. Spatial Design & Persistent Anchor System**
The environment is engineered for long-term exhibit stability and visual immersion.

* **Environment**: A low-poly fairytale natural space designed to evoke a sense of childhood innocence.
* **Sky System**: Custom shaders for sky textures and fog parameters to visualize time changes.
* **Persistent Spatial Anchor System**: Engineered a drift-free MR experience using **OVRSpatialAnchor** (Mixed Reality Utility Kit). This enables reliable content relocalization across different sessions by serializing UUID-based anchor data to local storage, ensuring the virtual fence and bird-spawn points remain physically aligned with the exhibit hall<div style="text-align: center; margin: 1.5rem 0;">
  <img src="/project/birdings.gif" alt="Kill Switch" style="width: 60%; max-width: 500px; display: block; margin: 0 auto;" />
</div>

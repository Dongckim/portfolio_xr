---
id: 6
title: 'Grab Stabilization | Hand Interaction between Virtual Object'
description: 'Implemented a stable hand-tracking interaction system for virtual objects using proximity detection and custom anchor logic to prevent jitter.'
iconType: 'sphere'
category: 'extended reality'
youtubeUrl:
gifs:
  - '/project/grab-after.gif'
technologies:
  - 'Unity'
  - 'C#'
  - 'OpenXR'
  - 'XR Interaction Toolkit'
  - 'Meta XR SDK'
---

To address the issue of unstable object tracking and accidental interactions in the "Cheering Stick" module, I developed a custom **Hand Mesh Activation Controller**. This system replaces standard physics-based grabbing with a logic-driven approach, ensuring the virtual object remains stable even during rapid movements.

### **Performance Comparison**

| **Before** | **After** |
| :---: | :---: |
| ![Before Optimization](/project/grab-before.gif) | ![After Optimization](/project/grab-after.gif) |
| *Unstable tracking with frequent jitter at object edges* | *Stable holding position using custom anchor points* |


### **The Challenge: Why Physics wasn't enough?**

During the user testing (5 participants), we identified critical usability issues with the standard XR grab interaction:
* **Excessive Grab Area**: The collider-based grab triggered accidental interactions when the hand was merely near the object.
* **Physics Jitter**: Rapid hand movements (common in cheering) caused the virtual stick to "float" or lag behind due to physics engine latency.
* **User Feedback**: Users reported, *"It's hard to hold properly, and I drop it too easily when shaking my hand"*.

### **Technical Implementation**

To solve this, I engineered a **Multi-stage State Machine** that strictly manages the transition between the user's real hand and the virtual object.

1.  **Proximity Detection Logic (Thumb-Index Distance)**:
    Instead of relying solely on colliders, the system calculates the precise distance between the thumb and index finger to trigger interaction events like `OnSelectExit`. This prevents accidental drops when the user's hand relaxes slightly.

2.  **Custom Anchor Snapping**:
    When a grab is initiated, the system disables the physics-based tracking and snaps the object to a pre-calculated anchor point on the hand bone. This ensures the object follows the hand's Transform directly, eliminating the "floating" effect.

3.  **Dynamic Mesh Swapping**:
    To prevent visual clipping and enhance immersion, the system dynamically swaps the real hand mesh with a specialized "holding hand" prefab that perfectly aligns with the object's handle upon interaction.

### **State Machine Flow**

The `HandMeshActivationController` handles the interaction lifecycle through four distinct states:

> **1. Initial** (Hidden) → **2. Proximity** (Detection/Guide) → **3. Mesh Activation** (Visual Swap) → **4. Full Interaction** (Stabilized Grab)

### **Final Outcome**

* **Zero Jitter**: Eliminated the visual lag between hand and object during rapid cheering motions.
* **Enhanced Stability**: Users could vigorously wave the cheering stick without accidental drops, resolving the primary feedback from the QA session.
---
id: 7
title: 'R3F Shoe Customizer | WebGL Real-time 3D Product Configurator'
description: 'A browser-based 3D shoe configurator built with React Three Fiber. Per-mesh raycasting, real-time material recoloring, and auto cinematic camera framing — no plugins, no install.'
iconType: 'sphere'
category: 'extended reality'
youtubeUrl: ''
gifs:
  - '/project/r3f-shoes.gif'
technologies:
  - 'React'
  - 'TypeScript'
  - 'React Three Fiber'
  - 'Three.js'
  - 'drei (CameraControls / ContactShadows)'
  - 'GLTFLoader'
  - 'Recoil'
  - 'MUI'
  - 'Vite'
---

## Project Overview

|Live Showroom|
|:--:|
|![R3F Shoe Customizer](/project/r3f-shoes.gif)|

A **WebGL-based shoe customization showroom** that delivers a real-time 3D product configurator entirely inside the browser. Users can orbit, click on individual shoe parts (vamp, sole, laces, swoosh), and recolor each component from a curated **14-color Nike-inspired palette** — with zero install footprint, zero plugins, and instantaneous material updates.

This project bridges my XR/Unity rendering work with **spatial computing on the web** — the same skill set (mesh hierarchy, raycasting, lighting, GLTF asset pipelines, camera control) applied to a `<canvas>` instead of an HMD.

---

### **Core Interaction Loop**

| **1. Click a Part** | **2. Auto-Frame** | **3. Recolor Live** |
| :---: | :---: | :---: |
| Raycaster detects the picked mesh | `CameraControls.fitToBox()` cinematically zooms in | Material clone + color swap via Recoil state |

The interaction is intentionally one-handed and zero-friction: a single click drives **mesh selection → camera focus → palette context**, all in one frame.

---

### **Technical Implementation**

#### 1. Per-Mesh Material Isolation
A single GLTF model (`custom.glb`) contains a full shoe with shared materials across left and right meshes. Naively assigning a new color would tint *every* mesh sharing that material.

To solve this, the system **clones the material on first interaction**:

```ts
const firstMat = firstObj.material as THREE.MeshStandardMaterial;
const cloneMat = firstMat.clone();
firstObj.material = cloneMat;
```

This guarantees that recoloring the "Vamp_Left" mesh does not bleed into "Vamp_Right" — each picked part owns its own material instance from the moment it's touched.

#### 2. Raycaster-Driven Mesh Selection
Instead of relying on per-mesh `onClick` handlers (which require flattening the GLTF hierarchy and degrade with model complexity), the showroom uses a **single root-level raycaster pass**:

```ts
const intersects = raycaster.intersectObjects(gltf.scene.children, true);
const firstObj = intersects[0].object as THREE.Mesh;
setSelectedMeshName(firstObj.name);
```

`recursive: true` lets the raycaster traverse arbitrary mesh trees, so the same logic scales from a 4-part shoe to a 40-part configurator without code changes.

#### 3. Cinematic Auto-Framing
On every selection, the system delegates camera control to drei's `CameraControls.fitToBox()`:

```ts
cameraControlsRef.current.fitToBox(firstObj, true);
```

This computes the bounding box of the picked mesh and tweens the camera to a frame that fills the viewport — giving the user a *product-photography-grade* close-up without writing manual easing curves. Camera state events (`control`, `sleep`) are wired into an `isFitting` flag so user-driven orbits are not interrupted mid-tween.

#### 4. Visual Feedback Loop
A **500ms emissive pulse** confirms the click before the camera arrives:

```ts
mat.emissive = new THREE.Color('#B7F2F1'); // selection highlight
setTimeout(() => { mat.emissive = new THREE.Color('black'); }, 500);
```

The cyan flash matches the scene's background tint, creating a soft "this part is now active" affordance that survives motion blur during the camera tween.

#### 5. State Architecture
Two Recoil atoms drive the entire app — `selectedColorState` (palette index) and `selectedMeshState` (currently active mesh name). The 3D scene and the MUI color palette UI both subscribe to these atoms, so the canvas and DOM stay in sync without prop drilling through the `<Canvas>` boundary (which would otherwise break React context inheritance under R3F).

---

### **Why It Matters for Spatial Work**

This is a 2D-screen project that exercises the **exact skill set of XR engineering**:

| **Skill** | **Used In R3F Showroom** | **Mirrors XR Work** |
| :--- | :--- | :--- |
| GLTF / mesh hierarchy traversal | `gltf.scene.traverse()` for material setup | Loading scanned/imported assets in Unity |
| Raycaster picking | `raycaster.intersectObjects()` | Controller/hand-ray selection in [[grab-stabilization-vr]] |
| Material instancing | `material.clone()` to avoid bleed | Custom shader instances in [[shader-alpha-blending]] |
| Lighting & shadows | `directionalLight` + `ContactShadows` | URP lighting setup for Quest standalone |
| State sync across render boundary | Recoil bridging Canvas ↔ DOM | Networked state in [[low-latency-synchronization]] |

The web stack is different; the **3D mental model is identical**.

---

### **System Specifications**
* **Renderer**: React Three Fiber 8.15 (Three.js 0.159)
* **Helpers**: @react-three/drei (CameraControls, ContactShadows)
* **State**: Recoil 0.7
* **UI**: MUI 5 + SCSS
* **Build**: Vite 5, TypeScript 5.2
* **Deploy**: Firebase Hosting (static SPA)

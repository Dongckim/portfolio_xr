---
id: 3
title: 'CORTEX | Battery-Aware VLM Middleware for Wearable XR'
description: 'A 4-layer SDK that sits between smart-glasses cameras and VLM APIs — gating redundant frames via SSIM/blur/IMU, cropping to salient regions, and routing to the right model. Targets 60%+ payload reduction and 2× battery on wearable XR.'
iconType: 'dots'
category: 'extended reality'
youtubeUrl: ''
gifs:
  - '/project/cortex-v2.gif'
technologies:
  - 'Python 3.11+'
  - 'OpenCV'
  - 'scikit-image (SSIM)'
  - 'NumPy'
  - 'Pillow'
  - 'Laplacian Blur Detection'
  - 'MSER Text Detection'
  - 'Spectral Saliency'
  - 'Smart Glasses / Wearables'
---

## Project Overview

**CORTEX (Camera Optimized Realtime Transmission Exchange)** is a drop-in middleware SDK for wearable XR devices — smart glasses, AR headsets, and similar always-on cameras — that streamline what gets sent to vision-language model APIs.

The premise: when your AR glasses are streaming **30 fps to a VLM** while you stare at a whiteboard that hasn't changed in 3 minutes, you're burning **tokens, bandwidth, and battery** for zero new information. CORTEX is the layer that decides *"is this frame worth asking the AI about?"* — in real time, on-device, before a single byte leaves the headset.

### **Pipeline Evolution: V1 → V2**

| **V1** | **V2** |
| :---: | :---: |
| ![CORTEX V1](/project/cortex-v1.gif) | ![CORTEX V2](/project/cortex-v2.gif) |
| *Initial frame-gating prototype* | *Refined pipeline with salient-region cropping & adaptive routing* |

---

### **The Wearable XR Problem**

The same architectural pressure that drove [[low-latency-synchronization]] (every frame ±33ms matters across 5 Quest 3s) drives CORTEX in the opposite direction: **don't send the frame at all if it doesn't matter**.

Wearables have three constraints that desktop/server VLMs ignore:

| **Constraint** | **Why It Breaks Naive Streaming** |
| :--- | :--- |
| **Battery** | Continuous camera + radio = 90 min headset life. Token-per-frame is unsustainable. |
| **Bandwidth** | LTE/5G mid-walk has jitter and caps; 2 MB raw frames at 30 fps saturate uplink in seconds. |
| **Latency to AI** | Every frame sent is a frame the user waits for. Filtering at the edge beats waiting at the server. |

CORTEX bridges the wearable XR hardware ↔ cloud VLM gap that smart glasses ([[smartsight]]) and any future AR-glasses product will hit.

---

### **4-Layer Pipeline**

```
Smart Glasses Camera (~30 fps)
        │
        ▼
┌─────────────────────────────────────────────────┐
│ L1: CAPTURE — "Should we process this frame?"   │
│   IMU Gate → Laplacian Blur → SSIM Scene Change │
└─────────────────────────────────────────────────┘
        │  (60%+ rejected here)
        ▼
┌─────────────────────────────────────────────────┐
│ L2: COMPRESS — "What part matters? How small?"  │
│   Scene Classifier → ROI Crop → Adaptive JPEG   │
└─────────────────────────────────────────────────┘
        │  (40-120 KB vs 2+ MB)
        ▼
┌─────────────────────────────────────────────────┐
│ L3: ROUTE — Pick the right VLM                  │
│   Claude / GPT / Gemini + circuit breaker       │
└─────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────┐
│ L4: MEMORY — Temporal context across frames     │
└─────────────────────────────────────────────────┘
```

---

### **Technical Implementation**

#### Layer 1 — Multi-Stage Frame Gating

Three independent gates run in order of cheapest-first:

1. **IMU Gate** — accelerometer below threshold → the camera is still, the scene is probably static, skip.
2. **Laplacian Blur Detector** — `cv2.Laplacian(gray, CV_64F).var()`. If variance is below threshold, the frame is motion-blurred and useless to a VLM. O(n) and cheap → runs before the more expensive SSIM step.
3. **SSIM Scene Change** — Structural Similarity (`scikit-image.metrics.ssim`) compared against the *last accepted frame*. If SSIM ≥ 0.92 (tunable), the scene hasn't meaningfully changed — skip.

```python
def should_process_frame(self, frame: np.ndarray) -> tuple[bool, float]:
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    if self._last_frame is None:
        self._last_frame = gray
        return True, 0.0

    score, _ = ssim(self._last_frame, gray, full=True)
    if score >= self.similarity_threshold:   # 0.92
        return False, score                  # scene unchanged → skip

    self._last_frame = gray                  # update reference
    return True, score
```

**Why SSIM over pixel diff?** Pixel subtraction is fooled by lighting flicker, JPEG compression artifacts, and exposure changes. SSIM is structural — it survives the noise that fools naive diffing.

#### Layer 2 — Salient Region Cropping
Once a frame is accepted, CORTEX picks the **smallest crop that preserves the answer**:

| **Scene Type** | **Crop Strategy** |
| :--- | :--- |
| Text-heavy (whiteboards, papers) | **MSER text region detection** → crop to text bounding box |
| Face / object scenes | **Spectral saliency map** → crop to salient region |
| General / fallback | Center-weighted crop |

#### Adaptive JPEG Encoder
The encoder reads network/battery state per frame and dials quality on a sliding scale:

```
WiFi          → JPEG q=85, max 1024px   (best quality)
LTE           → JPEG q=70, max  768px   (balanced)
low-battery   → JPEG q=55, max  512px   (survival mode)
```

Dropping quality 85→55 cuts payload ~3× with minimal VLM accuracy loss on text/object tasks. **Quality reduction beats resolution scaling** for VLM use cases — resolution cuts off context, quality just adds compression noise the VLM ignores.

#### Layer 3 — VLM Router with Circuit Breaker
A single `pipeline.process(frame)` call returns `(should_call_vlm, payload_bytes)`. The integrator picks the model. A planned **circuit breaker** tracks per-provider error rate — on 3 consecutive failures, the provider is taken out of rotation for 30 s and traffic falls back to the next configured model.

---

### **Why This Belongs in an XR Portfolio**

CORTEX is *not* a VR/MR application — it has no Unity scene, no HMD rendering, no spatial UI. What it *is* is **the infrastructure that makes wearable XR economically viable**. Every smart-glasses product that streams vision to AI will face the same tradeoff: pay for tokens, drain the battery, drop frames at random — or build a CORTEX-style gate.

This connects directly to:
- **[[smartsight]]** — built on Ray-Ban Meta, exactly the form factor CORTEX targets. SmartSight's 3-second polling interval is itself a coarse version of CORTEX's gate.
- **[[low-latency-synchronization]]** — the same "every-frame-matters" mindset, applied at the *opposite* end: sync replaces redundant frames; CORTEX rejects them.

---

### **Validation & Reliability**

- **80+ pytest cases, 99% coverage** on L1 + L2 layers.
- **Synthetic edge cases**: all-black frames (Laplacian = 0 → blur reject), scene flashes (SSIM ~0.4 with no semantic change → documented threshold tuning), low-contrast text (MSER falls back to center crop), tiny frames <64×64 (spatial pooling skipped), WiFi↔LTE mid-session switches (encoder re-reads network state per frame).
- **Live webcam demo** with HUD overlays: accepted/rejected counts, SSIM scores, payload sizes, all in real time.

### **Impact**

- Targets **60%+ frame rejection** before any VLM call → direct token cost reduction.
- Targets **2× wearable battery extension** via maximized camera-off time.
- **Drop-in SDK design** — integrators call `pipeline.process(frame)` and receive `(should_call, payload)`. Zero changes to existing VLM client code.
- Accompanied by an **arXiv paper** (cortex-arxiv-v5) formalizing the 4-layer architecture and benchmark methodology.

---

### **Repo**
- **Code**: [github.com/Dongckim/cortex-sdk](https://github.com/Dongckim/cortex-sdk)

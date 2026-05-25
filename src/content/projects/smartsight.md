---
id: 0
title: 'SmartSight | Wearable Spatial Tutor on Ray-Ban Meta Glasses'
description: '🏆 MIT Reality Hack 2026 — Grand Gold Award & Meta Track Winner. A first-person spatial tutor that watches what you study through Ray-Ban Meta glasses and teaches back, in real time.'
iconType: 'plane'
category: 'extended reality'
youtubeUrl: 'PbS7iEWzLyw'
gifs:
  - '/realityhack/rh1.jpg'
technologies:
  - 'Ray-Ban Meta Glasses'
  - 'Meta Wearables Device Access Toolkit'
  - 'GPT-4.1 Vision'
  - 'OpenAI Realtime API'
  - 'Spatial Audio'
  - 'WebSocket'
  - 'Node.js'
  - 'iOS'
---

## 🏆 MIT Reality Hack 2026

**Grand Gold Award · Meta Track Winner · Featured on the [Meta Developer Blog](https://developers.meta.com/blog/explore-whats-possible-with-wearables-device-access-toolkit/?utm_source=social-li&utm_medium=M4D&utm_campaign=organic&utm_content=wearables)**

> *"You Learn. We See. We Remember."*

|MIT Reality Hack 2026|
|:--:|
|![MIT Reality Hack](/realityhack/rh1.jpg)|

SmartSight is a **wearable spatial intelligence system** built in 5 days at the world's premier XR + AI hackathon. Instead of forcing students to context-switch between a textbook, a notebook, and an AI chat window, SmartSight lives on the student's **Ray-Ban Meta glasses** — it sees exactly what the student sees, understands the material in real time, and speaks back through bone-conduction audio as a voice tutor.

The result: a hands-free, first-person, ambient tutor that turns *every page you read* into a personalized study session — without ever pulling out a phone.

---

### **The AI coach that knows how you learn best**

> *"AI glasses that passively observe, catch your blind spots, and coach you next."* — [getsmartsight.com](https://getsmartsight.com)

| **After every session** | **Auto-generated** | **Personalized** |
| :---: | :---: | :---: |
| ![Session summary view in the SmartSight app](/realityhack/app-dashboard.png) | ![Flashcards and quizzes auto-generated from your notes](/realityhack/app-flashcards.png) | ![AI coaching conversation with Luna inside the SmartSight app](/realityhack/app-luna-chat.png) |
| **Session summary** | **Flashcards & quizzes** | **AI coaching** |
| Every analyzed frame contributes to a **session-level memory graph**: sub-topics covered, active vs passive engagement %, distraction count, help-asked count, and Luna's AI insight — all surfaced after the session. | Ray-Ban Meta captures the student's POV every ~3 s; GPT-4.1 Vision extracts topics and content, and the pipeline **auto-converts your notes into quizzes and flashcards** for review. | **Luna**, the personalized AI study coach, runs over a persistent WebSocket to OpenAI Realtime — sub-second barge-in, quick-start prompts, and grounded coaching based on what the glasses just saw. |

---

### **Why Ray-Ban Meta**

The interaction medium is the entire point. A laptop tutor *interrupts* studying; a glasses tutor *augments* it. SmartSight is built specifically around the **Meta Wearables Device Access Toolkit** because the glasses give us:

- **Egocentric vision** — the camera sees the exact material from the exact angle the student is reading it.
- **Hands-free input** — no phone unlock, no app switch, no "wait, let me show you what I'm stuck on."
- **Bone-conduction audio** — voice tutoring stays private and ambient; no headphones, no speaker.
- **Always-on form factor** — the tutor is *there* the moment a student looks confused, not buried three taps deep.

This is the wearable spatial computing thesis: **the device that disappears is the device that gets used.**

---

### **Spatial Pipeline**

#### 1. POV Capture → Vision Understanding
Every ~3 seconds, the glasses upload a first-person image through a one-step `/api/upload-and-analyze` endpoint. The system generates a **presigned S3 URL** so the OpenAI Vision API reads the image *directly from S3* — bypassing the Node process entirely and shaving ~2 seconds off the round trip. End-to-end upload-and-analyze latency dropped from **~13 s to ~5 s**.

GPT-4.1 Vision returns a structured analysis:
```json
{
  "isStudying": true,
  "isActive": true,
  "isDistracted": false,
  "topic": "Biology",
  "subtopic": "Photosynthesis - Light Reactions",
  "extractedText": "Chlorophyll absorbs red and blue light..."
}
```

This JSON becomes the **spatial context** for the voice tutor — the tutor literally knows what the student is looking at, in real time.

#### 2. Realtime Voice Tutor — Zero-Dependency Audio Pipeline
The voice channel was the hardest engineering problem. iOS sends **Float32 16 kHz mono** audio. OpenAI Realtime expects **PCM16 24 kHz Base64**. The two formats share nothing — sample type, sample rate, encoding all differ. Adding `ffmpeg` would have broken the lightweight EC2 deploy on hackathon day.

So I built the entire resampler in **pure JS**, stateful across chunk boundaries:

```
iOS (Float32 16kHz)
  → float32ToPcm16LE()  [4B → 2B per sample, clamp + Int16 conversion]
  → drainPcm16Chunks(640B = 20ms @ 16kHz)
  → Resampler16kTo24k.process()  [stateful fractionalPos + prevSample across chunks]
  → 960B chunks @ 24kHz
  → Base64 → input_audio_buffer.append → OpenAI Realtime WS
```

The resampler carries `fractionalPos` and `prevSample` *across chunks*, so 20 ms-by-20 ms streaming produces no clicks at chunk boundaries. Backpressure guards drop frames at 100 KB and close the socket at 300 KB to prevent buffer growth from blocking voice latency.

#### 3. Spatial Context Bridge
Every image analysis pushes a `session.update` event into the **same WebSocket session** the tutor is speaking through — a 5-entry sliding window of the most recent topics/subtopics/extracted text. The tutor's responses are conditioned on this live context, so when the student says *"explain this again"*, the tutor knows exactly what *this* is, because it just saw it.

This is the bridge that turns SmartSight from "voice chat with vision" into **spatial intelligence**: the audio modality and the visual modality share a session.

#### 4. Crash-Safe Concurrent Side-Effects
Every ~3 s analysis fires **4 independent async side-effects**:
- DB save (image + analysis)
- Topic upsert (daily study stats)
- Realtime context push (to voice session)
- Topic tracker state update (in-memory + DB)

Each can fail independently. A single unhandled rejection during a 5-day hackathon = dead demo. So every side-effect runs through `Promise.race([save, timeout(500ms)])` with a trailing `.catch(() => {})` — the response endpoint **always returns 200** if vision analysis itself succeeded, regardless of which subsystems are down. DB outage → `analysisId: null`. Voice disconnect → context skipped. Topic upsert race → in-memory still tracks.

---

### **Award & Recognition**

- **🏆 Grand Gold Award** — MIT Reality Hack 2026 (the world's largest XR + AI hackathon)
- **🏆 Meta Track Winner** — best use of the Meta Wearables platform
- **📰 [Featured on Meta Developer Blog](https://developers.meta.com/blog/explore-whats-possible-with-wearables-device-access-toolkit/?utm_source=social-li&utm_medium=M4D&utm_campaign=organic&utm_content=wearables)** — *"Explore What's Possible with the Wearables Device Access Toolkit"*
- **🎤 Scheduled to present at [AWE USA 2026](https://www.awexr.com/blog/1288-road-to-awe-2026-i-spatial)** — the world's #1 XR + AI conference

---

### **Repo & Demo**
- **Code**: [github.com/Dongckim/2026-MIT-RealityHack](https://github.com/Dongckim/2026-MIT-RealityHack)
- **Demo Video**: ▶️ embedded above

---

### **Why This Matters**

SmartSight is the first wearable in my work that doesn't just *display* information on top of reality — it **listens to the same reality the user is looking at, and responds**. The HMD-style XR projects I've built ([[8k-stereoscopic-video]], [[shader-alpha-blending]], [[low-latency-synchronization]]) all operate inside a *rendered* world. SmartSight operates inside the *real* one. That asymmetry — virtual content reacting to physical context, in real time, on a glasses-sized compute budget — is where I want my research to live.

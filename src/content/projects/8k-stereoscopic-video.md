---
id: 4
title: '8K 360° Stereoscopic Video with MR Passthrough'
description: 'Optimized an 8K video player for mobile VR by implementing a single-pass decoding system for stereoscopic rendering.'
iconType: 'sphere'
category: 'extended reality'
youtubeUrl: ''
gifs:
  - '/project/uv.jpg'
technologies:
  - 'Unity'
  - 'Android (Oculus OS)'
  - 'HLSL (ShaderLab)'
  - 'Meta Quest 3'
---

To play **8K (7680x3840)** high-fidelity content on standalone mobile hardware without performance drops, I completely refactored the rendering pipeline.

Standard VR players often use two separate video streams for stereoscopic 3D, doubling the decoding load. I optimized this by implementing a **Single-Pass Decoding System**, where a single `VideoPlayer` instance decodes one large texture, which is then mapped to separate eyes using custom UV coordinates. This overlaid the 3D concert footage seamlessly onto the real world using MR Passthrough.

### **Visuals & Optimization**

The system delivers a stutter-free 8K experience by reducing the memory overhead of video decoding by 50%.

| **Stereoscopic 3D Rendering** | **MR Passthrough Integration** |
| :---: | :---: |
| ![Stereoscopic Playback](/project/aespa.gif) | ![MR Blending](/project/blend.gif) |
| *8K 60fps Playback on Mobile HMD* | *Seamless overlay on physical environment* |

### **Technical Implementation**

#### 1. Single-Pass Decoding Architecture
Instead of instantiating two heavy `VideoPlayer` components, I engineered a shared material system:
* **One Decode**: The CPU/Decoder processes the 4GB+ 8K file once.
* **Dual Render**: The resulting texture is shared between the Left and Right eye spheres instantly, avoiding synchronization latency found in standard asset store players.

**Stereo 180° L/R Video Rendering Implementation Flow**

<div class="flowchart-container">
  
  <div class="flowchart-phase">
    <div class="flowchart-header">StereoVideoPlayer</div>
    
    <div class="flowchart-step">1. VideoPlayer Initialization</div>
    <div class="flowchart-indent">
      <div class="flowchart-code-block">
        <code>VideoPlayer.renderMode = MaterialOverride</code>
      </div>
      <div class="flowchart-code-block">
        Material slot for video output: <code>_MainTex</code>
      </div>
    </div>
    
    <div class="flowchart-arrow">↓</div>
    
    <div class="flowchart-step">2. Stereo Material Duplication</div>
    <div class="flowchart-grid-2">
      <div class="flowchart-material-box">
        <strong>Left Material</strong>
        <div class="flowchart-material-item">
          <code>leftMaterial = new Material(stereoMaterial)</code>
        </div>
        <div class="flowchart-material-item">
          <code>leftMaterial.SetFloat("_EyeSelect", 0f)</code>
        </div>
        <div style="font-size: 0.8em; color: #666; margin-top: 6px;">// Left eye</div>
      </div>
      <div class="flowchart-material-box">
        <strong>Right Material</strong>
        <div style="font-size: 0.85em; color: #888; font-style: italic; margin-top: 8px;">(Duplicated via coroutine)</div>
      </div>
    </div>
    
    <div class="flowchart-arrow">↓</div>
    
    <div class="flowchart-step">3. Create 2 Spheres (Left/Right)</div>
    <div class="flowchart-grid-2">
      <div class="flowchart-material-box" style="text-align: center; font-weight: bold;">
        leftSphere
      </div>
      <div class="flowchart-material-box" style="text-align: center; font-weight: bold;">
        rightSphere
      </div>
    </div>
    <div class="flowchart-material-box" style="text-align: center; margin-bottom: 15px;">
      Bind to each Renderer
    </div>
    
    <div class="flowchart-arrow">↓</div>
    
    <div class="flowchart-highlight-box">
      <div style="font-size: 0.9em; margin-bottom: 6px; color: #00aaff;">
        <code>videoPlayer.targetMaterialRenderer = leftSphere.GetComponent&lt;Renderer&gt;()</code>
      </div>
      <div style="font-size: 0.85em; color: #a0a0a0;">
        VideoPlayer → leftSphere's <code>_MainTex</code> only
      </div>
    </div>
  </div>
  
  <div class="flowchart-divider"></div>
  
  <div>
    <div class="flowchart-highlight-box">
      <div style="font-size: 0.9em; margin-bottom: 6px; color: #00aaff;">
        <code>rightMaterial.SetTexture("_MainTex", leftMaterial.GetTexture("_MainTex"))</code>
      </div>
      <div style="font-size: 0.85em; color: #a0a0a0;">
        rightMaterial duplicated via coroutine (sync)
      </div>
    </div>
    
    <div class="flowchart-arrow">↓</div>
    
    <div class="flowchart-step">Stereo Camera Settings</div>
    
    <div class="flowchart-grid-3">
      <div class="flowchart-material-box">
        <strong>Main Camera</strong>
        <div class="flowchart-material-item">
          <code>stereoTargetEye = StereoTargetEyeMask.None</code>
        </div>
        <div class="flowchart-material-item">
          <code>enabled = false</code>
        </div>
      </div>
      
      <div class="flowchart-material-box">
        <strong>leftEyeCamera</strong>
        <div style="font-size: 0.8em; color: #888; margin-bottom: 8px;">(MainCamera child)</div>
        <div class="flowchart-material-item">
          <code>-IPD / 2</code>
        </div>
        <div class="flowchart-material-item">
          LeftEye Layer culling
        </div>
        <div class="flowchart-material-item">
          <code>StereoTargetEyeMask.Left</code>
        </div>
        <div class="flowchart-material-item">
          leftEye Renderer
        </div>
      </div>
      
      <div class="flowchart-material-box">
        <strong>rightEyeCamera</strong>
        <div style="font-size: 0.8em; color: #888; margin-bottom: 8px;">(MainCamera child)</div>
        <div class="flowchart-material-item">
          <code>IPD / 2</code>
        </div>
        <div class="flowchart-material-item">
          RightEye Layer culling
        </div>
        <div class="flowchart-material-item">
          <code>StereoTargetEyeMask.Right</code>
        </div>
        <div class="flowchart-material-item">
          rightEye Renderer
        </div>
      </div>
    </div>
  </div>


#### 2. UV Offset Mapping Logic
To create the 3D effect from a single top-bottom or side-by-side video file, I manipulated the UV coordinates in the shader :
* **Left Eye**: Maps to UV `u = 0.0 ~ 0.5`
* **Right Eye**: Maps to UV `u = 0.5 ~ 1.0`
This separates the stereoscopic image data on the GPU side without extra CPU overhead.

#### 3. Memory & Crash Management
Playing 8K video files on mobile devices frequently caused "Out of Memory" crashes during scene transitions. I implemented a strict memory management routine:
* **Forced GC**: Explicitly calling `System.GC.Collect()` before loading large assets.
* **Resource Unloading**: Using `Resources.UnloadUnusedAssets()` to clear the texture buffer immediately after video stops.
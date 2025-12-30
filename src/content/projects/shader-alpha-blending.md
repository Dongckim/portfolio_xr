---
id: 4
title: 'Shader-based Alpha Blending'
description: 'Developed a custom shader pipeline and interaction logic to create a seamless transition between the 8K 360° VR environment and the MR Passthrough layer.'
iconType: 'dots'
category: 'extended reality'
youtubeUrl: ''
gifs:
  - '/project/blend.gif'
technologies:
  - 'Unity'
  - 'HLSL (ShaderLab)'
  - 'C#'
  - 'Meta Passthrough API'
---

To achieve a natural `Blended Reality` effect where the VR concert footage fades into the real world, I implemented and compared two synchronization methods. Ultimately, I combined a logic-based FOV controller with a custom HLSL shader to ensure both performance efficiency and visual quality.

### **Blending Methods Comparison**

I experimented with two different approaches to handle the transition between the VR sphere and the MR Passthrough camera.

| **Method A: C# FOV-based Opacity** | **Method B: HLSL Vertex Gradient** |
| :---: | :---: |
| ![CPU Logic](/project/blend-switch.gif) | ![GPU Shader](/project/blend.gif) |
| *Controls global opacity based on head angle* | *Calculates per-vertex alpha based on world height* |

<br>

### **Technical Implementation**

#### 1. Method A: C# Logic: FOV-based Zone Control
Based on the user's vertical viewing angle, I divided the interaction into three distinct zones to manage the `MaterialPropertyBlock`.

* Zone 1 (Immersion): Front view (< 35°). Opacity is locked at 1.0.
* Zone 2 (Transition): Edge view (35° ~ 45°). Uses `Mathf.SmoothStep` to interpolate opacity smoothly, preventing jarring cuts.
* Zone 3 (Reality): Top/Bottom view (> 45°). Opacity drops to 0.0, revealing the Passthrough layer fully.

#### 2. Method B: HLSL Shader: Y-Axis Gradient
To prevent the "hard edge" at the bottom of the video sphere, I wrote a custom shader that fades the pixels based on their world position.

```hlsl
v2f vert (appdata v) {
    v2f o;

    // Calculate World Position
    float3 worldPos = mul(unity_ObjectToWorld, v.vertex).xyz;

    // Y-Axis Gradient Calculation
    // Fade out based on specific height range (_EndY to _StartY)
    float alpha = saturate((v.vertex.y - _EndY) / range);

    o.alpha = alpha; // Pass calculated alpha to fragment shader
    return o;
}
```

* **Vertex Shader Calculation**:
    Instead of a uniform texture, the alpha is calculated using the Y-coordinate:
    `float alpha = saturate((v.vertex.y - _EndY) / range);`
    This creates a linear interpolation where $Y < -0.1$ is fully transparent and $Y > 0.1$ is fully opaque.

* **Render State Optimization**:
    * **`Cull Off`**: Renders double-sided polygons to support 360° viewing from inside the sphere.
    * **`ZWrite Off`**: Disables depth writing to allow the Passthrough layer to render behind the semi-transparent video without sorting issues.
    * **`Blend SrcAlpha OneMinusSrcAlpha`**: Standard alpha blending for smooth gradients.
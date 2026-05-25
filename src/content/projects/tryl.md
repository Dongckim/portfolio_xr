---
id: -1
title: 'Tryl | AI Fashion Try-On — Full-Stack Monorepo'
description: 'An AI virtual try-on product — "See it on you, before you buy." A Chrome extension detects clothing on any storefront, a FastAPI backend manages fitting profiles, and an async Redis worker queue generates try-on images end-to-end. Live at tryl.me.'
iconType: 'sphere'
category: 'software'
youtubeUrl: ''
gifs:
  - '/project/tryl-1.png'
technologies:
  - 'React'
  - 'TypeScript'
  - 'FastAPI'
  - 'Python'
  - 'PostgreSQL'
  - 'Redis'
  - 'Chrome Extension (MV3)'
  - 'pnpm workspaces'
  - 'S3'
---

## Project Overview

**Tryl** is an AI-powered virtual fashion try-on product — *"See it on you, before you buy."* While shopping on any storefront, a Chrome extension detects the clothing item, and Tryl generates an image of that garment on **you**, using fitting photos you upload once. It's live at **[tryl.me](https://tryl.me)** with Zara integration today (beta), and a multi-channel roadmap spanning web, browser extension, and **smart glasses**.

I built this end-to-end as a solo **Full-Stack Engineer**: a pnpm monorepo with four apps — web, extension, API, and an async worker — sharing types and config.

|Tryl — See it on you, before you buy|
|:--:|
|![Tryl landing](/project/tryl-1.png)|

| | |
| :--: | :--: |
| ![Fitting profile](/project/tryl-2.png) | ![Try-on result](/project/tryl-3.png) |
| *One-time fitting profile setup* | *AI try-on result in the closet/archive* |

---

### **The Core Challenge**

Two hard constraints shaped the entire architecture:

| **Constraint** | **Why It's Hard** |
| :--- | :--- |
| **Generation is slow (5–30s/image)** | Far too slow for a synchronous HTTP response. The request must be decoupled from the generation step. |
| **Storefronts are heterogeneous** | Product images on Zara, H&M, ASOS live behind inconsistent, frequently-redesigned DOM structures. Brittle site-specific scrapers break constantly. |

The engineering answer: an **async job pipeline** (`create → queue → process → archive`) that returns a job ID immediately and delivers the result when ready, plus a **layered fallback detection strategy** in the extension that survives storefront redesigns.

---

### **Architecture**

```
User
 ├─ Chrome Extension (MV3) ─┐
 └─ React Web App ──────────┤
                            ▼
                     FastAPI Backend ── JWT Auth
                            │            └─ PostgreSQL (fitting profiles)
                            ▼
                     Redis Job Queue
                            │  (BRPOP)
                            ▼
                     Try-On Worker  ──► S3 Image Archive
                            └────────►  PostgreSQL (job status)
```

A pnpm-workspace monorepo keeps shared TypeScript types flowing to both the web app and the extension without a publish step:

```
tryl/
  ├─ apps/
  │    ├─ web/          React + TypeScript — auth, fitting profiles, archive
  │    ├─ extension/    Chrome MV3 — product detection on shopping pages
  │    ├─ api/          FastAPI — REST API for profiles, jobs, archive
  │    └─ worker/       Python — async try-on job processor
  ├─ packages/
  │    ├─ shared-types/ TypeScript types shared by web + extension
  │    └─ config/       Shared ESLint + TS config
  └─ pnpm-workspace.yaml
```

---

### **Technical Implementation**

#### Async Try-On Job Pipeline — `create → queue → process → archive`

The request never blocks on generation. The API enqueues a job and returns immediately; a separate worker container does the slow work.

```
POST /api/tryon/jobs  { profile_id, product_image_url, product_metadata }
  │
  ├─ Validate profile exists + user owns it
  ├─ Resolve product: download image → store to S3
  ├─ INSERT job { status: "queued", profile_id, product_image_key }
  └─ redis.lpush("tryon:queue", job_id)        ← enqueue
       │
       ▼  [Worker process — separate container]
  redis.brpop("tryon:queue")                   ← blocking pop, zero CPU burn
       ├─ UPDATE job { status: "processing" }
       ├─ Fetch fitting profile image + product image
       ├─ Call try-on AI model API (async httpx) → poll until ready
       ├─ Store result image → UPDATE { status: "completed", result_image_key }
       └─ On any error → UPDATE { status: "failed", error_message }

GET /api/tryon/jobs/{job_id}   → { status, result_image_url? }
GET /api/tryon/archive         → paginated completed jobs
```

#### Chrome Extension — Product Detection Across Storefronts

Instead of per-site scrapers, a **layered fallback** prioritizes the most stable signal first:

```
Content script injected on page load
  ├─ DOM scan (cheapest-first):
  │    ├─ meta[property="og:image"]        ← most reliable, set by site owners
  │    ├─ [data-testid*="product"] img     ← framework apps (Next.js)
  │    ├─ .pdp-image, .product-image img    ← legacy CSS patterns
  │    └─ largest visible <img>             ← fallback
  ├─ Inject "Try with Tryl" button next to the detected image
  └─ On click → background worker → POST /api/tryon/jobs
        └─ poll GET /api/tryon/jobs/{id} every 3s → show result in popup
```

---

### **Key Engineering Trade-offs**

- **Redis `BRPOP` (blocking pop) over a sleep-poll loop** — the worker blocks on the queue with zero CPU burn between jobs, gets FIFO ordering for free, and scales horizontally by adding worker containers.
- **A single `status` column (queued/processing/completed/failed) over event-sourcing** — simpler to query, index, and reason about for an MVP than separate tables.
- **`og:image` + heuristic fallbacks over site-specific scrapers** — `og:image` is maintained by site owners for link previews, so it's a stable, high-quality target that survives redesigns.
- **Chrome MV3 service workers** — future-proof (Chrome is retiring persistent background pages), at the cost of re-establishing connections per user action since workers can be suspended.
- **pnpm workspaces over separate repos** — shared types reach both `web` and `extension` with no publish step.

---

### **Reliability & Edge Cases**

- **Worker crash mid-job** — a watchdog re-queues jobs stuck in `processing` for >2 min.
- **SPA storefronts (React/Next.js)** — a `MutationObserver` detects client-side route changes and re-runs detection.
- **Duplicate submissions** — idempotency on `(profile_id, product_image_url)` returns the existing `job_id`.
- **No `og:image` and no selector match** — extension surfaces a manual URL-input fallback.
- **Auth token expires while polling** — a `401` triggers a silent refresh; polling resumes seamlessly.

Validated with manual end-to-end testing across **Zara, ASOS, and H&M**, including a simulated 10s-slow worker to verify status-polling behavior.

---

### **Why It Connects to XR**

Tryl is built as a **multi-channel** product on a unified fitting profile: web today, **smart glasses** on the roadmap. The same "upload your fit once, see it anywhere" model points directly at wearable AR — the form factor explored in [[smartsight]] and the wearable-XR economics tackled in [[cortex]]. The async, edge-aware pipeline is the kind of infrastructure a glasses-based try-on would lean on.

---

### **Impact**

- Shipped a full **monorepo MVP** with 4 apps (web, extension, API, worker) sharing types/config via pnpm workspaces.
- Async pipeline **decouples slow AI generation** from the user request — status is instant, results arrive when ready.
- Extension works across **heterogeneous storefronts** via layered fallback detection.
- Redis `BRPOP` queue gives **FIFO ordering with zero idle CPU** and horizontal scalability.

---

### **Links**
- **Live**: [tryl.me](https://tryl.me)
- **Code**: [github.com/Dongckim/tryl-beta](https://github.com/Dongckim/tryl-beta)

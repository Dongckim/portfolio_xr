---
id: 0
title: 'A.P.E | AWS Platform Explorer — Open-Source Finder-style GUI for EC2 + S3'
description: 'Open-source on GitHub. A single 16MB Go binary that serves a Finder-style browser UI for EC2 file management and S3 browsing. SSH connect, drag-and-drop upload, Monaco edit, bucket browse — no SCP, no tab-switching, no install footprint.'
iconType: 'plane'
category: 'software'
youtubeUrl: ''
gifs:
  - '/project/ape.png'
technologies:
  - 'Go 1.26'
  - 'React 18'
  - 'TypeScript'
  - 'Tailwind CSS'
  - 'Vite'
  - 'golang.org/x/crypto/ssh'
  - 'github.com/pkg/sftp'
  - 'aws-sdk-go-v2'
  - 'Monaco Editor'
---

## Project Overview

|Live Demo — Drag-and-Drop EC2 + S3 Browser|
|:--:|
|![A.P.E demo](/project/ape.gif)|

**A.P.E (AWS Platform Explorer)** is a zero-install GUI for managing EC2 file systems and browsing S3 buckets. The entire application — Go backend + embedded React frontend + Monaco editor — ships as a **single 16MB binary** the user drops into `$PATH`. Run `ape`, the browser opens at `localhost:9000`, and the EC2 instance becomes a Finder-style file explorer.

> **🌱 Open Source** — A.P.E is released under an open-source license and free to use, fork, and contribute to on **[GitHub](https://github.com/Dongckim/A.P.E)**. Built solo, distributed publicly.

**Role**: Solo Engineer (full stack).

---

### **The Problem with EC2 File Management**

Managing files on an EC2 instance traditionally means juggling **three terminals**: `ssh` to navigate, `scp` to upload, and `vim`/`nano` to edit. Existing GUI tools (Cyberduck, Transmit) require separate installs, licensing, or lack S3 integration. The goal was **zero-install, zero-dependency, one-binary distribution** — without sacrificing a real desktop-grade UI.

| **Before (`scp` / `ssh` / `vim`)** | **After (A.P.E)** |
| :--- | :--- |
| Three terminals, multiple SSH handshakes | One binary, one browser tab |
| `scp ./file.tar.gz user@host:/tmp/` | Drag the file into the browser |
| `ssh user@host` → `vim /etc/nginx/conf` | Click the file → Monaco opens it in-place |
| `aws s3 ls s3://bucket --recursive` | Click the bucket icon → tree view |

---

### **Architecture — One Binary, Four Subsystems**

```
$ ape --host ec2-user@54.x.x.x --key ~/.ssh/id_rsa
        │
        ▼
┌────────────────────────────────────────────────────────────────┐
│  Go HTTP Server (single binary, 16 MB)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  //go:embed dist/*  →  React UI served from memory       │  │
│  └──────────────────────────────────────────────────────────┘  │
│         │                                                       │
│         ▼   REST API                                            │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │  SSH/SFTP Layer  │    │  AWS S3 Layer    │                  │
│  │  (crypto/ssh +   │    │  (aws-sdk-go-v2) │                  │
│  │   pkg/sftp)      │    │                  │                  │
│  └──────────┬───────┘    └─────────┬────────┘                  │
└─────────────┼──────────────────────┼───────────────────────────┘
              ▼                      ▼
        EC2 File System         S3 Buckets
```

---

### **Technical Implementation**

#### 1. Single-Binary Distribution via `//go:embed`
The React build (`dist/*`) is embedded into the Go binary at compile time. The Go server uses `http.FileServer(http.FS(embedFS))` to serve the UI directly from memory — **no separate web server, no Node.js runtime, no nginx**. User runs `ape`, gets a desktop-class app.

```go
//go:embed dist/*
var embedFS embed.FS
// ...
mux.Handle("/", http.FileServer(http.FS(embedFS)))
mux.HandleFunc("/api/upload", uploadHandler)
mux.HandleFunc("/api/s3/buckets", listBucketsHandler)
http.ListenAndServe(":9000", mux)
```

#### 2. Streaming Upload — Multipart → SFTP, Zero Local Temp File
The naive approach to `POST /api/upload` is: receive the multipart body, save it to `/tmp/`, then `scp` it up. That wastes disk I/O *and* doubles memory pressure on large files. A.P.E pipes the request body directly into the SFTP write stream:

```go
file, header, _ := r.FormFile("file")
remotePath := r.FormValue("path") + "/" + header.Filename
remoteFile, _ := sftpClient.Create(remotePath)
io.Copy(remoteFile, file)   // streams bytes, no temp file
```

This keeps memory footprint flat regardless of file size — uploading a 2 GB tarball uses the same RAM as a 2 KB config file.

#### 3. Real-Time Upload Progress via SSE
For drag-and-drop UX, the browser needs a progress bar. Instead of WebSockets (overkill for one-way data), A.P.E wraps the upload `io.Writer` and pushes byte-count updates over **Server-Sent Events**. The React drop zone subscribes via `EventSource` and animates the progress bar in real time.

#### 4. Monaco Editor — VS Code in the Browser
Right-click any remote file → **Open in Editor** → Monaco loads it client-side with full syntax highlighting, search, and keyboard shortcuts. The Go server stays stateless — it just streams the file bytes via `GET /api/file?path=`, and all editing happens in the browser. Saving sends the buffer back via `POST /api/file`.

#### 5. AWS SDK v2 (No CLI Dependency)
S3 operations use `aws-sdk-go-v2` directly instead of shelling out to `aws s3 ls`. Credentials are read from `~/.aws/credentials` or environment variables — the same auth model users already have. No `aws` CLI required.

---

### **Tradeoffs**

| **Decision** | **Why** |
| :--- | :--- |
| Embed React via `//go:embed` | One binary, no Node.js runtime, no separate static server |
| `io.Copy` for upload | Constant memory regardless of file size; no `/tmp` writes |
| SSE for progress | Avoids WebSocket complexity for one-way data flow |
| AWS SDK v2 (not CLI) | Same auth model, no extra install; richer error types |
| Monaco in-browser | Server stays stateless; editing UX matches VS Code |

---

### **Reliability**

- **CI**: GitHub Actions cross-compile matrix on every tagged release — `linux/amd64`, `darwin/arm64`, `darwin/amd64`, `windows/amd64`.
- **SSH auth edge cases**: missing key file (clear error), passphrase-protected key (prompt), permission denied (403 JSON).
- **SFTP edge cases**: upload to read-only path (permission error surfaced), `MkdirAll` is idempotent (no race on parallel uploads).
- **S3 edge cases**: no credentials configured (SDK error → 401), empty bucket (empty list, no crash).
- **Upload edge cases**: file >32MB hits multipart limit (413), non-UTF-8 filename safely percent-encoded.
- **Monaco edge cases**: binary file opened for edit falls back to hex view; very large files lazy-load in chunks.
- **Auto-recovery**: SFTP session reconnects on disconnect with exponential backoff (max 3 retries).
- **Error surface**: All API handlers return `{ error: string }` JSON → React toast notifications.

---

### **Impact**

- Eliminated the `scp` / `ssh` / `vim` triple-workflow for EC2 file management — drag, drop, edit, done.
- **Single 16MB binary**, zero runtime dependencies — distributable via `brew install` or direct GitHub Release download.
- Cross-platform CI release pipeline ships 4 targets per tag.
- Monaco editor brings VS Code-level syntax highlighting and remote-file search without any plugin.

---

### **Repo**
- **Code**: [github.com/Dongckim/A.P.E](https://github.com/Dongckim/A.P.E)

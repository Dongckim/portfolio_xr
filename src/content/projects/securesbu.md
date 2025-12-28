---
id: 1
title: 'SecureSBU | Backend - Teams-integrated Security Chatbot'
description: 'An AI-driven security chatbot for healthcare compliance. Led backend development and system architecture to deliver real-time, hallucination-free HIPAA policy intelligence.'
iconType: 'plane'
category: 'software'
youtubeUrl: 'g81AkDZfJF4'
gifs:
  - '/project/sbusecure.png'
technologies:
  - 'Node.js'
  - 'Express'
  - 'MySQL'
  - 'React'
  - 'TypeScript'
  - 'RAG (NeuralSeek)'
  - 'Webhook Integration'
---

## 🏥 Project Overview

|Service Thumbnail|
| :---: |
|![CPU Logic](/project/sbusecurethumb.png)|

**SecureSBU** is an **AI-powered security chatbot** designed for **Stony Brook University Hospital (SBUH)**.  
It delivers **instant, accurate, and actionable HIPAA & security policy guidance** directly within staff workflows.

Unlike static compliance documents, SecureSBU functions as a **living policy system** — always up-to-date, always grounded in verified sources.

> *Protecting Privacy. Empowering People. Elevating Healthcare Security.*

---

## **My Role | Team Lead & Backend Lead**

As the **Team Lead and Backend Engineer**, I was responsible for **system architecture, AI reliability, and operational workflow design**.

### **Key Responsibilities**
- Designed the overall backend architecture and data flow
- Implemented AI query pipelines with strict accuracy guarantees
- Led technical decision-making and coordinated frontend & AI integration
- Ensured the system met healthcare-grade reliability standards

---

## **The Core Problem: Compliance Knowledge Is Static, Risk Is Dynamic**

Healthcare organizations face severe risks from HIPAA violations — often caused by:
- Outdated policy knowledge
- Human error under time pressure
- Long, complex, frequently updated policy documents

Traditional solutions rely on **training and static PDFs**, which fail in real operational environments.

We reframed the problem as:

> **How can compliance information update itself and intervene at the exact moment of risk?**

---

## **Technical Architecture**

### **System Stack**
- **Frontend**: React + TypeScript  
- **Backend**: Node.js + Express  
- **Database**: MySQL  
- **AI Core**: NeuralSeek (Retrieval-Augmented Generation)

---

## **Key Backend & AI Design Decisions**

### 1. **Hallucination-Free AI via RAG**
Accuracy was non-negotiable.

- Implemented **Retrieval-Augmented Generation (RAG)** using NeuralSeek
- The chatbot queries **only the uploaded SBUH policy PDFs**
- No fine-tuning or retraining required when policies change
- Every response is grounded in verified policy text

This eliminated AI hallucinations — a critical requirement in healthcare security.

---

### 2. **Live Policy Update Pipeline**
- Designed the system so that uploading a new policy PDF immediately updates the chatbot’s knowledge base
- No redeployment, no downtime, no manual intervention
- Enabled **true real-time compliance intelligence**

This transformed policies from static documents into a **living system component**.

---

### 3. **Risk-Aware Workflow Logic**
SecureSBU is not a passive chatbot.

- Implemented **keyword-based risk detection** (e.g., PHI, personal email, data sharing)
- When high-risk intent is detected:
  - The bot interrupts the standard response flow
  - Surfaces a **“Report Incident”** action immediately

This shifts the system from *information provider* → *active security guardian*.

---

### 4. **Real-time Incident Reporting via Webhooks**
- Integrated **Discord Webhooks** for instant incident alerts
- Structured payloads sent directly to the security team
- Enabled near-zero latency from detection → report → response

This closed the loop between **human detection and organizational action**.

---

## **Key Outcomes**

- **100% policy-grounded responses** (no hallucinations)
- **Instant incident reporting** with real-time alerts
- Zero-maintenance policy updates
- Reduced cognitive load for healthcare staff under pressure

SecureSBU demonstrated how AI systems can **increase compliance without increasing user burden**.

---

## **Reflection**

This project reshaped how I think about AI systems in production environments.

I learned that:
- AI is only valuable when **trustworthy under worst-case scenarios**
- Accuracy is a system-level responsibility, not a model-level feature
- The most effective AI tools don’t just answer questions — they **trigger the right actions at the right moment**

By combining **RAG-based AI, backend workflow orchestration, and real-time communication**, SecureSBU represents my approach to building **enterprise-grade AI systems**: reliable, grounded, and deeply integrated into human workflows.

---

## 🔗 Links
- **DevPost**: [https://devpost.com/software/securesbu]
- **GitHub Repository**: [https://github.com/SBUhacks2025]
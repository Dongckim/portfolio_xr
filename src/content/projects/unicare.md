---
id: 2
title: 'UniCare | Frontend - Foreign Caregiver Recruitment Matching Platform'
description: 'A recruitment matching platform connecting foreign job seekers with caregiving companies, designed to address labor shortages in Korea’s elderly care industry.'
iconType: 'heart'
category: 'software'
serviceUrl: 'https://sprout-hackathon.vercel.app/'
gifs:
  - '/project/sessac.png'
technologies:
  - 'Next.js'
  - 'TypeScript'
  - 'React'
  - 'Tailwind CSS'
  - 'REST API'
  - 'Swagger'
---

## Project Overview

**UniCare** is a recruitment matching platform that connects **foreign job seekers** with **caregiving companies** in Korea.  
The project aims to address structural labor shortages in the elderly care industry while improving job accessibility and safety for foreign workers.

🏆 **Award**: *2024 Saessak Hackathon – Encouragement Prize*  
**Theme**: *“Walking Together with the Socially Vulnerable using Generative AI”*

|What I Developed|
| :---: |
|![CPU Logic](/project/unicare1.png)|
|![CPU Logic](/project/unicare2.png)|

---

## **The Challenge: Structural Mismatch in the Caregiving Industry**

Through desk research and interviews, we identified several core problems:

- **Severe labor shortages** in the caregiving sector due to aging demographics  
- **Fragmented recruitment processes** for foreign caregivers  
- **Information asymmetry** between job seekers and employers  
- **Language barriers** and lack of trust in existing platforms  

> Many foreign caregivers rely on informal brokers, increasing the risk of exploitation and mismatched employment.

---

## **My Role | Frontend Lead & Vice Team Lead**

**UniCare – React Website | Team of 5**

As the **Frontend Lead and Vice Team Lead**, I was responsible not only for implementation but also for frontend architecture decisions and cross-team coordination.

### **Key Responsibilities**
- Led frontend development and UI architecture design
- Coordinated feature scope and priorities between planning, backend, and AI teams
- Reviewed frontend code and ensured consistency in UX and state management patterns

### **Frontend Development**
- Developed core **React-based frontend** enabling users to interact with real-time service features
- Implemented **TanStack Query** for server-state management, optimizing data fetching, caching, and synchronization
- Used **Zustand** to manage global client-side state with minimal re-rendering and predictable state flows
- Designed scalable component structures to support rapid feature iteration during the hackathon

### **Real-time & AI Integration**
- Integrated **WebRTC-based real-time audio features** to support interactive user flows
- Collaborated with the AI team to integrate **AI-powered features** into the frontend
- Designed UI patterns that translate AI outputs into actionable, understandable user interactions
- Ensured asynchronous AI responses were handled gracefully using loading states, fallbacks, and optimistic UI patterns

---

|Development & Tool|
| :---: |
|![CPU Logic](/project/unicare3.png)|

## **Technical Focus: UX-Oriented Frontend Architecture**

Rather than treating UX as a purely visual layer, we approached it as a **system-level problem**:

- How quickly and predictably data appears to the user  
- How much cognitive effort is required to understand system feedback  
- How reliably users can interact with real-time and AI-driven features  

This led to architectural decisions prioritizing:
- Deterministic state flows
- Explicit user feedback for async operations
- Clear separation between server state, UI state, and AI-generated results

---

## **Reflection**

This project strengthened my perspective that **user experience is deeply tied to frontend system design**, not just interface aesthetics.

Through UniCare, I learned that meaningful UX emerges when:
- Asynchronous systems (APIs, AI inference, real-time streaming) behave predictably from the user’s perspective
- State transitions are transparent, minimizing uncertainty and user hesitation
- Interfaces guide users through complex processes without exposing underlying system complexity

Rather than focusing solely on visual polish, I concentrated on **reducing friction caused by latency, ambiguity, and state inconsistency**.  
UniCare reflects my interest in building **UX-driven frontend architectures** where technology feels responsive, reliable, and intuitive—even when powered by complex real-time and AI systems.

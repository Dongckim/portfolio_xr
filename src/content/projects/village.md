---
id: 3
title: 'Village | Frontend - Location-based Item Rental Platform'
description: 'A location-based peer-to-peer rental service. Led frontend development and improved client-side performance by 172% through architectural and rendering optimizations.'
iconType: 'map'
category: 'software'
youtubeUrl: 'P52dD59hvxI'
gifs:
  - '/project/village2.png'
technologies:
  - 'React'
  - 'JavaScript'
  - 'React Query'
  - 'Redux'
  - 'Styled-components'
  - 'WebSocket (STOMP / SockJS)'
  - 'AWS S3 / CloudFront'
---

## Project Overview

|Service Poster|
| :---: |
|![CPU Logic](/project/village2.png)|

**Village** is a **location-based item rental platform** that allows users to rent and lend personal items within nearby regions.  
Instead of purchasing infrequently used products, users can search, communicate, and transact directly with others in their area.

> *“버리지 말고, 합리적으로 빌리지.”*

---

## **My Role | Team Lead**

As a **Frontend Developer**, I led the client-side implementation with a strong focus on **performance, scalability, and scroll-heavy UX stability**.

### **Key Responsibilities**
- Led the service’s frontend section and core UI architecture
- Optimized rendering performance for image-heavy rental listings
- Designed and implemented infinite scroll and real-time interaction flows
- Collaborated closely with backend engineers to align API contracts and pagination logic

---

## **The Challenge: Performance Bottlenecks in Image-heavy Feeds**

Village’s core UX depended on **continuous browsing of rental listings**, which introduced several challenges:

- Excessive initial bundle size
- Layout shifts and jank during infinite scrolling
- High image payloads causing slow page loads
- Scroll offset breaks when dynamically loading content

These issues directly affected user retention and browsing continuity.

---

|Development & Tool|
| :---: |
|![CPU Logic](/project/village.png)|

## **Technical Solutions & Implementation**

### 1. **Lazy Loading & Code Refactoring**
- Applied route-level and component-level **lazy loading**
- Refactored unnecessary re-renders and deeply nested component structures
- Reduced JavaScript execution cost during initial page load

### 2. **Manual Image Compression Pipeline**
- Implemented a **custom image compression workflow** before upload
- Reduced image payload size without noticeable visual degradation
- Integrated compressed assets with **AWS S3 + CloudFront** for faster delivery

### 3. **No-Offset Infinite Scroll System**
- Designed a **manual infinite scroll logic** that avoids offset-based pagination issues
- Prevented duplicated or skipped items during rapid scroll interactions
- Maintained scroll position stability even with dynamic data loading

### 4. **Data & State Management**
- Used **React Query** for server-state caching and synchronization
- Managed UI and interaction states with **Redux**
- Ensured predictable state transitions during list updates and real-time events

---

## **Performance Impact**

Through these optimizations, we achieved:

- **172% frontend performance improvement**
- Significant reduction in initial page load time
- Smooth, interruption-free infinite scrolling experience
- Stable rendering even with high-volume image feeds

These improvements directly enhanced the usability of the platform’s primary browsing flow.

---

## **Reflection**

This project taught me that **frontend performance is inseparable from user experience**.

Rather than focusing solely on visual components, I approached UX as a function of:
- Rendering predictability
- Scroll stability
- Perceived responsiveness under real user behavior

By optimizing how and when content appears—especially in continuous browsing scenarios—I learned how **small architectural decisions compound into large UX gains**.

Village solidified my interest in building **performance-driven frontend systems**, where efficiency, scalability, and interaction smoothness define the quality of the user experience.

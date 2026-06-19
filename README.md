# Kin: Environmental Climate-Awareness App

## Chosen Vertical
Environmental Sustainability & Climate Awareness

## Overview
Kin is an interactive, smart web application designed to visually communicate the impact of daily choices on our environment. Instead of generic dashboards or charts, Kin features a living, breathing 3D Earth that physically reacts to user behavior. 

## Approach and Logic
The core logic of Kin is based on a dynamic "Climate Impact Score." 
- We use a responsive 3D WebGL environment built with React Three Fiber.
- As the user answers daily lifestyle questions (e.g., transportation, diet, plastic usage), the state engine calculates an impact delta.
- This score is directly piped into the 3D rendering pipeline. Positive scores tint the Earth lush green and clear the atmospheric weather, simulating sunshine and clean air. Negative scores tint the Earth a dry, reddish-brown and trigger heavy rain and smog particle systems.

## How the Solution Works
1. **The God-View (Outer Space):** The user is greeted with a hyper-realistic 3D Earth floating in space. The night-side city lights glow bioluminescent green to represent clean energy.
2. **Scroll Transition:** Utilizing scroll-based camera controls, scrolling down physically dives the camera through the atmosphere to the ground level.
3. **Interactive Questionnaire:** At the ground level, an overlaid glass-morphism UI asks the user questions about their daily habits.
4. **Real-time Feedback Engine:** Answering the questions instantly modifies the underlying score state. The 3D particle system (rain) and environmental lighting respond in real-time without reloading the page.

## Assumptions Made
- It is assumed the user has a modern web browser capable of rendering WebGL/Three.js contexts efficiently.
- For this prototype, the impact questions are hardcoded, but the state management is designed to easily integrate with a backend API for dynamic questions in the future.
- It is assumed the user is interacting via a desktop or mobile device with scroll/swipe capabilities to trigger the 3D camera dive.

## Tech Stack
- React / Vite
- Three.js
- React Three Fiber / Drei
- Framer Motion

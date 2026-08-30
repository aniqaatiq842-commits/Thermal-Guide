# 🌡️ ThermalGuide

### AI-Powered Outdoor Thermal Risk & Activity Guidance

ThermalGuide is an AI-powered climate-health application that helps users make better decisions about outdoor activities based on **location, time, environmental conditions, activity intensity, and AI-generated guidance**.

Instead of simply showing weather information, ThermalGuide turns environmental data into a practical answer:

> **"Given the conditions, my activity, and my planned time, what should I consider before going outside?"**

---

## ✨ Features

* 📍 Location-based environmental analysis
* 🌡️ Temperature analysis
* 🔥 Heat-index analysis
* 💧 Humidity information
* 🌫️ Air-quality information when available
* 🧠 Deterministic thermal-risk classification
* ✨ Gemini-powered recommendations
* ⏰ Time-aware activity analysis
* 🏃 Activity-specific risk evaluation
* 🔄 Multi-agent analysis workflow
* 🌐 Modern Next.js frontend
* ⚡ FastAPI backend

---

## 🏗️ Project Structure

```text
Thermal Guide/
│
├── backend/
│   ├── main.py
│   └── ...
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   └── ...
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   └── ...
│
├── requirements.txt
├── .gitignore
└── README.md
```

---

## 🔄 How ThermalGuide Works

```text
                    USER INPUT
                        │
                        ▼
               ┌─────────────────┐
               │  Location Agent │
               └────────┬────────┘
                        │
                        ▼
          ┌──────────────────────────┐
          │ Climate / Environment    │
          │ Agent                    │
          └────────────┬─────────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Thermal Decision │
              │ Agent            │
              └────────┬─────────┘
                       │
                       ▼
             ┌────────────────────┐
             │ AI Recommendation  │
             │ Agent              │
             └─────────┬──────────┘
                       │
                       ▼
             PERSONALIZED GUIDANCE
```

### 1. Location Agent

ThermalGuide converts the user's location into geographic coordinates using OpenStreetMap Nominatim.

### 2. Climate Agent

The application retrieves environmental information for the selected location and time using FortyGuard.

Environmental information can include:

* Temperature
* Heat index
* Apparent temperature
* Humidity
* Air quality

### 3. Thermal Decision Agent

ThermalGuide combines environmental conditions with the intensity of the selected activity.

The resulting thermal risk is classified as:

* 🟢 Low
* 🟡 Moderate
* 🟠 High
* 🔴 Extreme

### 4. AI Recommendation Agent

Google Gemini evaluates the environmental conditions and calculated risk to generate concise, practical guidance.

The recommendation can address:

* Whether the activity should be reconsidered
* Whether a cooler time should be selected
* Hydration
* Breaks
* Shade and cooling
* Heat exposure
* Air quality

If Gemini is unavailable, ThermalGuide uses a deterministic fallback recommendation.

---

## 🛠️ Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Python
* FastAPI
* Pydantic
* Requests

### External Services

* FortyGuard — environmental and thermal data
* Google Gemini — AI recommendations
* OpenStreetMap Nominatim — location geocoding

---

## 🚀 Running ThermalGuide Locally




---


```

---


## 🧠 Risk Classification

ThermalGuide evaluates temperature/heat conditions together with activity intensity.

Supported activity examples include:

* Walking
* Outdoor dining
* Camping
* Hiking
* Cycling
* Running

Higher-intensity activities receive a greater thermal load in the decision process.

---

## 🛡️ Safety

ThermalGuide is an **environmental guidance tool**, not a medical diagnostic system.

It does not diagnose medical conditions and should not replace professional medical advice.

During extreme environmental conditions, users should exercise appropriate caution and consider avoiding strenuous outdoor activity.

---

## 📌 Current Status

**Working local prototype**

The current version includes:

* Connected Next.js frontend
* FastAPI backend
* Location processing
* FortyGuard environmental analysis
* Deterministic thermal-risk engine
* Gemini recommendation system
* Fallback recommendations
* CORS configuration for local development

---

## 🎯 Project Vision

ThermalGuide aims to make climate-health information more actionable.

Traditional weather applications provide numbers such as:

> 101°F
> 70% humidity
> AQI 120

ThermalGuide goes one step further by asking:

> **What do these conditions mean for the activity I want to do?**

The goal is to transform complex environmental information into simple, contextual, and actionable guidance.

---

## 👩‍💻 Development

This project is being developed as an AI-powered climate-health application combining:

**Climate Data + AI + Decision Intelligence + Human-Centered UX**

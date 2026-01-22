# 🎮 Paddle Ball Bouncing Game - IoT Final Exam Project

A real-time paddle ball game implemented on ESP32 with an 8×8 LED matrix display and online score tracking via a web-based scorekeeper application.

## 📚 Academic Information

**Project Title:** Paddle Ball Bouncing Game  
**Module:** Programming Internet of Things  
**University:** Millat Umidi University (MU)  
**Lecturer:** Lazizbek Yusupov  
**Semester:** Fall 2025

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Hardware Components](#hardware-components)
- [Software Components](#software-components)
- [Setup Instructions](#setup-instructions)
- [Gameplay](#gameplay)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

---

## 🎯 Overview

This project consists of two main components:

1. **ESP32 Game Device**: Physical game running on ESP32 microcontroller with LED matrix display
2. **Web Scorekeeper**: React-based web application with Express backend for real-time score tracking

### Features

- ✅ 8×8 LED matrix display
- ✅ Physical button controls (left, right, start)
- ✅ Buzzer sound effects
- ✅ WiFi connectivity
- ✅ Real-time score API integration
- ✅ Web-based scorekeeper dashboard
- ✅ Increasing difficulty (speed increases with score)

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    SYSTEM OVERVIEW                      │
└─────────────────────────────────────────────────────────┘

   ┌─────────────────┐
   │   ESP32 Device  │
   │   (Game Core)   │
   │                 │
   │  ┌───────────┐  │
   │  │ 8x8 LED   │  │
   │  │  Matrix   │  │
   │  └───────────┘  │
   │                 │
   │  ┌───────────┐  │
   │  │ Buttons   │  │
   │  │ + Buzzer  │  │
   │  └───────────┘  │
   └────────┬────────┘
            │ WiFi
            │ HTTP POST
            │ /api/v1/score
            ▼
   ┌─────────────────┐
   │  Score API      │
   │  (Express)      │
   │  Port: 3001     │
   └────────┬────────┘
            │ REST API
            │ GET/POST/DELETE
            ▼
   ┌─────────────────┐
   │  Web Dashboard  │
   │  (React + Vite) │
   │  UI Display     │
   └─────────────────┘
```

### Data Flow

```
┌──────────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐
│  Player  │──────▶│   ESP32  │──────▶│   API    │──────▶│    Web   │
│  Input   │       │   Game   │       │  Server  │       │ Dashboard│
└──────────┘       └──────────┘       └──────────┘       └──────────┘
  Button             Game Over          POST Score         Display
  Press              Event              Update             Current/High
                     ↓
                     Send Score
                     via HTTP
```

---

## 🔧 Hardware Components

### ESP32 Pin Configuration

| Component | Pin(s) | Description |
|-----------|--------|-------------|
| **LED Matrix Rows** | 21, 22, 23, 25, 26, 27, 32, 33 | 8 row control pins |
| **LED Matrix Cols** | 4, 5, 13, 14, 16, 17, 18, 19 | 8 column control pins |
| **Left Button** | 34 | Move paddle left |
| **Right Button** | 35 | Move paddle right |
| **Start Button** | 12 | Start/restart game |
| **Buzzer** | 15 | Sound effects |

### Wiring Diagram

```
                    ┌─────────────┐
                    │    ESP32    │
                    │             │
    Button Left ────┤ GPIO 34     │
    Button Right ───┤ GPIO 35     │
    Button Start ───┤ GPIO 12     │
    Buzzer ─────────┤ GPIO 15     │
                    │             │
    LED Matrix ─────┤ GPIO 21-33  │ (Rows)
    LED Matrix ─────┤ GPIO 4-19   │ (Cols)
                    │             │
                    └─────────────┘
```

---

## 💻 Software Components

### 1. ESP32 Game Core (`core/main.cpp`)

**Technology:** C++ with Arduino framework

**Key Features:**
- Multiplexed LED display refresh (1kHz)
- Debounced button input handling
- WiFi connection management
- HTTP POST requests for score submission
- Ball physics and collision detection
- Progressive difficulty system

**Game States:**
```
┌─────────┐    Start     ┌─────────┐    Hit      ┌─────────┐
│  Ready  │─────────────▶│ Playing │────────────▶│ Playing │
└─────────┘    Button    └─────────┘   Paddle    └─────────┘
                              │                        │
                              │ Miss                   │
                              │ Paddle                 │
                              ▼                        │
                         ┌─────────┐                   │
                         │Game Over│◀──────────────────┘
                         └─────────┘
                              │
                              │ Send Score
                              ▼
                         ┌─────────┐
                         │Show Score│
                         │Animation │
                         └─────────┘
```

### 2. Score API Server (`scorekeeper/server.js`)

**Technology:** Node.js + Express

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/score` | Get current and high scores |
| POST | `/api/v1/score` | Submit new score |
| DELETE | `/api/v1/score` | Reset current score |

**State Management:**
```javascript
{
  current: 0,    // Current game score
  high: 0        // All-time high score
}
```

### 3. Web Dashboard (`scorekeeper/`)

**Technology:** React 19 + TypeScript + Vite + Tailwind CSS

**Components:**
- `App.tsx` - Main application container
- `StatCard.tsx` - Score display cards
- `Button.tsx` - Reusable button component
- `scoreService.ts` - API communication layer

---

## 🚀 Setup Instructions

### Prerequisites

- Arduino IDE or PlatformIO
- Node.js 18+ and npm
- ESP32 development board
- 8×8 LED matrix
- Buttons and buzzer
- WiFi network

### Step 1: Configure ESP32

1. **Update WiFi credentials** in `core/main.cpp`:
```cpp
const char* WIFI_SSID = "YourWiFiName";
const char* WIFI_PASS = "YourPassword";
const char* SERVER_URL = "http://your-server-ip:3001/api/v1/score";
```

2. **Upload to ESP32:**
   - Open `core/main.cpp` in Arduino IDE
   - Select board: ESP32 Dev Module
   - Select port and upload

### Step 2: Setup Score Server

```bash
cd scorekeeper
npm install
node server.js
```

Server will run on `http://localhost:3001`

### Step 3: Launch Web Dashboard

```bash
cd scorekeeper
npm run dev
```

Dashboard will run on `http://localhost:5173`

### Step 4: Expose Server (Optional)

For remote ESP32 access, use a tunneling service:

```bash
# Using jprq (as in project)
jprq http 3001

# Or ngrok
ngrok http 3001
```

Update `SERVER_URL` in ESP32 code with the public URL.

---

## 🎮 Gameplay

### How to Play

1. **Start Game**: Press start button on ESP32
2. **Control Paddle**: Use left/right buttons to move the 3-pixel paddle at the bottom
3. **Objective**: Bounce the falling ball with the paddle
4. **Scoring**: Each successful bounce = +1 score
5. **Difficulty**: Game speed increases with score (tickSpeed decreases)
6. **Game Over**: Miss the ball with paddle → score sent to API → animation displays score

### Game Mechanics

```
┌─────────────────┐
│ ● Ball          │ ← Falls down with velocity
│                 │
│                 │
│                 │
│                 │
│                 │
│                 │
│   ===  Paddle   │ ← 3 pixels wide, controlled by buttons
└─────────────────┘
```

**Physics:**
- Ball bounces off left/right walls
- Ball reflects off top wall
- Ball direction changes based on paddle hit position:
  - Hit left edge → deflects left
  - Hit center → bounces straight up
  - Hit right edge → deflects right

**Speed Progression:**
```
Initial: 350ms/tick
Formula: tickSpeed -= 10 per score
Minimum: 60ms/tick (fastest)
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### GET /score

**Response:**
```json
{
  "success": true,
  "currentScore": 15,
  "highScore": 42
}
```

### POST /score

**Request:**
```json
{
  "score": 15
}
```

**Response:**
```json
{
  "success": true,
  "currentScore": 15,
  "highScore": 42
}
```

**Note:** Score replaces current (not incremental)

### DELETE /score

**Response:**
```json
{
  "success": true,
  "currentScore": 0,
  "highScore": 42
}
```

**Note:** Resets current score only, preserves high score

---

## 📁 Project Structure

```
iot-game-final/
│
├── core/
│   └── main.cpp                 # ESP32 game code
│
└── scorekeeper/
    ├── server.js                # Express API server
    ├── package.json             # Node dependencies
    ├── vite.config.ts           # Vite configuration
    ├── tsconfig.json            # TypeScript config
    ├── index.html               # HTML entry point
    ├── index.tsx                # React entry point
    ├── App.tsx                  # Main React app
    ├── types.ts                 # TypeScript types
    │
    ├── components/
    │   ├── Button.tsx           # Button component
    │   └── StatCard.tsx         # Score card component
    │
    └── services/
        └── scoreService.ts      # API client service
```

---

## 🔍 Technical Details

### LED Matrix Display

**Refresh Rate:** 1000 Hz (1ms per refresh)
**Method:** Row scanning multiplexing
**Display Buffer:** 8×8 boolean array

```cpp
// Refresh loop (runs every 1ms)
void refreshDisplay() {
  // Turn off all rows
  // Set column states for current row
  // Turn on current row
  // Cycle to next row
}
```

### Button Debouncing

Uses software debouncing with counter-based approach:
- Samples every 10ms
- Requires 5 consecutive LOW readings (50ms) to register press
- Prevents false triggers from electrical noise

### WiFi & HTTP

```cpp
connectWiFi()  → Connect to network (15s timeout)
sendScore()    → POST JSON to API endpoint
```

### Score Display Animation

Scrolling digits using 5×7 bitmap font:
- Each digit: 5 columns wide
- Scrolls right-to-left
- Displays after game over

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| ESP32 won't connect to WiFi | Check SSID/password, ensure 2.4GHz network |
| LED matrix not displaying | Verify pin connections and polarity settings |
| Score not updating | Check server URL, ensure server is running |
| Buttons not responding | Test with multimeter, check pull-up resistors |
| CORS errors on web dashboard | Ensure CORS middleware is enabled in server.js |

---

## 📝 License

This project is for educational purposes (IoT Final Exam).

---

## 👨‍💻 Author

Developed as part of Programming Internet of Things course final examination.

**Academic Details:**
- **University:** Millat Umidi University (MU)
- **Module:** Programming Internet of Things
- **Lecturer:** Lazizbek Yusupov
- **Semester:** Fall 2025

---

**Happy Gaming! 🎮**

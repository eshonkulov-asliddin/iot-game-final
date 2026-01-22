/**
 * Simple Node/Express server to host the Score API.
 * Run this with: node server.js
 * Make sure to install express: npm install express cors
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory state (resets when server restarts)
let state = {
  current: 0,
  high: 0
};

// GET /api/v1/score - Get current state
app.get('/api/v1/score', (req, res) => {
  res.json({
    success: true,
    currentScore: state.current,
    highScore: state.high
  });
});

// POST /api/v1/score - Update score
app.post('/api/v1/score', (req, res) => {
  const { score } = req.body;
  
  if (typeof score === 'number') {
    state.current = score; // Replace, not increment
    if (state.current > state.high) {
      state.high = state.current;
    }
  }

  res.json({
    success: true,
    currentScore: state.current,
    highScore: state.high
  });
});

// DELETE /api/v1/score - Reset current score (keep high score)
app.delete('/api/v1/score', (req, res) => {
  state.current = 0;
  res.json({
    success: true,
    currentScore: state.current,
    highScore: state.high
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
import { ScorePayload, ScoreResponse } from '../types';

// Constants for local storage keys to simulate persistence if API fails
const STORAGE_KEY_HIGH_SCORE = 'app_high_score';
const STORAGE_KEY_CURRENT_SCORE = 'app_current_score';

/**
 * Mocks the backend behavior for demonstration purposes since we don't have a real server.
 */
const mockBackend = async (payload: ScorePayload): Promise<ScoreResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const currentStored = parseInt(localStorage.getItem(STORAGE_KEY_CURRENT_SCORE) || '0', 10);
      const highStored = parseInt(localStorage.getItem(STORAGE_KEY_HIGH_SCORE) || '0', 10);

      const newScore = payload.score; // Use the score directly, don't add to previous
      const newHighScore = Math.max(newScore, highStored);

      localStorage.setItem(STORAGE_KEY_CURRENT_SCORE, newScore.toString());
      localStorage.setItem(STORAGE_KEY_HIGH_SCORE, newHighScore.toString());

      resolve({
        success: true,
        currentScore: newScore,
        highScore: newHighScore,
      });
    }, 400); 
  });
};

/**
 * Sends the score update to the API.
 */
export const updateScore = async (payload: ScorePayload): Promise<ScoreResponse> => {
  try {
    const response = await fetch('/api/v1/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn('API unavailable, switching to local simulation mode.', error);
    return mockBackend(payload);
  }
};

/**
 * Resets the score
 */
export const resetScore = async (): Promise<ScoreResponse> => {
   try {
     const response = await fetch('/api/v1/score', { method: 'DELETE' });
     if (!response.ok) throw new Error('API Error');
     return await response.json();
   } catch (error) {
     console.warn('API unavailable, resetting locally.');
     // Fallback
     localStorage.setItem(STORAGE_KEY_CURRENT_SCORE, '0');
     const highStored = parseInt(localStorage.getItem(STORAGE_KEY_HIGH_SCORE) || '0', 10);
     return { success: true, currentScore: 0, highScore: highStored };
   }
}

/**
 * Gets the initial score state from server or local storage
 */
export const getInitialScore = async (): Promise<ScoreResponse> => {
    try {
      const response = await fetch('/api/v1/score');
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (error) {
      console.warn('API unavailable, loading local state.');
      // Fallback
      const currentStored = parseInt(localStorage.getItem(STORAGE_KEY_CURRENT_SCORE) || '0', 10);
      const highStored = parseInt(localStorage.getItem(STORAGE_KEY_HIGH_SCORE) || '0', 10);
      
      return {
          success: true,
          currentScore: currentStored,
          highScore: highStored
      }
    }
}
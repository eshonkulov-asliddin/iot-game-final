import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './components/Button';
import { StatCard } from './components/StatCard';
import { updateScore, resetScore, getInitialScore } from './services/scoreService';
import { ScoreState } from './types';

const App: React.FC = () => {
  const [scoreData, setScoreData] = useState<ScoreState>({ current: 0, high: 0 });
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const init = async () => {
      try {
        const data = await getInitialScore();
        setScoreData({ current: data.currentScore, high: data.highScore });
      } catch (e) {
        console.error("Failed to load initial score", e);
      }
    };
    init();
  }, []);

  const handleAddScore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // API call: POST { "score": 1 }
      const response = await updateScore({ score: 1 });
      
      if (response.success) {
        setScoreData({
          current: response.currentScore,
          high: response.highScore,
        });
      } else {
        setError(response.message || 'Failed to update score');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = useCallback(async () => {
      setResetting(true);
      try {
          const response = await resetScore();
          if (response.success) {
            setScoreData(prev => ({ ...prev, current: response.currentScore }));
          }
      } catch (err) {
          setError('Failed to reset score.');
      } finally {
          setResetting(false);
      }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/50">
      <div className="w-full max-w-md">
        
        {/* Header Section */}
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Score Tracker
          </h1>
          <p className="text-slate-500">
            Keep track of your wins. Simple & Fast.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white p-6 sm:p-8 space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard 
              label="Current Score" 
              value={scoreData.current} 
              highlight={true}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            <StatCard 
              label="High Score" 
              value={scoreData.high}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              }
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center">
               <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               {error}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              onClick={handleAddScore} 
              isLoading={loading} 
              className="w-full h-14 text-lg shadow-indigo-200"
            >
              Add Point (+1)
            </Button>
            
            <div className="flex justify-center">
                <Button 
                    onClick={handleReset}
                    variant="secondary"
                    isLoading={resetting}
                    className="w-full text-xs text-slate-400 hover:text-slate-600 border-transparent bg-transparent shadow-none hover:bg-slate-100/50"
                    disabled={scoreData.current === 0}
                >
                    Reset Current Session
                </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
                Data persists locally if API is unavailable.
            </p>
        </div>
      </div>
    </div>
  );
};

export default App;
// File: src/pages/PauseJob.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const PauseJob: React.FC = () => {
  const { id } = useParams();
  const [duration, setDuration] = useState(3600); // default 1 hour
  const [remaining, setRemaining] = useState(duration);
  const [status, setStatus] = useState('Paused');
  const [timerStarted, setTimerStarted] = useState(false);

  useEffect(() => {
    if (!timerStarted) return;
    setRemaining(duration);
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('In Progress');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timerStarted, duration]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDuration = parseInt(e.target.value);
    setDuration(newDuration);
    setRemaining(newDuration);
    setTimerStarted(false);
    setStatus('Paused');
  };

  const startTimer = () => {
    setTimerStarted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md text-center w-80">
        <h1 className="text-2xl font-bold mb-4">Job #{id} is {status}</h1>

        {!timerStarted && (
          <>
            <label className="block mb-2 font-medium">Select Pause Duration:</label>
            <select
              onChange={handleDurationChange}
              value={duration}
              className="w-full p-2 border rounded mb-4"
            >
              <option value={3600}>1 Hour</option>
              <option value={7200}>2 Hours</option>
              <option value={86400}>1 Day</option>
            </select>
            <button
              onClick={startTimer}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            >
              Start Pause
            </button>
          </>
        )}

        {timerStarted && (
          <>
            <p className="text-lg mb-2">Resumes automatically after:</p>
            <p className="text-3xl font-mono text-blue-600">{formatTime(remaining)}</p>
            {remaining === 0 && (
              <p className="text-green-600 mt-4 font-semibold">Job is now In Progress</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PauseJob;
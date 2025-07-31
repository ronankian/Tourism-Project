import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ 
  seconds = 60, 
  onComplete, 
  onStart, 
  isActive = false,
  className = "",
  buttonText = "Send Code",
  disabledText = "Resend in"
}) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning, setIsRunning] = useState(isActive);

  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      setTimeLeft(seconds);
      if (onComplete) onComplete();
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, seconds, onComplete]);

  const handleStart = () => {
    setIsRunning(true);
    if (onStart) onStart();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <button
      type="button"
      onClick={handleStart}
      disabled={isRunning}
      className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isRunning
          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      } ${className}`}
    >
      {isRunning ? `${disabledText} ${formatTime(timeLeft)}` : buttonText}
    </button>
  );
};

export default CountdownTimer; 
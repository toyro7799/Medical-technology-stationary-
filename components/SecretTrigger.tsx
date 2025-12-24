import React, { useState, useEffect } from 'react';

interface SecretTriggerProps {
  onUnlock: () => void;
  children: React.ReactNode;
  className?: string;
}

const SecretTrigger: React.FC<SecretTriggerProps> = ({ onUnlock, children, className }) => {
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    if (clicks === 0) return;

    // Reset clicks if user stops clicking for 1 second
    const timer = setTimeout(() => {
      setClicks(0);
    }, 1000);

    if (clicks >= 5) {
      onUnlock();
      setClicks(0); // Reset after unlock
    }

    return () => clearTimeout(timer);
  }, [clicks, onUnlock]);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent default if it's a link, but usually this wraps a logo div
    // e.preventDefault(); 
    setClicks(prev => prev + 1);
  };

  return (
    <div 
      onClick={handleClick} 
      className={`cursor-pointer select-none active:scale-95 transition-transform ${className || ''}`}
      title={clicks > 0 ? `${5 - clicks} more...` : ''}
    >
      {children}
    </div>
  );
};

export default SecretTrigger;
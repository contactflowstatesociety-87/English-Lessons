
import React from 'react';

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  return <div className="confetti-piece" style={style}></div>;
};

const Confetti: React.FC = () => {
  const confettiCount = 100;
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

  const pieces = Array.from({ length: confettiCount }).map((_, index) => {
    const style: React.CSSProperties = {
      left: `${Math.random() * 100}vw`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      animationDuration: `${3 + Math.random() * 4}s`,
      animationDelay: `${Math.random() * 5}s`,
      transform: `rotate(${Math.random() * 360}deg)`,
      width: `${Math.floor(Math.random() * (12 - 6 + 1) + 6)}px`,
      height: `${Math.floor(Math.random() * (12 - 6 + 1) + 6)}px`,
      opacity: Math.random() + 0.5,
    };
    return <ConfettiPiece key={index} style={style} />;
  });

  return <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">{pieces}</div>;
};

export default Confetti;

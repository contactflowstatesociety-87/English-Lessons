
import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // allow fade-out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  const baseClasses = 'fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white transition-all duration-300 transform';
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
  };
  const visibilityClasses = visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5';

  return (
    <div role="alert" className={`${baseClasses} ${typeClasses[type]} ${visibilityClasses}`}>
      <div className="flex items-center">
        <span className="font-semibold">{type === 'success' ? 'Success' : 'Error'}:</span>
        <p className="ml-2">{message}</p>
        <button onClick={onClose} className="ml-4 text-xl font-bold" aria-label="Close notification">&times;</button>
      </div>
    </div>
  );
};

export default Toast;
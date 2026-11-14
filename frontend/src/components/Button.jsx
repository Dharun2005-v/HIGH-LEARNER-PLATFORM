import React from 'react';

export default function Button({ children, onClick, disabled, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}


import React from 'react';

interface KeypadButtonProps {
  label: string;
  onClick: (val: string) => void;
  className?: string;
  type?: 'number' | 'operator' | 'action' | 'scientific';
}

const KeypadButton: React.FC<KeypadButtonProps> = ({ label, onClick, className = '', type = 'number' }) => {
  const baseStyles = "h-14 w-full rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200 active:scale-90 select-none shadow-sm";
  
  const typeStyles = {
    number: "bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 border border-slate-700/50",
    operator: "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30",
    action: "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50",
    scientific: "bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30 text-xs italic"
  };

  const getStyle = () => {
    if (label === '=') return "bg-gradient-to-br from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 border-none text-lg";
    if (label === 'C') return "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30";
    return typeStyles[type];
  };

  return (
    <button 
      onClick={() => onClick(label)}
      className={`${baseStyles} ${getStyle()} ${className}`}
    >
      {label}
    </button>
  );
};

export default KeypadButton;

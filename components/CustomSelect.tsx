import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomSelectProps {
  label?: string;
  value: string | number;
  onChange: (value: any) => void;
  options: (string | number)[];
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  icon,
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string | number) => {
    if (disabled) return;
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 ml-1">
          {label}
        </label>
      )}
      
      {/* Trigger Button */}
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          relative w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all cursor-pointer select-none
          ${disabled 
            ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" 
            : isOpen 
              ? "bg-white border-teal-500 ring-4 ring-teal-500/10 shadow-sm" 
              : "bg-slate-50/50 border-slate-200 hover:bg-white hover:border-slate-300 text-slate-700 shadow-sm"
          }
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {icon && (
            <span className={`transition-colors ${isOpen || value ? 'text-teal-600' : 'text-slate-400'}`}>
              {icon}
            </span>
          )}
          <span className={`block truncate ${!value ? 'text-slate-400' : 'text-slate-800 font-medium'}`}>
            {value || placeholder}
          </span>
        </div>
        
        <ChevronDown 
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-teal-500' : ''}`} 
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 top-[calc(100%+8px)] bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto origin-top animate-[dropdownOpen_0.2s_ease-out]">
          <div className="p-1">
            {options.length > 0 ? (
              options.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm font-medium
                    ${option === value 
                      ? "bg-teal-50 text-teal-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <span className="truncate">{option}</span>
                  {option === value && <Check className="w-4 h-4 text-teal-600" />}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-slate-400 text-sm">No options available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
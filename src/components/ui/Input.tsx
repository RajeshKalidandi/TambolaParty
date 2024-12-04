import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label,
    error,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
    ...props 
  }, ref) => {
    const baseStyles = "rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A237E] focus:border-transparent transition-all duration-200";
    const errorStyles = error ? "border-red-300 focus:ring-red-200" : "";
    const iconStyles = Icon ? (iconPosition === 'left' ? "pl-10" : "pr-10") : "";
    const widthStyles = fullWidth ? "w-full" : "";

    return (
      <div className={`${widthStyles}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`
              ${baseStyles}
              ${errorStyles}
              ${iconStyles}
              ${className}
              px-4 py-2 w-full
              placeholder:text-gray-400
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            `}
            {...props}
          />
          {Icon && (
            <div 
              className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${
                iconPosition === 'left' ? 'left-3' : 'right-3'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

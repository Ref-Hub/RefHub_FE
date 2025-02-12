// src/components/common/Input.tsx
import { forwardRef, useState, KeyboardEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  isLoading?: boolean;
  isValid?: boolean;
  numbersOnly?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  size = 'md',
  rightElement,
  leftElement,
  isLoading,
  isValid,
  numbersOnly,
  type,
  disabled,
  className = '',
  onKeyPress,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2',
    lg: 'px-4 py-3 text-lg'
  };

  const getBorderColor = () => {
    if (error) return 'border-red-500 focus:border-red-500 focus:ring-red-500';
    if (isValid) return 'border-green-500 focus:border-green-500 focus:ring-green-500';
    return 'border-gray-300 focus:border-primary focus:ring-primary';
  };

  const baseInputStyles = `
    w-full
    rounded-lg
    bg-white
    border
    focus:outline-none
    focus:ring-2
    focus:ring-opacity-50
    disabled:bg-gray-50
    disabled:cursor-not-allowed
    transition-colors
    duration-200
    ${getBorderColor()}
    ${leftElement ? 'pl-10' : ''}
    ${rightElement || type === 'password' ? 'pr-10' : ''}
    ${sizeStyles[size]}
    ${className}
  `;

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (numbersOnly && !/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
    onKeyPress?.(e);
  };

  const renderPasswordToggle = type === 'password' && (
    <button
      type="button"
      onClick={() => setShowPassword(prev => !prev)}
      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
    >
      {showPassword ? (
        <EyeOff className="w-5 h-5" />
      ) : (
        <Eye className="w-5 h-5" />
      )}
    </button>
  );

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {leftElement && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            {leftElement}
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          disabled={disabled || isLoading}
          className={baseInputStyles}
          onKeyPress={handleKeyPress}
          {...props}
        />
        {renderPasswordToggle || (rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        ))}
      </div>
      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
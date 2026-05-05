import React, { forwardRef, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, className = '', type = 'text', id, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    const borderClass = error
      ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/15'
      : 'border-[#D4D4D4] focus:border-[#D946EF] focus:ring-[#D946EF]/15';

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="font-[Nunito] text-[13px] font-[600] text-[#171717] select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#A3A3A3] pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            type={inputType}
            className={`
              w-full h-[44px] bg-white
              border-[1.5px] ${borderClass}
              text-[#171717] placeholder:text-[#A3A3A3]
              rounded-[12px]
              ${leftIcon ? 'pl-10' : 'pl-4'}
              ${isPassword ? 'pr-11' : 'pr-4'}
              font-[Nunito] text-[16px]
              outline-none
              ring-[3px] ring-transparent
              focus:ring-[3px]
              transition-all duration-200
              disabled:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3.5 text-[#A3A3A3] hover:text-[#525252] transition-colors cursor-pointer"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {error && (
          <p className="font-[Nunito] text-[12px] text-[#EF4444] flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="font-[Nunito] text-[12px] text-[#525252]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

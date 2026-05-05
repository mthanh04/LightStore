import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#D946EF] text-white hover:bg-[#C026D3] active:bg-[#A21CAF] shadow-medium hover:shadow-large',
  secondary:
    'bg-transparent text-[#D946EF] border-2 border-[#D946EF] hover:bg-[#FDF4FF]',
  ghost:
    'bg-transparent text-[#525252] hover:bg-[#F5F5F5]',
  destructive:
    'bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-medium',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-[34px] px-[18px] text-[13px]',
  md: 'h-[42px] px-[28px] text-[15px]',
  lg: 'h-[50px] px-[36px] text-[15px]',
};

const Spinner = () => (
  <svg
    className="animate-spin w-4 h-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12" cy="12" r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-[700] font-[Nunito] transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D946EF] focus-visible:ring-offset-2';

  const disabledClass =
    disabled || isLoading ? 'opacity-40 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      className={`${base} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledClass} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  );
};

export default Button;

import { COLORS } from '@/constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children,
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 cursor-pointer';
  
  const variants = {
    primary: `gradient-bg text-black hover:opacity-90`,
    secondary: `bg-[${COLORS.background.card}] text-white border border-[${COLORS.border.default}] hover:border-[${COLORS.border.hover}]`,
    outline: 'border border-[#F7C2FF] text-[#F7C2FF] hover:bg-[#F7C2FF]/10',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{
        background: variant === 'primary' ? `linear-gradient(135deg, ${COLORS.lifi.pink}, ${COLORS.lifi.blue})` : undefined,
        borderColor: variant === 'secondary' ? COLORS.border.default : variant === 'outline' ? COLORS.lifi.pink : undefined,
        color: variant === 'outline' ? COLORS.lifi.pink : undefined,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

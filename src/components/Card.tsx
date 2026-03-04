interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div 
      className={`
        bg-[#1A1A24] rounded-2xl border border-[#2A2A35] p-6
        ${hover ? 'transition-all duration-300 hover:border-[#3A3A48] hover:transform hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

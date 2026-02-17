import React from 'react';

interface LogoProps {
  className?: string;
  isHighContrast?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", isHighContrast }) => {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Netra Vision AI Logo">
      {/* Outer Eye Shape */}
      <path 
        d="M10 50 C 30 15 70 15 90 50 C 70 85 30 85 10 50 Z" 
        stroke="currentColor" 
        strokeWidth="7" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={isHighContrast ? "text-black" : "text-[#1e5aa0] dark:text-blue-500"}
      />
      
      {/* Inner Retina Circle */}
      <circle 
        cx="50" 
        cy="50" 
        r="20" 
        stroke="currentColor" 
        strokeWidth="5"
        className={isHighContrast ? "text-black" : "text-[#1e5aa0] dark:text-blue-500"}
      />
      
      {/* Retinal Veins - Stylized Branching */}
      <path 
        d="M35 50 L 58 50 M 58 50 L 65 44 M 58 50 L 65 56 M 45 50 L 52 42 M 45 50 L 52 58" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={isHighContrast ? "text-black" : "text-[#1e5aa0] dark:text-blue-400"}
      />
      
      {/* Orange Indicator Dot - Specific Positioning */}
      <circle 
        cx="68" 
        cy="66" 
        r="5" 
        fill={isHighContrast ? "black" : "#F97316"}
        stroke={isHighContrast ? "transparent" : "white"}
        strokeWidth="1"
      />
    </svg>
  );
};

export default Logo;
import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass';
  hover?: boolean;
  className?: string;
}

const Card = ({ 
  children, 
  variant = 'default',
  hover = true,
  className = '' 
}: CardProps) => {
  const baseStyles = "rounded-2xl overflow-hidden";
  
  const variants = {
    default: "bg-white shadow-lg",
    gradient: "bg-gradient-to-br from-white to-gray-50 shadow-lg",
    glass: "bg-white/10 backdrop-blur-md border border-white/20"
  };

  const hoverStyles = hover 
    ? "hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" 
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${hoverStyles}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ 
  children,
  className = '' 
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ 
  children,
  className = '' 
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h3 className={`text-2xl font-bold text-gray-900 ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ 
  children,
  className = '' 
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p className={`mt-2 text-gray-600 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ 
  children,
  className = '' 
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ 
  children,
  className = '' 
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`p-6 pt-0 flex items-center ${className}`}>
    {children}
  </div>
);

export default Card;

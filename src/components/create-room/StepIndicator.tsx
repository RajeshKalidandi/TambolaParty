import React from 'react';
import { Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="relative mb-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
      
      <div className="relative flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 flex items-center">
            <div className="relative flex-shrink-0">
              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-full blur-lg transition-opacity duration-300
                ${index < currentStep 
                  ? 'bg-[#FFD700] opacity-50' 
                  : index === currentStep 
                    ? 'bg-[#FF5722] opacity-50' 
                    : 'opacity-0'}`} 
              />
              
              <motion.div 
                initial={false}
                animate={{
                  scale: index === currentStep ? [1, 1.1, 1] : 1,
                  transition: {
                    duration: 0.5,
                    repeat: index === currentStep ? Infinity : 0,
                    repeatType: "reverse"
                  }
                }}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full 
                  ${index < currentStep 
                    ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA000]' 
                    : index === currentStep 
                      ? 'bg-gradient-to-br from-[#FF5722] to-[#FF8A65]' 
                      : 'bg-black/30 backdrop-blur-xl border border-white/10'} 
                  text-white shadow-lg transition-all duration-300`}
              >
                {index < currentStep ? (
                  <Check className="w-6 h-6" />
                ) : index === currentStep ? (
                  <Star className="w-6 h-6" />
                ) : (
                  <span className="text-lg font-semibold">{index + 1}</span>
                )}
              </motion.div>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-grow mx-4">
                <div className="relative h-2 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ 
                      width: index < currentStep ? "100%" : "0%"
                    }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-[#FF5722] to-[#FFD700]"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Step Labels */}
      <div className="flex justify-between mt-4">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`text-sm font-medium transition-colors duration-300 w-24 text-center
              ${index < currentStep 
                ? 'text-[#FFD700]' 
                : index === currentStep 
                  ? 'text-white' 
                  : 'text-white/40'}`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

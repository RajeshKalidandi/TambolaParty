import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full 
            ${index < currentStep 
              ? 'bg-green-500' 
              : index === currentStep 
                ? 'bg-blue-500' 
                : 'bg-gray-300'} 
            text-white transition-colors duration-200`}>
            {index < currentStep ? (
              <Check className="w-5 h-5" />
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-full h-1 mx-2 
              ${index < currentStep ? 'bg-green-500' : 'bg-gray-300'} 
              transition-colors duration-200`} />
          )}
        </div>
      ))}
    </div>
  );
}
import React from 'react';
import { Coins, Banknote, Smartphone, PartyPopper } from 'lucide-react';

const Feature = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition">
    <div className="p-3 bg-gradient-to-br from-[#FF5722] to-[#1A237E] rounded-full mb-4">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 text-center">{description}</p>
  </div>
);

export default function Features() {
  const features = [
    {
      icon: Coins,
      title: "Host & Earn",
      description: "Create games and earn rewards for hosting exciting tambola sessions"
    },
    {
      icon: Banknote,
      title: "Zero Platform Fee",
      description: "No hidden charges or platform fees. Keep what you earn!"
    },
    {
      icon: Smartphone,
      title: "Instant UPI",
      description: "Quick and secure payments directly to your UPI account"
    },
    {
      icon: PartyPopper,
      title: "Perfect for Events",
      description: "Ideal for parties, weddings, and corporate events"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose TambolaParty?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Feature key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
import React from 'react';
import { GamepadIcon, Ticket, Coins, User } from 'lucide-react';

const NavItem = ({ icon: Icon, label, active = false }: { icon: any; label: string; active?: boolean }) => (
  <button className={`flex flex-col items-center gap-1 flex-1 p-2 ${active ? 'text-cyan-400' : 'text-gray-400'}`}>
    <Icon className="w-6 h-6" />
    <span className="text-xs">{label}</span>
  </button>
);

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2">
      <div className="flex justify-between items-center">
        <NavItem icon={GamepadIcon} label="Active Games" active />
        <NavItem icon={Ticket} label="My Tickets" />
        <NavItem icon={Coins} label="Earnings" />
        <NavItem icon={User} label="Profile" />
      </div>
    </div>
  );
}
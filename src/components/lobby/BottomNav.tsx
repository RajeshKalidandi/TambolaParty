import { GamepadIcon, Ticket, Coins, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const NavItem = ({ icon: Icon, label, active = false }: { icon: any; label: string; active?: boolean }) => (
  <Link 
    to={`/${label.toLowerCase()}`} 
    className={`flex flex-col items-center gap-1 flex-1 p-2 ${active ? 'text-cyan-400' : 'text-gray-400'}`}
  >
    <Icon size={24} />
    <span className="text-xs">{label}</span>
  </Link>
);

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2">
      <div className="flex justify-between">
        <NavItem icon={GamepadIcon} label="Games" active />
        <NavItem icon={Ticket} label="Tickets" />
        <NavItem icon={Coins} label="Wallet" />
        <NavItem icon={User} label="Profile" />
      </div>
    </div>
  );
}
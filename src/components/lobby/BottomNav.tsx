import { GamepadIcon, Ticket, Coins, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
  active?: boolean;
}

const NavItem = ({ icon: Icon, label, path, active = false }: NavItemProps) => (
  <Link 
    to={path}
    className={`flex flex-col items-center gap-1 flex-1 p-2 transition-colors ${
      active ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-300'
    }`}
  >
    <Icon size={24} />
    <span className="text-xs">{label}</span>
  </Link>
);

export default function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: GamepadIcon, label: 'Games', path: '/lobby' },
    { icon: Ticket, label: 'Tickets', path: '/tickets' },
    { icon: Coins, label: 'Wallet', path: '/wallet' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 px-4 py-2">
      <div className="max-w-lg mx-auto flex justify-between">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            {...item}
            active={currentPath === item.path}
          />
        ))}
      </div>
    </nav>
  );
}
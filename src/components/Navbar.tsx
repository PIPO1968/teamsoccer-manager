import { NavLink } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Home, Users, Trophy, ShoppingCart, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

export default function Navbar() {
  const { state, resetGame } = useGame();

  const navItems = [
    { to: '/', icon: Home, label: 'Inicio' },
    { to: '/team', icon: Users, label: 'Equipo' },
    { to: '/league', icon: Trophy, label: 'Liga' },
    { to: '/transfers', icon: ShoppingCart, label: 'Fichajes' },
  ];

  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <span className="font-bold text-lg hidden sm:block">Soccer Manager</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-4">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-green-600 text-white' : 'text-green-100 hover:bg-green-700'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-200 hidden md:block">Sem. {state.week}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetGame}
              className="text-green-100 hover:bg-green-700 hover:text-white"
              title="Reiniciar juego"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            {/* Botón Visor de partidos */}
            <a
              href="https://lovable.dev/projects/a06bd253-1a1e-4a58-b4ae-ebd15a06d87b"
              className="bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors ml-2"
            >
              Visor de partidos
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

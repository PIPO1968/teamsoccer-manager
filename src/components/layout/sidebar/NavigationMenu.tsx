
import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

interface NavigationMenuProps {
  items: NavigationItem[];
}

export default function NavigationMenu({ items }: NavigationMenuProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="flex-1 overflow-y-auto">
      <div className="space-y-0.5 p-2">
        {items.map((item) => (
          <div key={item.path}>
            <Link 
              to={item.path}
              className="flex items-center gap-2 rounded py-1.5 px-2 transition-colors text-sm text-gray-700 hover:bg-gray-100"
            >
              <item.icon className="h-4 w-4" />
              <span className="truncate">{item.name}</span>
            </Link>
          </div>
        ))}
      </div>
    </nav>
  );
}

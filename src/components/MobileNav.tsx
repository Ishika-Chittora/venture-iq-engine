import { LayoutDashboard, History, GitCompareArrows, Settings } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

const items = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'History', url: '/history', icon: History },
  { title: 'Compare', url: '/compare', icon: GitCompareArrows },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/30 px-2 py-2">
      <div className="flex items-center justify-around">
        {items.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === '/'}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-muted-foreground transition"
            activeClassName="text-primary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

// src/components/marketing/Sidebar.tsx
import React from 'react';
import { LayoutDashboard, FileText, Calendar, Users, TrendingUp, MessageSquare, Bot, Inbox, Plug, BarChart3, ChevronDown, ChevronRight, LogOut, User } from 'lucide-react';
import { ModeToggle } from '@/components/core/ModeToggle';
import { Button } from '@/components/ui/button';
import { getUser, logout, type User as UserType } from '@/services/marketing/authService';

interface NavItem {
  href: string;
  icon: any;
  label: string;
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  { href: '/marketing/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/marketing/propuestas', icon: FileText, label: 'Propuestas' },
  { href: '/marketing/cursos', icon: Calendar, label: 'Cursos' },
  { href: '/marketing/campañas', icon: TrendingUp, label: 'Campañas' },
  { href: '/marketing/alumnos', icon: Users, label: 'Alumnos' },
  {
    href: '/marketing/chatbot',
    icon: MessageSquare,
    label: 'Chatbots',
    subItems: [
      { href: '/marketing/chatbot/conversaciones', icon: Inbox, label: 'Conversaciones' },
      { href: '/marketing/chatbot/automatizaciones', icon: Bot, label: 'Automatizaciones' },
      { href: '/marketing/chatbot/canales', icon: Plug, label: 'Canales' },
      { href: '/marketing/chatbot/estadisticas', icon: BarChart3, label: 'Estadísticas' },
    ]
  },
  { href: '/marketing/metricas', icon: TrendingUp, label: 'Métricas' },
];

export default function Sidebar() {
  const [currentPath, setCurrentPath] = React.useState('/marketing/dashboard');
  const [openItems, setOpenItems] = React.useState<string[]>(['/marketing/chatbot']);
  const [user, setUser] = React.useState<UserType | null>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
      // Auto-abrir el item si la ruta actual pertenece a sus subitems
      navItems.forEach((item) => {
        if (item.subItems && item.subItems.some(sub => window.location.pathname.startsWith(sub.href))) {
          setOpenItems(prev => prev.includes(item.href) ? prev : [...prev, item.href]);
        }
      });
      // Obtener datos del usuario
      const userData = getUser();
      setUser(userData);
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  // Obtener iniciales del usuario para el avatar
  const getUserInitials = () => {
    if (!user) return 'MK';
    const name = user.fullname || user.name || '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase() || 'MK';
  };

  const toggleItem = (href: string) => {
    setOpenItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 transition-all duration-200 ease-in-out z-50 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/LOGOTIPO_48x48.svg" alt="INCADEV Logo" className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">INCADEV</h2>
            <p className="text-xs text-muted-foreground">Marketing Hub</p>
          </div>
        </div>
        <ModeToggle />
      </div>

      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;
          const isOpen = openItems.includes(item.href);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isSubItemActive = item.subItems?.some(sub => currentPath === sub.href);

          return (
            <div key={item.href}>
              {hasSubItems ? (
                <>
                  <Button
                    onClick={() => toggleItem(item.href)}
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-auto px-4 py-3 ${isSubItemActive
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>

                  {isOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems?.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = currentPath === subItem.href;

                        return (
                          <Button
                            key={subItem.href}
                            asChild
                            variant="ghost"
                            className={`w-full justify-start gap-3 h-auto px-4 py-2.5 ${isSubActive
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                          >
                            <a href={subItem.href}>
                              <SubIcon className="w-4 h-4" />
                              <span className="text-sm font-medium">{subItem.label}</span>
                              {isSubActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>}
                            </a>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Button
                  asChild
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-auto px-4 py-3 ${isActive
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                >
                  <a href={item.href}>
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>}
                  </a>
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="p-4 rounded-lg bg-muted border border-border">
          <div className="flex items-center gap-3">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.fullname || user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">{getUserInitials()}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.fullname || user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || 'Marketing'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="ghost"
            className="w-full mt-3 justify-start gap-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
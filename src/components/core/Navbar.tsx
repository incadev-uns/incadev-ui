"use client"
import React, { useState, useEffect } from "react";
import { ModeToggle } from '@/components/core/ModeToggle';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home, BookOpen, Users, GraduationCap, MessageCircle,
  Info, Phone, Menu, User as UserIcon, LogOut
} from "lucide-react";
import { getRoleRoute } from "@/config/auth/role-routes";

interface NavLink {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  avatar_url?: string | null;
  role?: string;
}

const navLinks: NavLink[] = [
  { id: "inicio", label: "Inicio", icon: <Home className="h-4 w-4" />, href: "/" },
  { id: "cursos", label: "Cursos", icon: <BookOpen className="h-4 w-4" />, href: "/tecnologico/web/cursos" },
  { id: "nosotros", label: "Nosotros", icon: <Info className="h-4 w-4" />, href: "/tecnologico/web/nosotros" },
  { id: "noticias", label: "Noticias", icon: <MessageCircle className="h-4 w-4" />, href: "/tecnologico/web/noticias" }
];

export function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Detectar página activa basada en la URL
  const [activePage, setActivePage] = useState("/");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActivePage(window.location.pathname);
    }
  }, []);

  // Detectar usuario logeado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (error) {
          console.error("[Navbar] Error parsing user data:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    }
  }, []);

  // Manejar scroll para ocultar/mostrar navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Manejar cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth";
  };

  // Navegar al perfil
  const handleProfileClick = () => {
    if (user?.role) {
      const dashboardRoute = getRoleRoute(user.role);
      window.location.href = `${dashboardRoute}/profile`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto">
        <div className="flex h-20 items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center">
            <a
              href="/"
              className="h-16 focus:outline-none focus:ring-2 focus:ring-primary rounded block"
            >
              <img
                src="/ISOLOGOTIPO_HORIZONTAL.svg"
                alt="INCADEV - Instituto de Capacitación y Desarrollo Virtual"
                className="h-full w-auto"
              />
            </a>
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activePage === link.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </a>
            ))}
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            {user ? (
              // Usuario logeado - mostrar avatar con dropdown
              <div className="hidden sm:flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
                      <Avatar className="h-10 w-10 rounded-lg cursor-pointer hover:opacity-80 transition-opacity">
                        {user.avatar_url || user.avatar ? (
                          <AvatarImage
                            src={user.avatar_url || user.avatar}
                            alt={user.name}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary rounded-lg">
                          {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              // Usuario no logeado - mostrar botones de ingresar/registrarse
              <div className="hidden sm:flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <a href="/auth">Ingresar</a>
                </Button>
                <Button size="sm" asChild>
                  <a href="/academico/register">Registrarse</a>
                </Button>
              </div>
            )}
            <ModeToggle />

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 mt-8 p-6">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                      Navegación
                    </h3>
                    {navLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                          activePage === link.href
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-accent'
                        }`}
                      >
                        {link.icon}
                        <span className="font-medium">{link.label}</span>
                      </a>
                    ))}
                  </div>

                  <div className="border-t pt-6">
                    {user ? (
                      // Usuario logeado en mobile
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-2">
                          <Avatar className="h-12 w-12 rounded-lg">
                            {user.avatar_url || user.avatar ? (
                              <AvatarImage
                                src={user.avatar_url || user.avatar}
                                alt={user.name}
                                className="object-cover"
                              />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary rounded-lg">
                              {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-6 w-6" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Button variant="destructive" className="w-full" onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Cerrar sesión
                        </Button>
                      </div>
                    ) : (
                      // Usuario no logeado en mobile
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" className="w-full" asChild>
                          <a href="/auth">Ingresar</a>
                        </Button>
                        <Button className="w-full" asChild>
                          <a href="/academico/register">Registrarse</a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
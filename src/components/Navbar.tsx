import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, LogOut, Settings, LayoutDashboard, Shield, Home, Crown,
  ChevronDown, Battery, Moon, RotateCcw, Briefcase, MessageCircle,
  Dumbbell, MapPin, Camera, Utensils, Mail, ShoppingBag
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { NotificationBell } from "@/components/NotificationBell";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  const eliteFeatures = [
    { name: "Fitness Journey", href: "/my-progress", icon: Crown, highlight: true },
    { name: "AI Coach", href: "/coaching", icon: MessageCircle },
    { name: "Workouts", href: "/workouts", icon: Dumbbell },
    { name: "Run Tracker", href: "/running", icon: MapPin },
    { name: "Calorie Tracker", href: "/calories", icon: Utensils },
    { name: "Hormonal Optimization", href: "/hormonal", icon: Battery },
    { name: "Joint Health Analytics", href: "/joint-health", icon: Shield },
    { name: "Sleep-Adaptive Workouts", href: "/sleep-adaptive", icon: Moon },
    { name: "Comeback Protocol", href: "/comeback", icon: RotateCcw },
    { name: "Executive Performance", href: "/executive-mode", icon: Briefcase },
  ];

  const navLinks = [
    { name: "Knowledge Hub", href: "/knowledge", isPage: true },
    { name: "Forum", href: "/forum", isPage: true },
    { name: "Community", href: "/community", isPage: true },
    { name: "Recommendations", href: "/recommendations", isPage: true },
  ];

  const mobileNavLinks = [
    { name: "Knowledge Hub", href: "/knowledge", isPage: true },
    { name: "Forum", href: "/forum", isPage: true },
    { name: "Community", href: "/community", isPage: true },
    { name: "Recommendations", href: "/recommendations", isPage: true },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border pt-[calc(env(safe-area-inset-top)+20px)] md:pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto px-4 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center">
            <span className="text-lg md:text-xl font-medium tracking-[0.25em] uppercase text-foreground">
              Fortivus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6" data-tour="nav-links">
            {/* Elite Features Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger data-tour="elite-dropdown" className="text-xs font-medium tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1 outline-none">
                <Crown className="h-3 w-3 text-amber-500" />
                Elite Features
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-background border-border">
                <DropdownMenuLabel className="text-xs tracking-wider uppercase text-muted-foreground">
                  Premium Features
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {eliteFeatures.map((feature) => (
                  <DropdownMenuItem key={feature.name} asChild>
                    <Link to={feature.href} className="flex items-center gap-2 cursor-pointer">
                      <feature.icon className="h-4 w-4 text-accent" />
                      {feature.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-xs font-medium tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-200"
                data-tour={`nav-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2" data-tour="nav-actions">
            {user ? (
              <>
                <NotificationBell />
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link to="/messages">
                    <Mail className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link to="/">
                    <Home className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="default" size="sm" asChild data-tour="nav-dashboard">
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Member Dashboard
                  </Link>
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link to="/admin">
                      <Shield className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link to="/profile">
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-2">
            {user ? (
              <>
                <NotificationBell />
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
            <button
              className="p-2 text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-6 px-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {/* Mobile Elite Features Section */}
              <div className="pb-4 border-b border-border">
                <p className="text-xs font-medium tracking-[0.1em] uppercase text-amber-500 flex items-center gap-1 mb-3">
                  <Crown className="h-3 w-3" />
                  Elite Features
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {eliteFeatures.map((feature) => (
                    <Link
                      key={feature.name}
                      to={feature.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <feature.icon className="h-3 w-3 text-accent" />
                      {feature.name}
                    </Link>
                  ))}
                </div>
              </div>

              {mobileNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-xs font-medium tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border mt-2">
                {user ? (
                  <>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link to="/messages" onClick={() => setIsOpen(false)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Messages
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link to="/" onClick={() => setIsOpen(false)}>
                        <Home className="h-4 w-4 mr-2" />
                        Home
                      </Link>
                    </Button>
                    <Button variant="default" className="justify-start" asChild>
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Member Dashboard
                      </Link>
                    </Button>
                    {isAdmin && (
                      <Button variant="outline" className="justify-start" asChild>
                        <Link to="/admin" onClick={() => setIsOpen(false)}>
                          <Shield className="h-4 w-4 mr-2" />
                          Admin
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link to="/profile" onClick={() => setIsOpen(false)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>Sign In</Link>
                    </Button>
                    <Button variant="default" asChild>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

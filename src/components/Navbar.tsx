import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Settings, LayoutDashboard, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();

  const navLinks = [
    { name: "Forum", href: "/forum", isPage: true },
    { name: "Check-in", href: "/checkin", isPage: true },
    { name: "Community", href: "/community", isPage: true },
    { name: "Supplements", href: "/supplements", isPage: true },
    { name: "Gear", href: "/gear", isPage: true },
    { name: "Pricing", href: "/pricing", isPage: true },
  ];

  const mobileNavLinks = [
    { name: "Forum", href: "/forum", isPage: true },
    { name: "Check-in", href: "/checkin", isPage: true },
    { name: "Community", href: "/community", isPage: true },
    { name: "Supplements", href: "/supplements", isPage: true },
    { name: "Gear", href: "/gear", isPage: true },
    { name: "Pricing", href: "/pricing", isPage: true },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-lg md:text-xl font-medium tracking-[0.25em] uppercase text-foreground">
              Fortivus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-xs font-medium tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                <Button variant="default" size="sm" asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
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

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-6 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
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
                    <Button variant="default" className="justify-start" asChild>
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
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

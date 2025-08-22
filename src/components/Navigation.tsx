import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Form" },
    { to: "/admin", label: "Admin Dashboard" },
    { to: "/auth", label: "Sign In" },
  ];

  const NavLink = ({
    to,
    label,
    onClick,
  }: {
    to: string;
    label: string;
    onClick?: () => void;
  }) => (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        location.pathname === to
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-surface border-b border-border shadow-custom-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              Information Portal
            </h1>
          </div>

          {/* Desktop Navigation */}
          {!isMobile ? (
            <div className="flex space-x-4 lg:space-x-8 items-center">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} label={link.label} />
              ))}
            </div>
          ) : (
            /* Mobile Navigation */
            <div className="flex items-center">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-64 bg-surface border-border"
                >
                  <div className="flex flex-col space-y-4 mt-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                      Information Portal
                    </h2>
                    {navLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        label={link.label}
                        onClick={() => setIsOpen(false)}
                      />
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

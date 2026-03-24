
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, Sparkles, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ variant = 'default' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'Community', href: '#cta' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              BizBase
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>
          
          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg px-4">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg border-0 shadow-md shadow-violet-200/40 hover:shadow-lg transition-all duration-300 text-sm">
                Get Early Access
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-xl border-b border-slate-100 p-5 space-y-4">
          {navLinks.map((item) => (
            <a key={item.label} href={item.href} className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>
              {item.label}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full text-sm">Login</Button>
            </Link>
            <Link to="/signup" onClick={() => setMobileOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm">
                Get Early Access
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

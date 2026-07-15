
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, Sparkles, Menu, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ variant = 'default' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const isHero = variant === 'hero';

  const navLinks = [
    { label: 'Solutions', href: '#features' },
    { label: 'Blogs', href: '/blog', isRoute: true },
    { label: 'Community', href: '/community', isRoute: true },
    { label: 'Who is BizBase for?', href: '#who-is-it-for' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          {/* <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              BizBase
            </span>
          </Link> */}
          <Link to="/" className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl ${
              isHero ? 'bg-gradient-to-br from-blue-500 to-violet-500' : 'bg-gradient-to-br from-blue-600 to-purple-600'
            }`}>
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-black bg-clip-text text-transparent ${
                isHero ? 'bg-gradient-to-r from-blue-400 to-violet-400' : 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}>
                BizBase
              </span>
              <span className={`text-xs font-medium -mt-1 ${isHero ? 'text-white/40' : 'text-slate-500'}`}>Build • Scale • Automate</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          {/* <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {item.label}
              </a>
            ))}
          </div> */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Solutions */}
            <a 
              href="#features" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Solutions
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-500 group-hover:w-full transition-all duration-300" />
            </a>

            {/* Company dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCompanyOpen(true)}
              onMouseLeave={() => setCompanyOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Company
              </button>
              {companyOpen && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 px-1.5 min-w-[140px]">
                    <Link
                      to="/about"
                      className="block text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors"
                    >
                      About
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Blogs */}
            <Link
              to="/blog"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Blogs
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-500 group-hover:w-full transition-all duration-300" />
            </Link>

            {/* Community */}
            <Link
              to="/whatsappcommunity"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Founders Community
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-500 group-hover:w-full transition-all duration-300" />
            </Link>

            {/* Who is BizBase for? */}
            <a
              href="#who-is-it-for"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Who is BizBase for?
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-500 group-hover:w-full transition-all duration-300" />
            </a>
          </div>
          
          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" className={`flex items-center space-x-2 rounded-xl font-semibold px-6 ${
                isHero ? 'text-white/70 hover:text-white hover:bg-white/[0.08]' : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
              }`}>
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg border-0 shadow-md shadow-violet-200/40 hover:shadow-lg transition-all duration-300 text-sm">
                Get Started Free
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
          <a href="#features" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>
            Solutions
          </a>
          <Link to="/" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>
            Company
          </Link>
          <Link to="/blog" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>
            Blogs
          </Link>
          <Link to="/whatsappcommunity" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>
            Community
          </Link>
          <a href="#who-is-it-for" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>
            Who is BizBase for?
          </a>
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full text-sm">Login</Button>
            </Link>
            <Link to="/signup" onClick={() => setMobileOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
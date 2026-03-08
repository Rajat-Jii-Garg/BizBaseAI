
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, Sparkles, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ variant = 'default' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHero = variant === 'hero';

  return (
    <nav className={`fixed top-0 w-full z-50 backdrop-blur-lg shadow-lg transition-colors duration-300 ${
      isHero
        ? 'bg-[#060b1f]/80 border-b border-white/[0.06]'
        : 'bg-white/90 border-b border-slate-200/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
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
              <span className={`text-xs font-medium -mt-1 ${isHero ? 'text-white/40' : 'text-slate-500'}`}>AI Business OS</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {['Features', 'Solutions', 'Pricing', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className={`font-semibold relative group transition-colors ${
                isHero ? 'text-white/60 hover:text-white' : 'text-slate-700 hover:text-blue-600'
              }`}>
                {item}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                  isHero ? 'bg-blue-400' : 'bg-blue-600'
                }`}></span>
              </a>
            ))}
            <Link to="/blog" className={`font-semibold relative group transition-colors ${
              isHero ? 'text-white/60 hover:text-white' : 'text-slate-700 hover:text-blue-600'
            }`}>
              Blogs
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                isHero ? 'bg-blue-400' : 'bg-blue-600'
              }`}></span>
            </Link>
          </div>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className={`flex items-center space-x-2 rounded-xl font-semibold px-6 ${
                isHero ? 'text-white/70 hover:text-white hover:bg-white/[0.08]' : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
              }`}>
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl font-bold px-8 py-3 rounded-xl border-0 transform hover:scale-105 transition-all duration-300">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              <Menu className={`w-6 h-6 ${isHero ? 'text-white/80' : 'text-slate-700'}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className={`md:hidden absolute top-20 left-0 w-full shadow-xl rounded-b-2xl p-6 space-y-6 ${
          isHero ? 'bg-[#0a0e27]/95 backdrop-blur-xl border-b border-white/[0.06]' : 'bg-white'
        }`}>
          <div className={`pt-4 ${isHero ? 'border-t border-white/[0.06]' : 'border-t'}`}>
            <Link to="/login">
              <Button variant="ghost" className={`w-full ${isHero ? 'text-white/70 hover:bg-white/[0.08]' : ''}`}>Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
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

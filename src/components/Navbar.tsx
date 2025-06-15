
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    // 🌌 Premium blue/green gradient background
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-[#102245] via-[#16355d] to-[#1cb6af] border-b border-[#263557] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-br from-[#1bb6bd] to-[#2857c4] rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white drop-shadow-md" />
            </div>
            <span className="text-2xl font-extrabold font-display bg-gradient-to-r from-[#31d68a] via-[#5dadfe] to-[#2d77d1] bg-clip-text text-transparent drop-shadow-sm tracking-wide select-none">
              BizBase
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-white/80 hover:text-white transition-all story-link text-base font-semibold">Features</a>
            <a href="#solutions" className="text-white/80 hover:text-white transition-all story-link text-base font-semibold">Solutions</a>
            <a href="#pricing" className="text-white/80 hover:text-white transition-all story-link text-base font-semibold">Pricing</a>
            <a href="#contact" className="text-white/80 hover:text-white transition-all story-link text-base font-semibold">Contact</a>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" className="flex items-center space-x-2 text-white/80 hover:text-white hover:bg-[#124e5e]/40 rounded-lg font-semibold">
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-[#36d98f] to-[#2857c4] hover:from-[#1bcda3] hover:to-[#164aa7] text-white shadow-lg font-bold px-6 py-2 rounded-lg border-0 transition-all duration-150">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;

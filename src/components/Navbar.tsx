
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-[#181829]/90 via-[#1d2033]/90 to-[#23243b]/90 backdrop-blur-md border-b border-[#2c2d44] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-br from-[#3939fa] to-[#836fff] rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white drop-shadow-md" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-[#74ebd5] via-[#ACB6E5] to-[#826fff] bg-clip-text text-transparent drop-shadow-sm tracking-wide select-none">
              BizBase
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-200 hover:text-white transition-all story-link text-base font-medium">Features</a>
            <a href="#solutions" className="text-gray-200 hover:text-white transition-all story-link text-base font-medium">Solutions</a>
            <a href="#pricing" className="text-gray-200 hover:text-white transition-all story-link text-base font-medium">Pricing</a>
            <a href="#contact" className="text-gray-200 hover:text-white transition-all story-link text-base font-medium">Contact</a>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" className="flex items-center space-x-2 text-gray-100 hover:text-white hover:bg-[#23243b]/50 rounded-lg font-semibold">
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-[#3939fa] to-[#836fff] hover:from-[#4f49d7] hover:to-[#6948c2] text-white shadow-lg font-semibold px-5 py-2 rounded-lg border-0 transition-all duration-150">
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


import React from 'react';
import { Sparkles, Twitter, Linkedin, Github, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-tr from-[#111e2e] via-[#17303a] to-[#2652ac] text-white pt-14 pb-10 border-t border-[#17324e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#42d8d8] to-[#275acb] rounded-xl flex items-center justify-center shadow">
                <Sparkles className="w-5 h-5 text-white drop-shadow" />
              </div>
              <span className="text-xl font-extrabold font-display bg-gradient-to-r from-[#4df1bd] via-[#469cff] to-[#245ade] bg-clip-text text-transparent select-none">
                BizBase
              </span>
            </div>
            <p className="text-white/80 mb-6 max-w-md font-medium leading-relaxed">
              All-in-One AI Powered Business Operating System for modern businesses.<br/>
              Streamline operations, boost productivity and make smarter, data-driven decisions.
            </p>
            <div className="flex space-x-4 mt-2">
              {/* Socials */}
              <a href="#" className="text-[#acd9f6] hover:text-white transition-colors p-2 rounded-full bg-white/5 hover:bg-[#3aeec9]/20">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#acd9f6] hover:text-white transition-colors p-2 rounded-full bg-white/5 hover:bg-[#3aeec9]/20">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#acd9f6] hover:text-white transition-colors p-2 rounded-full bg-white/5 hover:bg-[#3aeec9]/20">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#acd9f6] hover:text-white transition-colors p-2 rounded-full bg-white/5 hover:bg-[#3aeec9]/20">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Product -</h3>
            <ul className="space-y-2 text-white/80 text-base">
              <li><a href="#features" className="hover:text-white transition story-link">Features</a></li>
              <li><a href="#solutions" className="hover:text-white transition story-link">Solutions</a></li>
              <li><a href="#" className="hover:text-white transition story-link">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition story-link">Integrations</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Company -</h3>
            <ul className="space-y-2 text-white/80 text-base">
              <li><a href="#" className="hover:text-white transition story-link">About</a></li>
              <li><a href="#" className="hover:text-white transition story-link">Contact</a></li>
              <li><a href="#" className="hover:text-white transition story-link">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition story-link">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#25619c] mt-12 pt-8 text-center text-white/70">
          <p className="text-sm md:text-base">
            &copy; 2024 <span className="text-[#75eccc] font-semibold">BizBase</span>. All rights reserved.
            <span className="ml-2">Built for professionals & modern business.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;

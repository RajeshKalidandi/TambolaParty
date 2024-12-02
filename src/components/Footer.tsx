import React from 'react';
import { Facebook, Twitter, Instagram, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1A237E] text-white py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0">
            <h3 className="text-2xl font-bold mb-4">TambolaParty</h3>
            <p className="text-white/80">Making tambola games more exciting!</p>
          </div>
          
          <div className="flex flex-col items-center mb-8 md:mb-0">
            <button className="bg-[#25D366] text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-[#25D366]/90 transition">
              <Share2 className="w-5 h-5" />
              Share on WhatsApp
            </button>
          </div>

          <div className="flex gap-6">
            <a href="#" className="hover:text-[#FFD700] transition">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-[#FFD700] transition">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-[#FFD700] transition">
              <Instagram className="w-6 h-6" />
            </a>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
          <p>&copy; {new Date().getFullYear()} TambolaParty. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
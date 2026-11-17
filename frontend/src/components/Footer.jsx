import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t-2 border-eco-100 pt-12 pb-8 mt-20 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-eco-500 to-sunny-300 p-1.5 shadow-sm">
                <img src="/logo.svg" alt="Eco World Logo" className="w-full h-full" />
              </div>
              <span className="font-display font-extrabold text-2xl text-slate-800">
                Eco <span className="text-eco-600">World</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-md font-medium leading-relaxed">
              Empowering kids aged 5–12 to transform everyday household waste into creative, educational DIY wonders using Artificial Intelligence and Computer Vision.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-eco-50 text-eco-800 text-xs font-bold rounded-full border border-eco-200">
                <ShieldCheck className="w-4 h-4 text-eco-600" />
                <span>COPPA & Child Safety Compliant</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-sunny-50 text-amber-800 text-xs font-bold rounded-full border border-sunny-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>100% Free & Kid-Safe</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-slate-800 text-base mb-3">Explore</h4>
            <ul className="space-y-2 text-sm font-semibold">
              <li>
                <Link to="/scanner" className="hover:text-eco-600 transition-colors">Smart Waste Scanner</Link>
              </li>
              <li>
                <Link to="/crafts" className="hover:text-eco-600 transition-colors">Browse 30+ DIY Crafts</Link>
              </li>
              <li>
                <Link to="/learning" className="hover:text-eco-600 transition-colors">Eco Learning & Quizzes</Link>
              </li>
              <li>
                <Link to="/rewards" className="hover:text-eco-600 transition-colors">Badges & Certificates</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-eco-600 transition-colors">Child Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Adult portals */}
          <div>
            <h4 className="font-display font-bold text-slate-800 text-base mb-3">Parents & Teachers</h4>
            <ul className="space-y-2 text-sm font-semibold">
              <li>
                <Link to="/parent" className="hover:text-eco-600 transition-colors">Parent Control Panel</Link>
              </li>
              <li>
                <Link to="/teacher" className="hover:text-eco-600 transition-colors">Teacher Classrooms</Link>
              </li>
              <li>
                <span className="text-xs text-slate-400 block pt-2">
                  No public child profiles, no advertising, and no behavioral tracking.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium">
          <p>© 2026 Eco World. Turn Waste Into Wonder! All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Planet Earth
          </p>
        </div>
      </div>
    </footer>
  );
}

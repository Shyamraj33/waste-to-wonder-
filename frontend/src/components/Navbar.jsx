import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Camera,
  Compass,
  BookOpen,
  LayoutDashboard,
  Volume2,
  VolumeX,
  UserCheck,
  Menu,
  X,
  Award,
} from 'lucide-react';
import { useChild } from '../context/ChildContext';

export default function Navbar() {
  const location = useLocation();
  const { child, avatarEmoji, soundEnabled, setSoundEnabled, playSound, setShowOnboarding } = useChild();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Scan Waste', path: '/scanner', icon: Camera, highlight: true },
    { name: 'Explore Crafts', path: '/crafts', icon: Compass },
    { name: 'Eco Learning', path: '/learning', icon: BookOpen },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Rewards', path: '/rewards', icon: Award },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-eco-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => playSound('click')}
            className="flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-eco-500 to-sunny-300 p-2 shadow-kid-button flex items-center justify-center transform group-hover:scale-105 group-hover:rotate-3 transition-transform">
              <img src="/logo.svg" alt="Eco World" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-display font-extrabold text-2xl tracking-wide text-slate-800 flex items-center gap-1">
                Eco <span className="text-eco-600">World</span>
              </span>
              <span className="hidden sm:block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Turn Waste Into Wonder! 🌿
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              if (item.highlight) {
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => playSound('click')}
                    className={`btn-kid btn-kid-green py-2 px-4 text-base flex items-center gap-2 transform hover:-translate-y-0.5 ${
                      active ? 'ring-2 ring-eco-600 ring-offset-2' : ''
                    }`}
                  >
                    <Camera className="w-4 h-4 animate-bounce" />
                    <span>{item.name}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => playSound('click')}
                  className={`px-3.5 py-2 rounded-xl font-display font-semibold text-sm transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-eco-100 text-eco-800 shadow-sm'
                      : 'text-slate-600 hover:text-eco-700 hover:bg-slate-50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 opacity-70" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Child Profile */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playSound('click');
              }}
              title={soundEnabled ? 'Sound is ON' : 'Sound is MUTED'}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-eco-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
            </button>

            {/* Eco Points Pill */}
            <Link
              to="/rewards"
              onClick={() => playSound('fanfare')}
              className="flex items-center gap-2 bg-sunny-100 border-2 border-sunny-300 hover:border-sunny-400 px-3.5 py-1.5 rounded-full shadow-sm hover:scale-105 transition-transform"
              title="Click to view Eco Rewards"
            >
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 animate-pulse" />
              <span className="font-display font-extrabold text-amber-900 text-sm">
                {child.eco_points} <span className="text-xs font-bold text-amber-700">PTS</span>
              </span>
            </Link>

            {/* Avatar Pill (Click to open onboarding/avatar picker) */}
            <button
              onClick={() => {
                playSound('click');
                setShowOnboarding(true);
              }}
              className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-50 hover:bg-eco-50 border-2 border-slate-200 hover:border-eco-300 rounded-full transition-all text-left"
              title="Click to change kid avatar or nickname"
            >
              <span className="text-2xl select-none" role="img" aria-label="avatar">
                {avatarEmoji}
              </span>
              <div className="leading-tight hidden lg:block">
                <span className="block font-display font-bold text-xs text-slate-800">{child.nickname}</span>
                <span className="block text-[10px] font-semibold text-eco-600">Age {child.age_group}</span>
              </div>
            </button>

            {/* Parent / Educator link */}
            <Link
              to="/parent"
              onClick={() => playSound('click')}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors text-xs font-bold flex items-center gap-1"
              title="Parent Portal"
            >
              <UserCheck className="w-4 h-4 text-slate-500" />
              <span className="hidden xl:inline">Parents</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/rewards"
              className="flex items-center gap-1 bg-sunny-100 border border-sunny-300 px-2.5 py-1 rounded-full text-xs font-extrabold text-amber-900"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>{child.eco_points}</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => {
                  playSound('click');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-display font-bold text-base ${
                  active ? 'bg-eco-500 text-white shadow-kid-button' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setShowOnboarding(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-sm font-bold text-slate-700"
            >
              <span className="text-2xl">{avatarEmoji}</span>
              <span>Edit Profile ({child.nickname})</span>
            </button>
            <Link
              to="/parent"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-bold text-eco-700 bg-eco-50 border border-eco-200 px-3 py-1.5 rounded-lg"
            >
              Parent Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

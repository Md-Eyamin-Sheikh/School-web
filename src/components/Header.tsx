/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X, Globe, Search, BookOpen, LogOut, KeyRound, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isBangla: boolean;
  setIsBangla: (val: boolean) => void;
  onSearchOpen: () => void;
  adminUser: any | null;
  onAdminClick: () => void;
  onLogout: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  isBangla,
  setIsBangla,
  onSearchOpen,
  adminUser,
  onAdminClick,
  onLogout
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', banglaLabel: 'প্রচ্ছদ' },
    { id: 'about', label: 'About Us', banglaLabel: 'আমাদের সম্পর্কে' },
    { id: 'academics', label: 'Academics', banglaLabel: 'একাডেমিক' },
    { id: 'admissions', label: 'Admissions', banglaLabel: 'ভর্তি' },
    { id: 'results', label: 'Results', banglaLabel: 'ফলাফল' },
    { id: 'gallery', label: 'Gallery', banglaLabel: 'গ্যালারি' },
    { id: 'contact', label: 'Contact', banglaLabel: 'যোগাযোগ' }
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
    
    // Sync browser path cleanly
    const pathMap: Record<string, string> = {
      home: '/',
      about: '/about',
      academics: '/academics',
      admissions: '/admissions',
      results: '/results',
      gallery: '/gallery',
      contact: '/contact'
    };
    const targetPath = pathMap[id] || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-outline-variant shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div 
          onClick={() => handleNavClick('home')} 
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group min-w-0 flex-1 sm:flex-initial"
        >
          {/* Circular School Logo */}
          <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-full overflow-hidden flex items-center justify-center bg-white border border-primary/20 shrink-0 shadow-sm transition-transform group-hover:rotate-12 duration-300">
            <img 
              src="https://i.postimg.cc/J4s8wZM9/damgara-school.jpg" 
              alt="Damagara S.M. High School Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="min-w-0">
            <h1 className="text-[10px] min-[360px]:text-xs min-[400px]:text-sm md:text-base font-black text-primary leading-tight bengali-heading tracking-tight select-none truncate max-w-[120px] min-[360px]:max-w-[150px] min-[400px]:max-w-[190px] sm:max-w-none">
              {isBangla ? 'দামাগারা সৈয়দ মিনা উচ্চ বিদ্যালয়' : 'Damagara S.M. High School'}
            </h1>
            <p className="text-[8px] min-[360px]:text-[9px] min-[400px]:text-[10px] sm:text-xs text-on-surface-variant font-semibold tracking-wider select-none truncate max-w-[100px] min-[360px]:max-w-[130px] min-[400px]:max-w-[170px] sm:max-w-none">
              {isBangla ? 'স্থাপিত: ১৯৬৪ খ্রি. | EIIN: ১১৯৮২৮' : 'Est. 1964 | EIIN: 119828'}
            </p>
          </div>
        </div>

        {/* Navigation Links for Desktop */}
        <nav className="hidden lg:flex items-center gap-6" id="desktop-navbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {isBangla ? item.banglaLabel : item.label}
              </button>
            );
          })}
        </nav>

        {/* Actions Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Language Toggle Button */}
          <button
            onClick={() => setIsBangla(!isBangla)}
            className="p-1.5 sm:p-2 hover:bg-primary/10 rounded-full transition-all text-primary flex items-center gap-1 cursor-pointer shrink-0"
            title={isBangla ? 'Translate to English' : 'বাংলায় পরিবর্তন করুন'}
            id="lang-toggle-btn"
          >
            <Globe className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            <span className="text-xs font-bold leading-none font-mono hidden sm:inline-block">
              {isBangla ? 'EN' : 'বাং'}
            </span>
          </button>

          {/* Search Button */}
          <button
            onClick={onSearchOpen}
            className="p-1.5 sm:p-2 hover:bg-primary/10 rounded-full transition-all text-primary cursor-pointer shrink-0"
            id="search-toggle-btn"
          >
            <Search className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </button>

          {/* Portal Session Control (Admins & Students) */}
          {adminUser ? (
            <div className="flex items-center gap-1 border-l border-slate-200 pl-1 sm:pl-2 shrink-0">
              <div 
                className={`flex items-center gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border text-[10px] sm:text-[11px] font-black cursor-pointer transition-colors select-none shrink-0 ${
                  adminUser.role === 'student'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/75'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/75'
                }`}
                title={
                  adminUser.role === 'student'
                    ? `${adminUser.displayName || 'Student'} - Learner Mode Active`
                    : `${adminUser.displayName || 'Authorized Admin'} - Evaluator Mode Active`
                }
                onClick={() => {
                  if (adminUser.role === 'student') {
                    handleNavClick('results');
                  } else {
                    window.history.pushState({}, '', '/admin');
                  }
                }}
              >
                <div className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full animate-pulse shrink-0 ${
                  adminUser.role === 'student' ? 'bg-blue-500' : 'bg-emerald-500'
                }`} />
                <span className="hidden min-[370px]:inline-block max-w-[65px] sm:max-w-[120px] truncate uppercase font-sans">
                  {adminUser.role === 'student' 
                    ? (isBangla ? 'শিক্ষার্থী' : 'Student')
                    : (isBangla ? 'প্যানেল' : 'Admin')
                  }
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-1 sm:p-2 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-full transition-all cursor-pointer shrink-0"
                title={isBangla ? 'লগআউট' : 'Logout Portal'}
              >
                 <LogOut className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdminClick}
              className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-250/65 rounded-xl transition-all font-black text-[10px] sm:text-[11px] flex items-center gap-1 cursor-pointer hover:text-primary hover:border-primary/45 shrink-0"
              id="admin-login-navbar-btn"
              title={isBangla ? 'লগইন / নিবন্ধন পোর্টাল' : 'Student / Administrative Login Portal'}
            >
              <KeyRound className="h-3 sm:h-3.5 sm:w-3.5 w-3" />
              <span className="hidden sm:inline">{isBangla ? 'লগইন পোর্টাল' : 'Login Portal'}</span>
              <span className="sm:hidden">{isBangla ? 'লগইন' : 'Login'}</span>
            </button>
          )}

          {/* Mobile Menu Icon toggler */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 sm:p-2 hover:bg-primary/10 rounded-full transition-all text-primary lg:hidden cursor-pointer shrink-0"
            id="mobile-menu-btn"
          >
            {isMobileMenuOpen ? <X className="h-5.5 w-5.5 sm:h-6 sm:w-6" /> : <Menu className="h-5.5 w-5.5 sm:h-6 sm:w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-outline-variant bg-surface px-4 py-3 space-y-2 shadow-inner" id="mobile-navbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left block px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-primary bg-primary/10 font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                }`}
              >
                {isBangla ? item.banglaLabel : item.label}
              </button>
            );
          })}

          {/* Mobile Portal Session Control */}
          <div className="pt-2.5 border-t border-outline-variant mt-2">
            {adminUser ? (
              <div className={`border p-3 rounded-xl flex items-center justify-between ${
                adminUser.role === 'student'
                  ? 'bg-blue-50 border-blue-100 text-blue-800'
                  : 'bg-emerald-50 border-emerald-150 text-emerald-800'
              }`}>
                <div 
                  className="flex items-center gap-2 cursor-pointer min-w-0"
                  onClick={() => handleNavClick(adminUser.role === 'student' ? 'results' : 'admissions')}
                >
                  <div className={`h-2 w-2 rounded-full animate-pulse shrink-0 ${
                    adminUser.role === 'student' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`} />
                  <span className="text-[11px] font-black truncate max-w-[150px]">
                    {adminUser.role === 'student'
                      ? (isBangla ? `শিক্ষার্থী: ${adminUser.displayName || 'লগইনকৃত'}` : `Student: ${adminUser.displayName || 'Learner'}`)
                      : (isBangla ? `সহকর্মী: ${adminUser.displayName || 'লগইনকৃত'}` : `Staff: ${adminUser.displayName || 'Coordinator'}`)
                    }
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-750 hover:text-red-900 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{isBangla ? 'লগআউট' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onAdminClick();
                }}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-750 hover:text-slate-900 border border-slate-200/80 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <KeyRound className="h-4 w-4 text-primary shrink-0" />
                <span>{isBangla ? 'লগইন ও নিবন্ধন পোর্টাল' : 'Login / Register Portals'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

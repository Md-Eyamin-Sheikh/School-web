/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Mail, 
  Phone, 
  Search, 
  Share2, 
  Calendar, 
  Globe, 
  Clock, 
  GraduationCap, 
  CheckCircle,
  X,
  FileCheck2,
  FileText,
  Info,
  Image,
  Lock,
  ShieldAlert
} from 'lucide-react';
import Header from './components/Header';
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import AcademicsView from './components/AcademicsView';
import AdmissionsView from './components/AdmissionsView';
import ResultsView from './components/ResultsView';
import GalleryView from './components/GalleryView';
import ContactView from './components/ContactView';
import AdminAuthModal from './components/AdminAuthModal';
import AdminPanel from './components/AdminPanel';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db, signInAsDemoAdmin } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Notice, NewsEvent } from './types';
import { SCHOOL_NOTICES, SCHOOL_EVENTS } from './data';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isBangla, setIsBangla] = useState<boolean>(true); // Default to true as the primary visual requested was in Bengali
  
  // Admin/Student authentication state managers
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);

  // Dynamic notices and faculty members
  const [notices, setNotices] = useState<Notice[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  // Navigation / Path monitors
  const [pathname, setPathname] = useState<string>(window.location.pathname);

  React.useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
      
      // Sync backward-compatible tab keys from current path
      const path = window.location.pathname;
      if (path === '/' || path === '') setActiveTab('home');
      else if (path === '/about') setActiveTab('about');
      else if (path === '/academics') setActiveTab('academics');
      else if (path === '/admissions') setActiveTab('admissions');
      else if (path === '/results') setActiveTab('results');
      else if (path === '/gallery') setActiveTab('gallery');
      else if (path === '/contact') setActiveTab('contact');
    };

    window.addEventListener('popstate', handleLocationChange);

    // Patch pushState
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    // Initial sync
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPathname(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Subscribe dynamically to notices & teachers in real time
  React.useEffect(() => {
    const unsubNotices = onSnapshot(collection(db, 'notices'), (snap) => {
      const list: Notice[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Notice);
      });
      setNotices(list);
    });

    const unsubTeachers = onSnapshot(collection(db, 'teachers'), (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setTeachers(list);
    });

    return () => {
      unsubNotices();
      unsubTeachers();
    };
  }, []);

  // Synchronize credentials with firebase auth backend in real-time
  React.useEffect(() => {
    // Check local storage for active demo sessions first
    const savedDemo = localStorage.getItem('demo_user');
    if (savedDemo) {
      try {
        setAdminUser(JSON.parse(savedDemo));
      } catch (e) {
        localStorage.removeItem('demo_user');
      }
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Tag user with correct role based on local storage metadata or domain email rule
        const savedRole = localStorage.getItem('demo_user_role') || (user.email?.endsWith('@damagarasmdhs.edu.bd') ? 'admin' : 'student');
        setAdminUser({
          uid: user.uid,
          displayName: user.displayName || (savedRole === 'admin' ? 'Coordinator Office' : 'DSMD Student'),
          email: user.email,
          role: savedRole,
          photoURL: user.photoURL
        });
      } else {
        const currentDemo = localStorage.getItem('demo_user');
        if (currentDemo) {
          try {
            setAdminUser(JSON.parse(currentDemo));
          } catch (e) {
            setAdminUser(null);
          }
        } else {
          setAdminUser(null);
        }
      }
    });
    return unsub;
  }, []);

  const handleAdminLogout = async () => {
    try {
      localStorage.removeItem('demo_user');
      localStorage.removeItem('demo_user_role');
      await signOut(auth);
      setAdminUser(null);
    } catch (err) {
      console.error("[Auth] Admin log out failed:", err);
      localStorage.removeItem('demo_user');
      localStorage.removeItem('demo_user_role');
      setAdminUser(null);
    }
  };

  // Search Dialog States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected details modal trigger
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<NewsEvent | null>(null);

  // Search filters logic across all elements
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const matches: { type: string; title: string; tab: string; handler?: () => void }[] = [];

    // Search notices
    SCHOOL_NOTICES.forEach(n => {
      const matchEng = n.title.toLowerCase().includes(query);
      const matchBn = n.banglaTitle && n.banglaTitle.includes(query);
      if (matchEng || matchBn) {
        matches.push({
          type: 'Notice',
          title: isBangla && n.banglaTitle ? n.banglaTitle : n.title,
          tab: 'academics',
          handler: () => {
            setSelectedNotice(n);
            setIsSearchOpen(false);
            setActiveTab('academics');
          }
        });
      }
    });

    // Search events
    SCHOOL_EVENTS.forEach(e => {
      const matchEng = e.title.toLowerCase().includes(query);
      const matchBn = e.banglaTitle && e.banglaTitle.includes(query);
      if (matchEng || matchBn) {
        matches.push({
          type: 'Event',
          title: isBangla && e.banglaTitle ? e.banglaTitle : e.title,
          tab: 'home',
          handler: () => {
            setSelectedEvent(e);
            setIsSearchOpen(false);
            setActiveTab('home');
          }
        });
      }
    });

    // Custom pages search highlights
    if ('admissions'.includes(query) || 'ভর্তি'.includes(query)) {
      matches.push({ type: 'Page', title: 'Admissions Form & Tution Fees System', tab: 'admissions' });
    }
    if ('results'.includes(query) || 'মার্কশিট'.includes(query) || 'ফলাফল'.includes(query)) {
      matches.push({ type: 'Page', title: 'Find Exam Results & Marksheets', tab: 'results' });
    }
    if ('gallery'.includes(query) || 'photo'.includes(query) || 'ছবি'.includes(query) || 'গ্যালারি'.includes(query)) {
      matches.push({ type: 'Page', title: isBangla ? 'ছবি ও ভিডিও গ্যালারি সমূহ' : 'Photo Gallery and Events Stream', tab: 'gallery' });
    }
    if ('faculty'.includes(query) || 'শিক্ষক'.includes(query) || 'about'.includes(query)) {
      matches.push({ type: 'Page', title: 'Our History, Pillars and Faculty Directory', tab: 'about' });
    }
    if ('contact'.includes(query) || 'যোগাযোগ'.includes(query)) {
      matches.push({ type: 'Page', title: 'Contact Us, Office Hours & Campus Map', tab: 'contact' });
    }

    return matches;
  };

  const searchResults = getSearchResults();

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between" id="applet-portal-wrapper">
      
      {/* Top Banner Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBangla={isBangla}
        setIsBangla={setIsBangla}
        onSearchOpen={() => setIsSearchOpen(true)}
        adminUser={adminUser}
        onAdminClick={() => setIsAdminAuthOpen(true)}
        onLogout={handleAdminLogout}
      />

      {/* Main Content Component Display */}
      <main className="flex-1 pb-28 lg:pb-16 bg-[#faf9f6]/40">
        {pathname.startsWith('/admin') ? (
          adminUser && adminUser.role === 'admin' ? (
            <AdminPanel
              isBangla={isBangla}
              setIsBangla={setIsBangla}
              pathname={pathname}
              navigate={navigate}
              adminUser={adminUser}
              onLogout={handleAdminLogout}
            />
          ) : (
            <div className="min-h-[70vh] max-w-lg mx-auto my-12 p-8 bg-white border border-outline-variant rounded-3xl shadow-lg flex flex-col justify-center items-center text-center animate-fadeIn gap-5">
              <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
                <Lock className="h-10 w-10 animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {isBangla ? 'সুরক্ষিত অ্যাডমিন বিভাগ' : 'Protected Admin Resource'}
                </h2>
                <p className="text-xs text-on-surface-variant font-medium mt-2 max-w-sm">
                  {isBangla 
                    ? 'এই পেজটিতে শুধুমাত্র স্কুলে কর্মরত শিক্ষক ও একাডেমিক কর্মকর্তারা অ্যাক্সেস করতে পারবেন।' 
                    : 'Access is strictly limited to authorized school staff and administrators.'}
                </p>
              </div>
              
              <div className="w-full flex flex-col gap-3 pt-2">
                <button
                  onClick={async () => {
                    try {
                      await signInAsDemoAdmin(isBangla);
                      window.location.reload();
                    } catch (err) {
                      console.error("Failed to sign in as demo admin:", err);
                    }
                  }}
                  className="w-full py-3 px-4 bg-primary hover:bg-opacity-90 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>{isBangla ? 'অ্যাডমিন ডেমো মোডে প্রবেশ করুন' : 'Enter Admin Demo Mode'}</span>
                </button>

                <button
                  onClick={() => setIsAdminAuthOpen(true)}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer transition-all"
                >
                  {isBangla ? 'পাসওয়ার্ড দিয়ে লগইন করুন' : 'Sign in with Password'}
                </button>
              </div>
            </div>
          )
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                isBangla={isBangla}
                setActiveTab={setActiveTab}
                onSelectNotice={setSelectedNotice}
                onSelectEvent={setSelectedEvent}
                notices={notices}
              />
            )}
            {activeTab === 'about' && (
              <AboutView isBangla={isBangla} teachers={teachers} />
            )}
            {activeTab === 'academics' && (
              <AcademicsView 
                isBangla={isBangla} 
                onSelectNotice={setSelectedNotice} 
                notices={notices}
              />
            )}
            {activeTab === 'admissions' && (
              <AdmissionsView isBangla={isBangla} />
            )}
            {activeTab === 'results' && (
              <ResultsView isBangla={isBangla} />
            )}
            {activeTab === 'gallery' && (
              <GalleryView isBangla={isBangla} />
            )}
            {activeTab === 'contact' && (
              <ContactView isBangla={isBangla} />
            )}
          </>
        )}
      </main>

      {/* Primary Shared Footer */}
      <footer className="w-full bg-[#1e333c] text-[#dff4ff] py-16 border-t border-slate-800" id="shared-portal-footer">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* School Introduction column */}
            <div className="md:col-span-2 space-y-4">
              <div 
                onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-full bg-white overflow-hidden flex items-center justify-center shrink-0 border border-white/10 shadow-sm">
                  <img 
                    src="https://i.postimg.cc/J4s8wZM9/damgara-school.jpg" 
                    alt="Damagara S.M. High School Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-md font-bold text-[#88d982] leading-tight select-none">
                    {isBangla ? 'দামাগারা সৈয়দ মিনা দ্বিমুখী উচ্চ বিদ্যালয়' : 'Damagara Syed Meena Dimukhe High School'}
                  </h3>
                  <p className="text-[10px] text-slate-400 select-none">Tarat gari, Bogra, Rajshahi, Bangladesh</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                {isBangla 
                  ? 'মানসম্মত শিক্ষা প্রদান ও শৃঙ্খলা অনুশীলনের মাধ্যমে ভবিষ্যৎ যোগ্য নাগরিক হিসেবে শিক্ষার্থী গড়ে তুলতে দামাগারা সৈয়দ মিনা দ্বিমুখী উচ্চ বিদ্যালয় প্রতিশ্রুতিবদ্ধ।' 
                  : 'Nurturing generations of scholars through academic excellence, disciplined leadership, and moral values. We shape the innovators and builders of tomorrow.'
                }
              </p>
            </div>

            {/* Quick Links Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#88d982] uppercase tracking-wider">
                {isBangla ? 'সহায়ক লিঙ্ক' : 'Useful Links'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => { setActiveTab('about'); window.scrollTo({ top: 0 }); }} className="hover:text-[#88d982] transition-colors cursor-pointer text-left">
                    {isBangla ? 'আমাদের সম্পর্কে' : 'About Faculty & History'}
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('academics'); window.scrollTo({ top: 0 }); }} className="hover:text-[#88d982] transition-colors cursor-pointer text-left">
                    {isBangla ? 'পরীক্ষা ও ক্লাস সময়সূচী' : 'School Timetables'}
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('admissions'); window.scrollTo({ top: 0 }); }} className="hover:text-[#88d982] transition-colors cursor-pointer text-left">
                    {isBangla ? 'অনলাইন ভর্তি ফর্ম' : 'Online Admissions form'}
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('results'); window.scrollTo({ top: 0 }); }} className="hover:text-[#88d982] transition-colors cursor-pointer text-left">
                    {isBangla ? 'মার্কশিট ফলাফল অনুসন্ধান' : 'Student Marksheet queries'}
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('gallery'); window.scrollTo({ top: 0 }); }} className="hover:text-[#88d982] transition-colors cursor-pointer text-left">
                    {isBangla ? 'ছবি গ্যালারি' : 'Photo Gallery'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Details Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#88d982] uppercase tracking-wider">
                {isBangla ? 'যোগাযোগ' : 'Official Office'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#88d982] shrink-0 mt-0.5" />
                  <span>W6WW+2F9, Tarat gari, Bogra 6300, Bangladesh.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#88d982] shrink-0" />
                  <span className="font-mono font-semibold text-slate-300 hover:text-white">+880 1711-366659</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#88d982] shrink-0" />
                  <span className="font-mono hover:text-[#88d982] cursor-pointer">info@damagarasmdhs.edu.bd</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright bar */}
          <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>© 2026 Damagara Syed Meena Dimukhe High School. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="hover:underline cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ADVANCED LIVE SEARCH MODAL OVERLAY */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 pt-[5vh] sm:pt-[10vh] overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full my-auto overflow-y-auto max-h-[90vh] shadow-2xl relative border border-slate-205 animate-scaleUp">
            
            {/* Search Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="h-5 w-5 text-primary shrink-0" />
              <input 
                type="text" 
                placeholder={isBangla ? 'খবর, নোটিশ বা পোর্টালে অনুসন্ধান করুন...' : 'Search school logs, notices, results...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full text-sm border-none focus:outline-none focus:ring-0 text-on-surface"
              />
              <button 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors text-slate-500 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Results Output box */}
            <div className="max-h-[360px] overflow-y-auto">
              {searchQuery.trim() ? (
                searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-50 p-2">
                    {searchResults.map((match, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (match.handler) {
                            match.handler();
                          } else {
                            setActiveTab(match.tab);
                            setIsSearchOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className="p-3 hover:bg-primary/5 rounded-xl cursor-pointer transition-colors flex justify-between items-center gap-4"
                      >
                        <div>
                          <p className="text-xs font-bold text-primary font-mono select-none">{match.type}</p>
                          <h4 className="text-sm font-semibold text-slate-800 leading-tight mt-0.5">{match.title}</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Go to tab</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">No matching school files or announcements found.</div>
                )
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs space-y-2">
                  <p className="font-bold text-slate-600">Quick Searches you can perform:</p>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <button onClick={() => setSearchQuery('admissions')} className="px-2.5 py-1 bg-slate-50 hover:bg-primary/5 rounded border text-[10px] font-bold">Admissions</button>
                    <button onClick={() => setSearchQuery('marksheet')} className="px-2.5 py-1 bg-slate-50 hover:bg-primary/5 rounded border text-[10px] font-bold">Result marksheet</button>
                    <button onClick={() => setSearchQuery('Science Fair')} className="px-2.5 py-1 bg-slate-50 hover:bg-primary/5 rounded border text-[10px] font-bold">Science Fair Event</button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SELECTED DYNAMIC DETAILED NOTICE BOARD INTERACTIVE MODAL */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full my-auto overflow-y-auto max-h-[96vh] md:max-h-[90vh] shadow-2xl relative border border-slate-200 animate-scaleUp">
            
            {/* Modal header details */}
            <div className="bg-primary hover:bg-primary-hover p-6 text-on-primary relative">
              <span className="text-[9px] font-extrabold tracking-widest text-[#cbffc2] bg-white/10 px-2.5 py-1 rounded-full uppercase">
                {selectedNotice.category} Notice Room
              </span>
              <h3 className="text-md md:text-lg font-bold mt-2 leading-tight">
                {isBangla && selectedNotice.banglaTitle ? selectedNotice.banglaTitle : selectedNotice.title}
              </h3>
              <p className="text-xs text-primary-fixed mt-1 font-mono font-bold">Published: {selectedNotice.publishDate}</p>

              <button 
                onClick={() => setSelectedNotice(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors text-white cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8 space-y-4 max-h-[60vh] overflow-y-auto text-sm text-on-surface-variant leading-relaxed">
              <p>
                {isBangla && selectedNotice.banglaContent ? selectedNotice.banglaContent : selectedNotice.content}
              </p>

              {/* Extra instructions warning card */}
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-xs text-on-surface-variant">
                <span className="font-bold text-slate-800 block mb-1">Administrative Note:</span>
                For further clarification or physical application forms regarding this announcement, please present this digital voucher code <span className="font-mono font-bold text-primary">{selectedNotice.id.toUpperCase()}</span> to school academic helpdesk.
              </div>
            </div>

            {/* Modal footer controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-between items-center">
              <button 
                onClick={() => setIsBangla(!isBangla)}
                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
              >
                <Globe className="h-4 w-4" />
                <span>{isBangla ? 'Translate to English' : 'বাংলায় দেখুন'}</span>
              </button>

              <button 
                onClick={() => setSelectedNotice(null)}
                className="bg-primary text-on-primary px-5 py-2 rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Close Notice
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SELECTED DYNAMIC NEWS EVENT INTERACTIVE POPUP MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full my-auto overflow-y-auto max-h-[96vh] md:max-h-[90vh] shadow-2xl relative border border-slate-200 animate-scaleUp flex flex-col">
            
            {/* Event header with image cover backdrop */}
            <div className="h-48 md:h-64 overflow-hidden relative shrink-0">
              <img alt="Class Cover" className="w-full h-full object-cover" src={selectedEvent.imageUrl} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
              
              {/* text overlays */}
              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.1">
                <span className="bg-[#cbffc2]/20 backdrop-blur px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wider border border-white/15">
                  {selectedEvent.category} • {selectedEvent.date}
                </span>
                <h3 className="text-base md:text-xl font-bold leading-tight">
                  {isBangla && selectedEvent.banglaTitle ? selectedEvent.banglaTitle : selectedEvent.title}
                </h3>
              </div>

              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-slate-950/50 backdrop-blur-md hover:bg-slate-950/70 p-1.5 rounded-full transition-colors text-white cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Event textual information */}
            <div className="p-6 md:p-8 space-y-4 overflow-y-auto text-sm text-on-surface-variant leading-relaxed">
              <p className="font-semibold text-slate-800">
                {selectedEvent.description}
              </p>
              <div className="border-t border-slate-100 pt-3">
                {selectedEvent.content}
              </div>
            </div>

            {/* footer sharing simulated elements */}
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-between items-center shrink-0">
              <div className="flex gap-2">
                <button className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary" title="Share with Parents Grid">
                  <Share2 className="h-4.5 w-4.5" />
                </button>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="bg-primary text-on-primary px-5 py-2 rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
              >
                {isBangla ? 'বন্ধ করুন' : 'Close Article'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MOBILE & TABLET BOTTOM FLOATING NAVIGATION BAR - Fully Responsive with Premium Theme */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg md:max-w-2xl z-40 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_12px_44px_rgba(0,0,0,0.12)] px-4 py-2 flex justify-around items-center select-none animate-fadeIn" id="mobile-bottom-navbar">
        {[
          { id: 'home', label: 'Home', banglaLabel: 'প্রচ্ছদ', icon: <Compass className="h-5 w-5" /> },
          { id: 'about', label: 'About Us', banglaLabel: 'আমাদের সম্পর্কে', icon: <Info className="h-5 w-5" />, tabletOnly: true },
          { id: 'academics', label: 'Academics', banglaLabel: 'একাডেমিক', icon: <Calendar className="h-5 w-5" /> },
          { id: 'admissions', label: 'Admissions', banglaLabel: 'ভর্তি', icon: <GraduationCap className="h-5 w-5" /> },
          { id: 'results', label: 'Results', banglaLabel: 'ফলাফল', icon: <FileCheck2 className="h-5 w-5" /> },
          { id: 'gallery', label: 'Gallery', banglaLabel: 'গ্যালারি', icon: <Image className="h-5 w-5" />, tabletOnly: true },
          { id: 'contact', label: 'Contact', banglaLabel: 'যোগাযোগ', icon: <Mail className="h-5 w-5" /> }
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`${item.tabletOnly ? 'hidden md:flex' : 'flex'} flex-col items-center justify-center py-1.5 px-2 md:px-4 rounded-xl transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'text-primary bg-primary/10 font-bold scale-105'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
              id={`mobile-tab-btn-${item.id}`}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] md:text-xs mt-1 font-bold tracking-tight">
                {isBangla ? item.banglaLabel : item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ADMIN AUTHENTICATION DIALOG */}
      <AdminAuthModal 
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        isBangla={isBangla}
      />

    </div>
  );
}

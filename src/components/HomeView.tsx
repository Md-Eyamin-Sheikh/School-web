/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  School, 
  FileText, 
  Calendar, 
  ArrowRight, 
  Megaphone, 
  Clock, 
  ChevronsRight, 
  Sparkles, 
  Compass, 
  Volume2, 
  ChevronRight,
  MapPin,
  Award,
  Video,
  X,
  HelpCircle,
  Plus,
  Minus
} from 'lucide-react';
import { Notice, NewsEvent } from '../types';
import { SCHOOL_NOTICES, SCHOOL_EVENTS } from '../data';

interface HomeViewProps {
  isBangla: boolean;
  setActiveTab: (tab: string) => void;
  onSelectNotice: (notice: Notice) => void;
  onSelectEvent: (event: NewsEvent) => void;
  notices?: Notice[];
}

export default function HomeView({
  isBangla,
  setActiveTab,
  onSelectNotice,
  onSelectEvent,
  notices = []
}: HomeViewProps) {
  const [isPlayingTour, setIsPlayingTour] = useState(false);
  const [showHeadmasterModal, setShowHeadmasterModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Filter notices for display
  const activeNotices = notices && notices.length > 0 ? notices : SCHOOL_NOTICES;
  const displayNotices = activeNotices.slice(0, 4);

  // Important upcoming academic dates
  const calendarDates = [
    { date: 'Jan 01, 2026', title: 'New Book Festival 2026', titleBn: 'নতুন বই উৎসব ২০২৬' },
    { date: 'Jan 15, 2026', title: 'Class 6 Admission Last Date', titleBn: '৬ষ্ঠ শ্রেণি ভর্তি শেষ তারিখ' },
    { date: 'Feb 12, 2026', title: 'Admissions Test Results Out', titleBn: 'ভর্তি পরীক্ষার ফলাফল প্রকাশ' },
    { date: 'Feb 25, 2026', title: 'Annual Sports Day 2026', titleBn: 'বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬' },
    { date: 'Mar 15, 2026', title: 'First Term Examination Starts', titleBn: 'প্রথম সাময়িক পরীক্ষা শুরু' }
  ];

  return (
    <div className="animate-fadeIn">
      {/* Ticker / Notice Scroller */}
      <div className="bg-primary-container text-on-primary-container w-full border-b border-outline-variant overflow-hidden flex items-center shadow-sm">
        <div className="bg-primary text-on-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 z-10 shadow-md">
          <Megaphone className="h-4 w-4 animate-bounce" />
          <span>{isBangla ? 'জরুরি নোটিশ' : 'Urgent Notice'}</span>
        </div>
        <div className="relative flex-1 overflow-hidden h-10 flex items-center">
          <div className="absolute whitespace-nowrap animate-[marquee_25s_linear_infinite] flex items-center gap-12 font-semibold text-sm hover:[animation-play-state:paused] cursor-pointer">
            <span onClick={() => onSelectNotice(activeNotices[0] || SCHOOL_NOTICES[0])} className="hover:underline">
              {isBangla ? '৬ষ্ঠ শ্রেণিতে ভর্তি ২০২৬ কার্যক্রম শুরু হয়েছে। শেষ সময়: ১৫ জানুয়ারি।' : 'Admission for Class VI is now open. Last date: 15th January.'}
            </span>
            <span className="text-tertiary font-bold">•</span>
            <span onClick={() => onSelectNotice(activeNotices[1] || SCHOOL_NOTICES[1])} className="hover:underline">
              {isBangla ? 'বার্ষিক ক্রীড়া প্রতিযোগিতা আগামী ২৫ ফেব্রুয়ারি অনুষ্ঠিত হবে।' : 'Annual Sports Day scheduled for 25th February. All students must register.'}
            </span>
            <span className="text-tertiary font-bold">•</span>
            <span onClick={() => onSelectNotice(activeNotices[2] || SCHOOL_NOTICES[2])} className="hover:underline">
              {isBangla ? 'বার্ষিক পরীক্ষা ২০২৫ এর মার্কশিট প্রকাশ করা হয়েছে।' : 'Annual Examination 2025 Marksheets published in the Results section.'}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative w-full h-[55vh] min-h-[480px] md:h-[650px] bg-slate-900 overflow-hidden flex items-center">
        {/* Real panoramic high-quality school background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[8s] scale-105 transform hover:scale-100"
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCwqjuSDDZFYl4rbpmYMk0PT3fCh5_VwRyJXWJ12YmtTNt7RN0uGD8M85cWcDy692YGH3dqtF6qFiilYp1u_A9KBT-b3JaoxvefpoNHQJu8TexYteqH38Jh83gUXC8J2e_I8M4UyzJxXdor7I0XfQPoEGH9W8kFs_F4dIIt_o0LX94-nrm6SRnIOr2Lt9Rky1I7SCaFUx-BtIMYqvyWNyi8CvIGYj_LZI2twVaE365skW40_fU3V7PlPaANSW1y_bnGovg3NffzwrQ')" 
          }}
        />
        {/* Gradient dark overlay for majestic readability */}
        <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-r from-slate-950/90 via-slate-900/40 to-slate-900/10" />

        <div className="relative max-w-7xl mx-auto w-full px-4 md:px-6 flex flex-col justify-center">
          <div className="max-w-3xl text-white space-y-6">
            {/* Bengali Headline */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold bengali-heading leading-tight tracking-tight text-white drop-shadow-lg drop-shadow-black">
              স্বাগতম<br />
              <span className="text-primary-fixed">দামাগারা সৈয়দ মিনা দ্বিমুখী উচ্চ বিদ্যালয়ে</span>
            </h2>

            {/* English Secondary Headline */}
            <h3 className="text-lg md:text-2xl font-bold tracking-tight text-surface-container-high drop-shadow-md">
              Welcome to Damagara Syed Meena Dimukhe High School
            </h3>

            {/* School Mission paragraph */}
            <p className="text-sm md:text-lg text-slate-300 drop-shadow-sm max-w-xl font-normal leading-relaxed">
              {isBangla 
                ? 'সাফল্য, শৃঙ্খলা ও মানবিক মূল্যবোধের চমৎকার সমন্বয়ে ভবিষ্যৎ নেতৃত্ব গড়ে তোলাই আমাদের লক্ষ্য। আমাদের জ্ঞান পরিবারে আপনাকে সাদর আমন্ত্রণ।' 
                : 'Empowering students with knowledge, discipline, and character for a brighter tomorrow. Join our community of academic excellence.'
              }
            </p>

            {/* Hero CTA buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => setActiveTab('admissions')}
                className="bg-primary text-on-primary px-8 py-3.5 rounded-lg text-sm font-bold hover:bg-primary-hover transition-all duration-300 shadow-md cursor-pointer flex items-center gap-2 transform hover:-translate-y-0.5"
                id="hero-apply-btn"
              >
                <span>{isBangla ? 'অনলাইনে ভর্তি হোন' : 'Apply Now'}</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>

              <button 
                onClick={() => setIsPlayingTour(true)}
                className="border-2 border-primary-fixed-dim text-primary-fixed px-7 py-3 rounded-lg text-sm font-bold hover:bg-primary/20 transition-all duration-300 bg-slate-900/40 backdrop-blur-sm cursor-pointer flex items-center gap-2 transform hover:-translate-y-0.5"
                id="hero-tour-btn"
              >
                <Video className="h-4.5 w-4.5" />
                <span>{isBangla ? 'ভার্চুয়াল ট্যুর' : 'Virtual Tour'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Quick Links & Mobile Hotlinks */}
      <section className="py-8 max-w-7xl mx-auto px-4 md:px-6 relative z-10 -mt-12">
        {/* Mobile quick action dashboard - optimized for 98% mobile traffic */}
        <div className="bg-white border border-outline-variant/80 rounded-3xl p-5 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <h4 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-wider select-none">
              {isBangla ? 'মোবাইল কুইক সার্ভিস সেল' : 'Mobile Student Portal Hub'}
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button 
              onClick={() => setActiveTab('admissions')}
              className="p-3.5 bg-sky-50 hover:bg-sky-100/80 active:scale-95 text-sky-800 rounded-2xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer border border-sky-100"
            >
              <div className="p-2 bg-white rounded-xl shadow-xs text-sky-600">
                <School className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold leading-tight">
                {isBangla ? 'অনলাইন ভর্তি' : 'Online Admission'}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('results')}
              className="p-3.5 bg-emerald-50 hover:bg-emerald-100/80 active:scale-95 text-emerald-800 rounded-2xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer border border-emerald-100"
            >
              <div className="p-2 bg-white rounded-xl shadow-xs text-emerald-600">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold leading-tight">
                {isBangla ? 'মার্কশিট ও ফল' : 'Marksheet & Results'}
              </span>
            </button>

            <a 
              href="tel:+8801711366659"
              className="p-3.5 bg-amber-50 hover:bg-amber-100/80 active:scale-95 text-amber-900 rounded-2xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer border border-amber-100"
            >
              <div className="p-2 bg-white rounded-xl shadow-xs text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold leading-tight">
                {isBangla ? 'জরুরি হেল্পলাইন' : 'Tap to Call Office'}
              </span>
            </a>

            <button 
              onClick={() => setIsPlayingTour(true)}
              className="p-3.5 bg-purple-50 hover:bg-purple-100/80 active:scale-95 text-purple-800 rounded-2xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer border border-purple-100"
            >
              <div className="p-2 bg-white rounded-xl shadow-xs text-purple-600">
                <Video className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold leading-tight">
                {isBangla ? 'ভার্চুয়াল ক্যাম্পাস' : '360° Virtual Tour'}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admissions Card */}
          <div 
            onClick={() => setActiveTab('admissions')} 
            className="group bg-white border border-outline-variant rounded-2xl p-5 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex items-start gap-4 hover:-translate-y-1"
          >
            <div className="bg-primary/10 p-3.5 rounded-xl text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 shrink-0">
              <School className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-md md:text-lg font-bold text-on-surface mb-1 shadow-xs tracking-tight group-hover:text-primary transition-colors">
                {isBangla ? 'ভর্তি নির্দেশিকা ২০২৬' : 'Admissions 2026'}
              </h4>
              <p className="text-xs md:text-sm text-on-surface-variant mb-3 leading-relaxed">
                {isBangla ? 'নতুন বর্ষে ভর্তি কার্যক্রমের নিয়মাবলী, প্রয়োজনীয় তথ্য ও সরাসরি আবেদন ফর্ম।' : 'Read modern enrollment instructions, fee rules, and submit application fields directly.'}
              </p>
              <span className="text-primary text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>{isBangla ? 'বিস্তারিত দেখুন' : 'Apply Now'}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>

          {/* Results Card */}
          <div 
            onClick={() => setActiveTab('results')} 
            className="group bg-white border border-outline-variant rounded-2xl p-5 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex items-start gap-4 hover:-translate-y-1"
          >
            <div className="bg-primary/10 p-3.5 rounded-xl text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-md md:text-lg font-bold text-on-surface mb-1 tracking-tight group-hover:text-primary transition-colors">
                {isBangla ? 'ডিজিটাল মার্কশিট' : 'Digital Marksheets'}
              </h4>
              <p className="text-xs md:text-sm text-on-surface-variant mb-3 leading-relaxed">
                {isBangla ? 'অনলাইনে রোল বা স্টুডেন্ট আইডি সাবমিট করে তাৎক্ষণিক ফল ও প্রগ্রেস রিপোর্ট দেখুন।' : 'Instantly fetch recent exam scorecards, and historical GPA tallies online.'}
              </p>
              <span className="text-primary text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>{isBangla ? 'ফলাফল অনুসন্ধান' : 'Find Marksheet'}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>

          {/* Academic Calendar Card */}
          <div 
            onClick={() => setShowCalendarModal(true)} 
            className="group bg-white border border-outline-variant rounded-2xl p-5 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex items-start gap-4 hover:-translate-y-1"
          >
            <div className="bg-primary/10 p-3.5 rounded-xl text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 shrink-0">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-md md:text-lg font-bold text-on-surface mb-1 tracking-tight group-hover:text-primary transition-colors">
                {isBangla ? 'একাডেমিক ক্যালেন্ডার' : 'Holiday Calendar'}
              </h4>
              <p className="text-xs md:text-sm text-on-surface-variant mb-3 leading-relaxed">
                {isBangla ? '২০২৬ শিক্ষাবর্ষের সকল অ্যাকাডেমিক কার্যক্রম, ছুটির তালিকা ও ইভেন্ট সময়সূচী।' : 'Review school days, upcoming tests, and authorized holiday details.'}
              </p>
              <span className="text-primary text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>{isBangla ? 'ক্যালেন্ডার ওপেন করুন' : 'Open Calendar'}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Headmaster Message & Notice Board Split */}
      <section className="py-12 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Headmaster Message Block (Left) */}
          <div className="lg:col-span-7 bg-white/70 border border-outline-variant/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-5 w-1.5 bg-primary rounded-full"></div>
              <h3 className="text-2xl font-bold text-on-surface bengali-heading">
                {isBangla ? 'প্রধান শিক্ষকের বাণী' : 'Principal\'s Dialogue'}
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Photo */}
              <div className="shrink-0 mx-auto sm:mx-0">
                <div className="relative group overflow-hidden rounded-2xl border border-outline-variant shadow-md">
                  <img 
                    alt="Headmaster Portrait" 
                    className="w-36 h-48 md:w-44 md:h-56 object-cover transform duration-500 hover:scale-105" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB06KFjNO_pB_0Rlb7LNFeuETlVQCaHRqjjS2k-kLQ6z7RqNehnQOr5iLFHbg49tFeThzu5P55FbRb2ejInYVmDfxhtr5LwsZTljs6nwn-KZkfFA8VvWEb5xqyOrEXQ61EjRtGqnqk_407GDgenQZbbK6TkfS88zFb7WoKFfaQhuG9BV76LK1Na1Ua_lodikx43d14aY_Ng69EvB7gcPNEPRzxHDwd3gTJCURh0Fmt_RT_2Pjw8tHU3N1dTYXyKmYJZspXnS1tudFo" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                    <span className="text-[10px] text-white bg-primary px-2 py-0.5 rounded-full font-bold">Md. Abul Kalam Shahana</span>
                  </div>
                </div>
              </div>

              {/* Text content summary */}
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 leading-tight">
                    {isBangla ? 'মোঃ আবুল কালাম শাহানা' : 'Md. Abul Kalam Shahana'}
                  </h4>
                  <p className="text-xs font-bold text-primary uppercase tracking-wide mb-3">
                    {isBangla ? 'প্রধান শিক্ষক' : 'Headmaster'}
                  </p>
                  
                  <div className="text-sm text-on-surface-variant leading-relaxed space-y-3 italic">
                    <p>
                      {isBangla 
                        ? '“দামাগারা সৈয়দ মিনা দ্বিমুখী উচ্চ বিদ্যালয়ে আপনাকে স্বাগত। আমাদের শুরু থেকেই লক্ষ্য শিক্ষাদানের পাশাপাশি শিক্ষার্থীদের উন্নত নৈতিক আদর্শ ও নিয়মানুবর্তিতা সম্পন্ন নাগরিক হিসেবে গড়ে তোলা...”'
                        : '“Welcome to Damagara Syed Meena Dimukhe High School. Since our inception, we have been committed to providing a holistic education that not only focuses on academic excellence but also on character building...”'
                      }
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setShowHeadmasterModal(true)}
                    className="text-primary text-xs font-bold border-b-2 border-primary pb-0.5 hover:text-primary-hover transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isBangla ? 'সম্পূর্ণ বক্তব্য পড়ুন' : 'Read Full Message'}</span>
                    <ChevronsRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notice Board (Right) */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white border border-outline-variant rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant flex justify-between items-center">
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  <span>{isBangla ? 'নোটিশ বোর্ড' : 'Notice Board'}</span>
                </h3>
                <span className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-bold">
                  {activeNotices.length} {isBangla ? 'টি নোটিশ' : 'Notices'}
                </span>
              </div>

              {/* Notice listings */}
              <div className="divide-y divide-outline-variant flex-1 max-h-[360px] overflow-y-auto" id="notice-board-list">
                {displayNotices.map((notice) => (
                  <div
                    key={notice.id}
                    onClick={() => onSelectNotice(notice)}
                    className="p-5 hover:bg-surface-container-low transition-all duration-150 cursor-pointer group border-l-4 border-l-primary/40 hover:border-l-primary flex flex-col gap-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-on-surface-variant font-semibold flex items-center gap-1 font-mono">
                        <Clock className="h-3.5 w-3.5 text-primary/60" />
                        {notice.publishDate}
                      </span>
                      {notice.isNew && (
                        <span className="bg-tertiary text-on-tertiary px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase animate-pulse">
                          {isBangla ? 'নতুন' : 'New'}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors leading-tight">
                      {isBangla && notice.banglaTitle ? notice.banglaTitle : notice.title}
                    </h4>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-surface-container-low border-t border-outline-variant text-center">
                <button 
                  onClick={() => setActiveTab('academics')}
                  className="text-primary text-xs font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{isBangla ? 'সকল নোটিশ দেখুন' : 'View All Notices'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Latest News & Events Section */}
      <section className="py-14 bg-surface-container-low w-full border-y border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-2">
              <div className="h-5 w-1.5 bg-primary rounded-full"></div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
                {isBangla ? 'বিদ্যালয়ের বিভিন্ন ইভেন্ট ও ঘটনাবলী' : 'Various School Events'}
              </h3>
            </div>
            <button 
              onClick={() => setActiveTab('gallery')}
              className="text-primary text-sm font-bold hover:underline hidden md:flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isBangla ? 'সকল ইভেন্ট দেখুন' : 'View All Events'}</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="news-events-grid">
            {SCHOOL_EVENTS.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelectEvent(item)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full"
              >
                {/* Event Cover Image */}
                <div className="h-48 overflow-hidden relative">
                  <img 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    src={item.imageUrl} 
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold">
                    {item.date}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary mb-1 block">
                      {item.category}
                    </span>
                    <h4 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                      {isBangla && item.banglaTitle ? item.banglaTitle : item.title}
                    </h4>
                    <p className="text-xs text-on-surface-variant line-clamp-3 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs font-bold text-primary border-t border-slate-100">
                    <span>{isBangla ? 'বিস্তারিত পড়ুন' : 'Read Full Story'}</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Highlights Showcase Row */}
      <section className="py-12 max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex items-center gap-4 p-4 bg-white border border-outline-variant/60 rounded-2xl shadow-sm">
          <div className="bg-primary-container text-on-primary-container p-3.5 rounded-xl">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-on-surface">100% Pass Rate</h5>
            <p className="text-[11px] text-on-surface-variant">In recent Secondary Board SSC standard</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white border border-outline-variant/60 rounded-2xl shadow-sm">
          <div className="bg-primary-container text-on-primary-container p-3.5 rounded-xl">
            <School className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-on-surface">Experienced Body</h5>
            <p className="text-[11px] text-on-surface-variant">25+ Expert M.Ed/B.Ed Faculty members</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white border border-outline-variant/60 rounded-2xl shadow-sm">
          <div className="bg-primary-container text-on-primary-container p-3.5 rounded-xl">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-on-surface">Modern Amenities</h5>
            <p className="text-[11px] text-on-surface-variant">Fully functional ICT Lab & library</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white border border-outline-variant/60 rounded-2xl shadow-sm">
          <div className="bg-primary-container text-on-primary-container p-3.5 rounded-xl">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-on-surface">Peaceful Campus</h5>
            <p className="text-[11px] text-on-surface-variant">Lush green rural, secure study environment</p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section className="py-16 bg-white border-y border-outline-variant/40" id="faq-section">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
              <HelpCircle className="h-3.5 w-3.5 animate-pulse" />
              <span>{isBangla ? 'সাধারণ জিজ্ঞাসা' : 'FAQs'}</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight bengali-heading">
              {isBangla ? 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী' : 'Frequently Asked Questions'}
            </h3>
            <p className="text-xs md:text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
              {isBangla 
                ? 'বিদ্যালয়ের অভ্যন্তরীণ কার্যক্রম, ভর্তি ও ফলাফল সংক্রান্ত সাধারণ প্রশ্নসমূহের উত্তর এখানে দেখুন।' 
                : 'Find helpful answers to common questions regarding admissions, results, routines, and administrative portals.'}
            </p>
          </div>

          <div className="space-y-4" id="faq-accordion-container">
            {[
              {
                q: 'How can I apply for admission online?',
                qBn: 'আমি কীভাবে অনলাইনে ভর্তির জন্য আবেদন করতে পারি?',
                a: 'To apply, navigate to our Admissions tab from the header menu. There you will find the step-by-step guideline, fee structure, and a dynamic online registration form to fill out and submit.',
                aBn: 'আবেদন করার জন্য, হেডার মেনু থেকে "ভর্তি কার্যক্রম" (Admissions) ট্যাবে যান। সেখানে আপনি ধাপে ধাপে নির্দেশিকা, ফি স্ট্রাকচার এবং একটি অনলাইন আবেদন ফর্ম পাবেন যা পূরণ করে সরাসরি সাবমিট করতে পারবেন।'
              },
              {
                q: 'How do I check my examination results and marksheet?',
                qBn: 'আমি কীভাবে পরীক্ষার ফলাফল এবং মার্কশিট দেখতে পারি?',
                a: 'Go to the "Results" tab in the main navigation. You can enter your unique student ID or Roll ID to view, download, and print your direct academic progress reports in real time.',
                aBn: 'নেভিগেশন বারের "ফলাফল" (Results) ট্যাবে যান। সেখানে আপনার ইউনিক স্টুডেন্ট আইডি বা রোল আইডি প্রবেশ করিয়ে সরাসরি রিয়েল টাইমে আপনার প্রাতিষ্ঠানিক প্রগ্রেস রিপোর্ট দেখতে ও ডাউনলোড করতে পারবেন।'
              },
              {
                q: 'What is the school\'s established EIIN and history?',
                qBn: 'বিদ্যালয়ের EIIN নম্বর ও প্রতিষ্ঠার ইতিহাস কী?',
                a: 'Damagara Syed Meena Dimukhe High School is a historic institution committed to academic and moral excellence in our locality. Under our settings panel, you can view official parameters such as our EIIN number and historical records.',
                aBn: 'দামাগারা সৈয়দ মিনা দ্বিমুখী উচ্চ বিদ্যালয় এই অঞ্চলের এক ঐতিহ্যবাহী শিক্ষাপ্রতিষ্ঠান। আমাদের ইনফরমেশন সেকশনে গেলে আমাদের অফিসিয়াল EIIN নম্বর এবং বিদ্যালয়ের প্রতিষ্ঠার গৌরবময় ইতিবৃত্ত দেখতে পাবেন।'
              },
              {
                q: 'Does the school support extra and co-curricular activities?',
                qBn: 'বিদ্যালয়ে কি সহ-শিক্ষা কার্যক্রমের সুযোগ রয়েছে?',
                a: 'Absolutely! We host a variety of extracurricular programs including annual athletics & sports competitions, science exploration clubs, language learning cohorts, and cultural festivals.',
                aBn: 'অবশ্যই! আমাদের শিক্ষার্থীদের শারীরিক ও মানসিক বিকাশের জন্য বার্ষিক ক্রীড়া প্রতিযোগিতা, বিজ্ঞান ক্লাব, ভাষা শিক্ষা কোহর্ট এবং বিভিন্ন সাংস্কৃতিক উৎসব নিয়মিতভাবে আয়োজন করা হয়।'
              },
              {
                q: 'How can parents contact teachers or the administration?',
                qBn: 'অভিভাবকরা কীভাবে শিক্ষক বা প্রশাসনের সাথে যোগাযোগ করবেন?',
                a: 'You can visit our dedicated "Contact" section to find official telephone hotlines, email addresses, and location maps. You can also write an instant direct query/feedback message from there.',
                aBn: 'যোগাযোগের জন্য সরাসরি "যোগাযোগ" (Contact) পৃষ্ঠায় যান। সেখানে প্রয়োজনীয় টেলিফোন হটলাইন নম্বর, অফিসিয়াল ইমেইল অ্যাড্রেস এবং গুগল ম্যাপের অবস্থান পাবেন। তাছাড়া সরাসরি বার্তা পাঠানোর ও ফিডব্যাক দেওয়ার সুবিধাও রয়েছে।'
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-[#faf9f6]/40 border border-outline-variant/60 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex justify-between items-center gap-4 hover:bg-primary/5 transition-colors cursor-pointer select-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm md:text-base font-bold text-on-surface leading-snug">
                      {isBangla ? faq.qBn : faq.q}
                    </span>
                    <span className="shrink-0 p-1.5 bg-white border border-outline-variant/40 rounded-xl text-primary flex items-center justify-center">
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-on-surface-variant leading-relaxed border-t border-dashed border-outline-variant/40 animate-fadeIn">
                      <p>{isBangla ? faq.aBn : faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Headmaster Message Modal Content */}
      {showHeadmasterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full my-auto overflow-y-auto max-h-[96vh] md:max-h-[90vh] shadow-2xl relative border border-slate-200/80 animate-scaleUp">
            <div className="bg-primary text-on-primary p-6">
              <h3 className="text-lg font-bold">{isBangla ? 'প্রধান শিক্ষকের বাণী (সম্পূর্ণ বক্তব্য)' : 'Headmaster\'s Message'}</h3>
              <p className="text-xs text-primary-fixed">Damagara Syed Meena Dimukhe High School</p>
            </div>
            <div className="p-6 md:p-8 space-y-4 max-h-[70vh] overflow-y-auto text-sm text-on-surface-variant leading-relaxed">
              <div className="flex items-center gap-4 border-b border-outline-variant pb-4">
                <img 
                  alt="Md. Abul Kalam Shahana Portrait" 
                  className="w-14 h-18 object-cover rounded-lg" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB06KFjNO_pB_0Rlb7LNFeuETlVQCaHRqjjS2k-kLQ6z7RqNehnQOr5iLFHbg49tFeThzu5P55FbRb2ejInYVmDfxhtr5LwsZTljs6nwn-KZkfFA8VvWEb5xqyOrEXQ61EjRtGqnqk_407GDgenQZbbK6TkfS88zFb7WoKFfaQhuG9BV76LK1Na1Ua_lodikx43d14aY_Ng69EvB7gcPNEPRzxHDwd3gTJCURh0Fmt_RT_2Pjw8tHU3N1dTYXyKmYJZspXnS1tudFo" 
                />
                <div>
                  <h4 className="text-base font-bold text-slate-900">{isBangla ? 'মোঃ আবুল কালাম শাহানা' : 'Md. Abul Kalam Shahana'}</h4>
                  <p className="text-xs text-primary font-bold">Headmaster, M.Sc, M.Ed</p>
                </div>
              </div>
              <p>
                {isBangla 
                  ? 'আসসালামু আলাইকুম। অত্যন্ত আনন্দের সাথে জানাচ্ছি দামাগারা সৈয়দ মিনা দ্বিমুখী উচ্চ বিদ্যালয়ের শিক্ষার্থীদের জন্য আমরা এই আধুনিক ওয়েব পোর্টাল চালু করলাম। আমাদের লক্ষ্য কেবল সিলেবাস শেষ করা নয়; প্রতিটি সন্তানের মধ্যকার সুপ্ত প্রতিভা অন্বেষণ করা এবং সত্য, নিষ্ঠা ও শৃঙ্খলা শিক্ষা দিয়ে একজন সুনাগরিক হিসেবে তাদেরকে গড়ে তোলা।'
                  : 'Assalamu Alaikum. It is my absolute joy to welcome you to our school. We take pride in building a strong educational legacy in this locality. Over the decades, we have mentored generations of scholars who are serving the nation with dignity and brilliance.'
                }
              </p>
              <p>
                {isBangla 
                  ? 'আমরা বিশ্বাস করি শিক্ষক ও অভিভাবকের যৌথ মেলবন্ধনেই শিক্ষার্থীর প্রকৃত বিকাশ সম্ভব। আমাদের সকল সম্মানিত শিক্ষক মণ্ডলী অত্যন্ত আন্তরিকতার সাথে আধুনিক মাল্টিমিডিয়ার সাহায্যে শ্রেণী কার্যক্রম পরিচালনা করে চলেছেন। আসুন আমরা সবাই মিলে আমাদের সন্তানের সুন্দর ভবিষ্যৎ গঠনে সহায়ক হই।'
                  : 'Our curriculum combines the national standards with dynamic extra-curricular facilities like Mathematics Club, Language Club, annual outdoor sports, and science exploration workshops. We encourage active guardian involvement as we write the stories of success. Thank you.'
                }
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-outline-variant text-right">
              <button 
                onClick={() => setShowHeadmasterModal(false)}
                className="bg-primary text-on-primary px-5 py-2 rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
              >
                {isBangla ? 'বন্ধ করুন' : 'Close Dialogue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Academic Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full my-auto overflow-y-auto max-h-[96vh] md:max-h-[90vh] shadow-2xl relative border border-slate-200/80 animate-scaleUp">
            <div className="bg-primary text-on-primary p-5 flex justify-between items-center">
              <div>
                <h3 className="text-md font-bold">{isBangla ? 'শিক্ষাবর্ষ ২০২৬ গুরুত্বপূর্ণ দিবস' : 'Upcoming Academic Dates 2026'}</h3>
                <p className="text-xs text-primary-fixed">Damagara SMD High School</p>
              </div>
              <Calendar className="h-5 w-5 opacity-80" />
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {calendarDates.map((dateItem, idx) => (
                <div key={idx} className="flex gap-4 items-start border-b border-slate-100 pb-3 last:border-none last:pb-0">
                  <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-center font-mono text-xs font-bold select-none shrink-0 min-w-24">
                    {dateItem.date}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 leading-tight">
                      {isBangla ? dateItem.titleBn : dateItem.title}
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">2026 Academic Session</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 border-t border-outline-variant text-right">
              <button 
                onClick={() => setShowCalendarModal(false)}
                className="bg-primary text-on-primary px-5 py-2 rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
              >
                {isBangla ? 'বন্ধ করুন' : 'Close Calendar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Immersive Mock Virtual Tour Modal */}
      {isPlayingTour && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl sm:rounded-3xl max-w-4xl w-full my-auto overflow-y-auto max-h-[96vh] md:max-h-[85vh] relative border border-slate-800 flex flex-col h-[85vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center text-white bg-slate-950">
              <div className="flex items-center gap-2 text-primary-fixed">
                <Compass className="h-5 w-5 animate-spin-slow" />
                <span className="font-bold text-sm tracking-wide md:text-base">
                  {isBangla ? 'বিদ্যালয়ের ৩৬০° ভার্চুয়াল ইন্টারেক্টিভ ট্যুর' : '360° Desktop Virtual Campus Exploration'}
                </span>
              </div>
              <button 
                onClick={() => setIsPlayingTour(false)}
                className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Simulated interactive 360 viewer */}
            <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center">
              {/* Dynamic Simulated panorama panning backdrop */}
              <div 
                className="absolute inset-0 bg-cover bg-center brightness-90 animate-infinite-pan"
                style={{ 
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCwqjuSDDZFYl4rbpmYMk0PT3fCh5_VwRyJXWJ12YmtTNt7RN0uGD8M85cWcDy692YGH3dqtF6qFiilYp1u_A9KBT-b3JaoxvefpoNHQJu8TexYteqH38Jh83gUXC8J2e_I8M4UyzJxXdor7I0XfQPoEGH9W8kFs_F4dIIt_o0LX94-nrm6SRnIOr2Lt9Rky1I7SCaFUx-BtIMYqvyWNyi8CvIGYj_LZI2twVaE365skW40_fU3V7PlPaANSW1y_bnGovg3NffzwrQ')",
                  width: '200%',
                }}
              />
              
              {/* UI Controls overlay */}
              <div className="absolute inset-x-0 bottom-4 flex justify-center gap-4 px-4">
                <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-full flex items-center gap-5 border border-white/10 shadow-lg text-white text-xs">
                  <span className="font-bold flex items-center gap-1.5 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    <span>{isBangla ? 'স্বয়ংক্রিয় প্যানিং হচ্ছে' : 'Camera Auto-Panning'}</span>
                  </span>
                  <div className="h-4 w-px bg-white/20"></div>
                  <button className="hover:text-primary transition-colors cursor-pointer">{isBangla ? 'মূল তোরণ' : 'Main Gate'}</button>
                  <button className="font-bold text-primary-fixed">{isBangla ? 'খেলার মাঠ' : 'Sports Field'}</button>
                  <button className="hover:text-primary transition-colors cursor-pointer">{isBangla ? 'শ্রেণিকক্ষ' : 'Academic Classrooms'}</button>
                </div>
              </div>

              {/* Compass Indicator decoration */}
              <div className="absolute top-4 right-4 bg-slate-900/80 border border-white/10 rounded-xl p-3 text-white flex flex-col items-center">
                <span className="text-[9px] font-bold text-slate-400">DIRECTION</span>
                <Compass className="h-10 w-10 text-primary-fixed animate-spin-slow transition-transform mt-1" />
                <span className="text-[10px] font-bold mt-1 tracking-wider">N 012° E</span>
              </div>
            </div>

            {/* footer guide */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-slate-400 text-xs flex justify-between items-center px-6">
              <span>{isBangla ? 'ক্যামেরা ড্র্যাগ করতে মাউস ব্যবহার করুন' : 'Click & hold option to simulate drag rotation'}</span>
              <button 
                onClick={() => setIsPlayingTour(false)}
                className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
              >
                {isBangla ? 'সম্পূর্ণ করুন' : 'Finish Tour'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

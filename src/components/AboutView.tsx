/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Flag,
  FlaskConical,
  GraduationCap,
  History,
  Lightbulb,
  Mail,
  Trophy,
  User,
  Users
} from 'lucide-react';
import { SCHOOL_FACULTY } from '../data';
import { Faculty } from '../types';

interface AboutViewProps {
  isBangla: boolean;
  teachers?: any[];
}

export default function AboutView({ isBangla, teachers = [] }: AboutViewProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  const activeTeachers = teachers && teachers.length > 0 ? teachers : SCHOOL_FACULTY;

  // Governing board mock profiles (structured properly as requested in visual mockups)
  const governingBoard = [
    {
      name: 'Dr. A. Rahman',
      banglaName: 'ড. এ. রহমান',
      designation: 'Chairman',
      banglaDesignation: 'সম্মানিত সভাপতি',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUJwZY_P-yTKn_So9Etgg7eVxvmgUXxcC26U4fy0Ju_YF1svFY-SocXQyrxozjx-Qn-Yz374a4YalZFU42_4NJPpWmOqOpn0WSqFbV7GFFgz0bugWnRObV1yGMcB4KbSgS0u4PlVM6-jo9HAWv3cIPR8caI_BLG1c4l4UsybwVRe6EoTxaUtz7fmhcPxYIsHmT7imUgjyfRIxIYkvvYKD6hNZEjuBhdg7-gJQyxDMhXYVm1nluvrPWLr4Ke-aFTcrLxQdLTSoj6iA'
    },
    {
      name: 'Mrs. F. Begum',
      banglaName: 'বেগম ফাতেমা বেগম',
      designation: 'Principal',
      banglaDesignation: 'অধ্যক্ষ ও উপদেষ্টা',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_utPmOuHG9F8hGxUXXBW9Hd2qvTJq4HVrhsGKWZm8KnLcWEAkOVcn4UgWMera2DCRtVXS_dLQXZLhLzpambGwKtQ_l1RZhUh_FkYirBfk_HMu0DOGcfYGLk0gccxbqyvEeXIHjdLCD18XfGt1LpL85sSIF9aI8vaynkv0ryRV3FYBSgOb1_V7uLXow9_YOBTzVO18M6yl5cJN_fiXMVKVpc3ugfgPmXG87-9h2_P20i1qtnBMC6wD3iuUckTeEM_pH5nQzA-q_FI'
    },
    {
      name: 'Mr. S. Khan',
      banglaName: 'জনাব এস. খান',
      designation: 'Director of Academics',
      banglaDesignation: 'শিক্ষাবিষয়ক পরিচালক',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc39cBxUBSXEaLxwjODToOti1Fb_6DEHWDMX1c-1Fp0yMF9np1hKYq7usrdHmkbRoPxbMtu3ioMns_MkX31JzNa0RD51pl_UpYGdoboLNAn31YEV4ulbrqNDg_4I_X-uQiTMmy1frW-oapHFL2vZWxExp_CIfKfzAC-GfzhAqmS1VhExFx842yurlpZzhs_ud2EFS0wrZd10Qwv0pyE90xLs3xEj0BAraeDdhKGHXNUvaP3FnmMenFe9rpFNtzspxsC8_EjNFD7yY'
    },
    {
      name: 'Ms. N. Ali',
      banglaName: 'মোসাঃ নাবিলা আলী',
      designation: 'Head Administrator',
      banglaDesignation: 'প্রধান সমন্বয়ক ও পরিচালক',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwYuDd_ebc6z9RtD4PEg8zkuFtXhBhsljj62INDJg9yDsxJidl_rgtB8vfx6kaIfXTFG3CvKpw7o6HFeI86vESSZgDL3T6IVuep_VjwGlUMo3nygV363eczlrdnX1uwfZ4stGWD6q7H-7BC2Noeb_00zZPwJBpaMHlJ9fGoVbZwhwYPRFexU_CFnTNIXPOiIvEN8YuRKTOjNb1vWMztf7LrWvpySF-TXsf7ldINhpkk0_U2d3d8WXGTZECVy_tjlfpIoxzuKdqTY0'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-16 animate-fadeIn">
      
      {/* Hero Header Section */}
      <section className="relative h-[340px] md:h-[400px] w-full rounded-3xl overflow-hidden shadow-lg border border-outline-variant bg-slate-900">
        <img 
          className="absolute inset-0 w-full h-full object-cover opacity-35" 
          alt="School Panoramic Frontage"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGFSXw0c4xyBOUp62OaHis28oOFUHNxyjMIOf-HggFGkQ1Pxib13x6sThVJdSeYHgYh_skU4_G7Ulhz3ZA55Ic6jTBJsjvCsXZOhON7i8ab6aFxd_VgsyevisXH3Dj9Fp2hZRv2y0tPKVdpclMIsIYK6TY6FjN9ng-EJb4NOda3WjIRcT8VjQ_kOH1IRTLSJipF7HnwHq7rWorh0RnIOwsH1mGOt27aqf0YU3WIO0ehDbG0iTjyuSc2Jb7PCciS1UVrVoctEQlCNI"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-on-surface/90 via-on-surface/60 to-transparent flex items-center p-6 md:p-12">
          <div className="max-w-2xl text-on-primary space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-fixed bg-primary-container/25 border border-primary-fixed/20 px-3 py-1 rounded-full dark:bg-white/15">
              {isBangla ? 'আমাদের স্কুল পরিচিতি' : 'About Our Institution'}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
              {isBangla ? 'ঐতিহ্য ও উৎকর্ষের অনন্য পাঠশালা' : 'About Our School'}
            </h2>
            <p className="text-sm md:text-base text-inverse-on-surface/90 leading-relaxed font-light">
              {isBangla 
                ? 'মানসম্মত শিক্ষা প্রদান ও শৃঙ্খলা অনুশীলনের মাধ্যমে ভবিষ্যৎ যোগ্য নাগরিক হিসেবে শিক্ষার্থী গড়ে তুলতে দামাগারা সৈয়দ মিনা দ্বিমুখী উচ্চ বিদ্যালয় প্রতিশ্রুতিবদ্ধ।' 
                : 'A legacy of excellence, nurturing minds and building the future of our community through dedicated education and robust values.'
              }
            </p>
          </div>
        </div>
      </section>

      {/* History Section (Bento Grid Style) */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Broad Story (2 Columns Wide) */}
          <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-primary">
                <History className="h-6 w-6" />
                <h3 className="text-xl font-bold tracking-tight text-on-surface font-sans">
                  {isBangla ? 'আমাদের ঐতিহ্য ও গৌরব' : 'Our Heritage'}
                </h3>
              </div>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                {isBangla
                  ? 'দামাগারা সৈয়দ মিনা দ্বিমুখী উচ্চ বিদ্যালয় এই অঞ্চলের শিক্ষার বিস্তারে সুদীর্ঘকাল ধরে গৌরবময় ভূমিকা পালন করছে। স্থানীয় সমাজহিতৈষী ও দানশীল ব্যক্তিবর্গের নিরলস অবদানে এবং শিক্ষার ঐতিহ্য বিকাশে বিদ্যালয়টি প্রতিষ্ঠিত হয়। প্রতিষ্ঠার পর থেকেই এটি সুচারুভাবে মাধ্যমিক শিক্ষার আলো ছড়ানোর প্রধান কেন্দ্রবিন্দুতে পরিণত হয়েছে।'
                  : 'Established with a profound vision to democratize quality education, Damagara Syed Meena Dimukhe High School has stood as a beacon of learning for decades. From its humble beginnings in a modest building to its current expansive campus, the school has consistently adapted to the changing educational landscape while remaining rooted in its foundational values. Our journey is defined by the countless alumni who have gone on to make significant contributions to society.'
                }
              </p>
            </div>
          </div>

          {/* Foundation stats (1 Column Wide) */}
          <div className="bg-surface-container border border-outline-variant/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-center items-center text-center space-y-2">
            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center border border-outline-variant text-[#primary] shadow-sm">
              <Award className="h-8 w-8 text-[#8c6800]" />
            </div>
            <div>
              <p className="text-xs uppercase font-extrabold tracking-widest text-[#6e5100]">
                {isBangla ? 'প্রতিষ্ঠা বছর' : 'Founded'}
              </p>
              <p className="text-3xl md:text-4xl font-black text-primary font-mono select-none mt-1">
                {isBangla ? '১৯৬৪ খ্রি.' : '1964'}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Official Accreditations / Fact Sheet */}
      <section className="bg-white border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 font-sans">
            <Award className="h-5 w-5 text-primary" />
            <span>{isBangla ? 'সরকারি তথ্য ও স্বীকৃতি (EIIN, Board & MPO System)' : 'Official Institutional Specifications & Accreditations'}</span>
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            {isBangla 
              ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর (DSHE) এবং শিক্ষা বোর্ড দ্বারা অনুমোদিত অফিসিয়াল বিবরণী।' 
              : 'Official parameters verified by the Department of Secondary and Higher Education and Rajshahi Board.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* EIIN Card */}
          <div className="bg-[#e6f6ff] border border-outline-variant/60 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#005312] bg-primary/10 px-2 py-0.5 rounded-full inline-block">
              EIIN Code
            </span>
            <p className="text-2xl font-black text-primary font-mono tracking-wider">119828</p>
            <p className="text-[11px] text-on-surface-variant font-medium">
              {isBangla ? 'অনুমোদিত শিক্ষাপ্রতিষ্ঠান কোড' : 'Educational Institute Identifier'}
            </p>
          </div>

          {/* MPO Code Card */}
          <div className="bg-[#ffefd7] border border-outline-variant/50 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#5c4300] bg-tertiary-fixed/30 px-2 py-0.5 rounded-full inline-block">
              {isBangla ? 'এমপিও কোড' : 'MPO Enrolled'}
            </span>
            <p className="text-lg font-black text-[#6e5100] font-mono tracking-tight">7610111303</p>
            <p className="text-[11px] text-on-surface-variant font-medium">
              {isBangla ? 'এমপিও সুবিধাভুক্ত (হ্যাঁ)' : 'Monthly Pay Order Active'}
            </p>
          </div>

          {/* Academic Board Card */}
          <div className="bg-surface-container-high border border-outline-variant/60 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary inline-block">
              {isBangla ? 'শিক্ষা বোর্ড' : 'Academic Board'}
            </span>
            <p className="text-lg font-bold text-on-surface">Rajshahi Board</p>
            <p className="text-[11px] text-on-surface-variant font-medium">
              {isBangla ? 'রাজশাহী বোর্ড অধিভুক্ত' : 'Board of Intermediate/Secondary'}
            </p>
          </div>

          {/* Established Card */}
          <div className="bg-slate-50 border border-outline-variant/40 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500 inline-block">
              {isBangla ? 'স্বীকৃতির মেয়াদ' : 'Recognition'}
            </span>
            <p className="text-xs font-bold text-slate-800 leading-snug">
              {isBangla ? '১ জানুয়ারি, ১৯৭০ খ্রি.' : 'Secondary Level (1970)'}
            </p>
            <p className="text-[11px] text-on-surface-variant font-medium">
              {isBangla ? 'পর্যায়ের নিয়মিত স্বীকৃতিপ্রাপ্ত' : 'Recognized & Approved Level'}
            </p>
          </div>

        </div>

        {/* Detailed Spec Table for detailed attributes */}
        <div className="bg-slate-50 rounded-2xl p-4 md:p-6 border border-outline-variant/60">
          <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider mb-4">
            {isBangla ? 'পদ্ধতিগত ও ভৌগোলিক তথ্য বিবরণী' : 'Operational & Location Profiles'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
            
            <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
              <span className="text-on-surface-variant font-medium">{isBangla ? 'প্রতিষ্ঠা তারিখ' : 'Date of Establishment'}</span>
              <span className="font-bold text-on-surface font-mono">01 January, 1964</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
              <span className="text-on-surface-variant font-medium">{isBangla ? 'অনুমোদিত বিভাগসমূহ' : 'Available Disciplines'}</span>
              <span className="font-bold text-primary">{isBangla ? 'বিজ্ঞান, মানবিক, ব্যবসায় শিক্ষা' : 'Science, Humanities, Business Studies'}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
              <span className="text-on-surface-variant font-medium">{isBangla ? 'শ্রেণি শাখা ধরণ' : 'Co-education Shift'}</span>
              <span className="font-bold text-on-surface">{isBangla ? 'দিবা শাখা (যৌথ / সহশিক্ষা)' : 'Day Shift (Combined/Coeducational)'}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
              <span className="text-on-surface-variant font-medium">{isBangla ? 'ব্যবস্থাপনা ধরণ' : 'Governed Style'}</span>
              <span className="font-bold text-on-surface">{isBangla ? 'ম্যানেজিং কমিটি পরিচালনা' : 'Managing Committee'}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
              <span className="text-on-surface-variant font-medium">{isBangla ? 'ক্যাম্পাস অঞ্চল' : 'Geographic Setup'}</span>
              <span className="font-bold text-on-surface">{isBangla ? 'সমতল ভূমি (গ্রামীণ জনপদ)' : 'Plain Land (Grameen / Rural)'}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
              <span className="text-on-surface-variant font-medium">{isBangla ? 'যোগাযোগ নম্বর' : 'Helpline Telephone'}</span>
              <span className="font-bold text-primary hover:underline select-all font-mono">01711-366659</span>
            </div>

            <div className="flex justify-between items-center py-2 md:col-span-2">
              <span className="text-on-surface-variant font-medium">{isBangla ? 'অফিসিয়াল ঠিকানা কোড' : 'Geographic Locator Address'}</span>
              <span className="font-bold text-slate-700 font-mono text-right truncate">W6WW+2F9, Tarat gari, Plain Land, Post Code 6300, Bogra, Rajshahi</span>
            </div>

          </div>
        </div>

      </section>

      {/* Mission & Vision Cards */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Vision card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-4">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">
                  {isBangla ? 'আমাদের ভিশন' : 'Our Vision'}
                </h3>
              </div>
            </div>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
              {isBangla
                ? 'একটি আদর্শ আধুনিক শিক্ষাপ্রতিষ্ঠান হিসেবে শিক্ষার্থীদের জীবনব্যাপী শেখার আগ্রহ তৈরি করা, বিজ্ঞানমনস্ক দৃষ্টিভঙ্গি গড়ে তোলা এবং তাদের নৈতিক চরিত্রসম্পন্ন এমন বিশ্বনাগরিকরূপে প্রস্তুত করা যারা সমাজের কল্যাণে নেতৃত্ব দেবে।'
                : 'To be a premier institution that inspires lifelong learning, fosters critical thinking, and cultivates ethical leaders equipped to navigate and shape a complex global society.'
              }
            </p>
          </div>

          {/* Mission card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-4">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 bg-[#ffefd7] rounded-full flex items-center justify-center text-[#8c6800] shrink-0">
                <Flag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">
                  {isBangla ? 'আমাদের মিশন' : 'Our Mission'}
                </h3>
              </div>
            </div>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
              {isBangla
                ? 'প্রতিটি শিক্ষার্থীর অন্তর্নিহিত সম্ভাবনা ও প্রতিভা বিকাশের লক্ষ্যে উচ্চতর পড়াশোনা, সুশৃঙ্খল পরিবেশ, খেলাধুলা ও সামাজিক সচেতনতা বৃদ্ধির সুযোগ সৃষ্টি করা যা তাদের সর্বাঙ্গীন সাফল্য ও চরিত্র গঠনে সহায়তা করবে।'
                : 'To provide a rigorous, inclusive, and holistic educational experience that empowers every student to achieve academic excellence, develop character, and embrace social responsibility.'
              }
            </p>
          </div>

        </div>
      </section>

      {/* School Governing Body */}
      <section className="bg-surface-container-low rounded-3xl p-6 md:p-8 border border-outline-variant shadow-sm space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6e5100] bg-white px-2.5 py-1 rounded-full border border-outline-variant/60">
            {isBangla ? 'নেতৃত্ব ও পরিকল্পনা' : 'Governing Body'}
          </span>
          <h3 className="text-2xl font-bold text-on-surface tracking-tight font-sans">
            {isBangla ? 'সম্মানিত পরিচালনা পর্ষদ' : 'Governing Body'}
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isBangla
              ? 'বিদ্যালয়ের সার্বিক পরিবেশ ও একাডেমিক শিক্ষার গুণগত মান উন্নত রাখতে অভিজ্ঞ শিক্ষাবিদ ও দানশীল পরিচালকমণ্ডলীর পরামর্শ পর্ষদ।'
              : 'Managing administrators, patrons, and coordinators shaping the school vision.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {governingBoard.map((member, idx) => (
            <div 
              key={idx} 
              className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/80 text-center space-y-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
                <img 
                  className="w-full h-full object-cover" 
                  alt={member.name}
                  src={member.imageUrl} 
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs md:text-sm font-bold text-on-surface tracking-tight">
                  {isBangla ? member.banglaName : member.name}
                </h4>
                <p className="text-[10px] md:text-xs font-semibold text-primary">
                  {isBangla ? member.banglaDesignation : member.designation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Infrastructure & Campus Facilities List */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h3 className="text-xl font-bold text-on-surface tracking-tight font-sans">
            {isBangla ? 'ক্যাম্পাস সুযোগ-সুবিধাসমূহ' : 'Campus Facilities'}
          </h3>
        </div>

        <div className="space-y-4">
          
          {/* Lab Facility */}
          <div className="flex flex-col sm:flex-row items-start gap-4 p-5 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm hover:border-[#2e7d32]/40 transition-colors">
            <div className="bg-primary/10 p-3 rounded-xl text-primary shrink-0">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm md:text-base font-bold text-on-surface">
                {isBangla ? 'উন্নত বিজ্ঞান ল্যাবরেটরি' : 'Advanced Laboratories'}
              </h4>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                {isBangla
                  ? 'রসায়ন, পদার্থবিজ্ঞান এবং জীববিজ্ঞান বিষয়ের শিক্ষার্থীদের ব্যবহারিক পরীক্ষার জন্য সর্বাধুনিক যন্ত্রপাতি ও আধুনিক কেমিক্যাল ইকুইপমেন্ট সহ সুসজ্জিত গবেষণাগার সরবরাহ করা হয়।'
                  : 'State-of-the-art Physics, Chemistry, and Biology labs equipped with modern apparatus to facilitate hands-on scientific learning and experimentation.'
                }
              </p>
            </div>
          </div>

          {/* Library Facility */}
          <div className="flex flex-col sm:flex-row items-start gap-4 p-5 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm hover:border-[#2e7d32]/40 transition-colors">
            <div className="bg-[#ffefd7] p-3 rounded-xl text-[#8c6800] shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm md:text-base font-bold text-on-surface">
                {isBangla ? 'প্রধান শিক্ষাতথ্য ও লাইব্রেরি' : 'Central Library'}
              </h4>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                {isBangla
                  ? 'আমাদের লাইব্রেরিতে শিক্ষার্থীদের জন্য ২০,০০০ এরও অধিক বই, ইংরেজি ও বাংলা অনুবাদ রেফারেন্স কপি এবং নিরিবিলি জ্ঞান অন্বেষণের চমৎকার পরিবেশ সুনিশ্চিত করা হয়েছে।'
                  : 'A vast repository of knowledge housing over 20,000 volumes, academic journals, digital resources, and quiet reading zones designed for deep study and research.'
                }
              </p>
            </div>
          </div>

          {/* Playground Facility */}
          <div className="flex flex-col sm:flex-row items-start gap-4 p-5 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm hover:border-[#2e7d32]/40 transition-colors">
            <div className="bg-primary/10 p-3 rounded-xl text-primary shrink-0">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm md:text-base font-bold text-on-surface">
                {isBangla ? 'বিশাল খেলার মাঠ ও ক্রীড়া কমপ্লেক্স' : 'Sports Complex & Playground'}
              </h4>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                {isBangla
                  ? 'ফুটবল ও ক্রিকেট খেলার উপযোগী চারপাশ সবুজ প্রাচীর বেষ্টিত বিশাল বড় মাঠ, এবং ইনডোর স্পোর্টস টেবিল টেনিস ও ক্যারাম খেলার জন্য রয়েছে মানসম্মত জিম সাজসজ্জা।'
                  : 'Expansive outdoor fields for football and cricket, alongside multi-purpose indoor courts to promote physical fitness and competitive spirit.'
                }
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Uniform & Discipline Code of Conduct */}
      <section className="bg-surface-bright border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm border-l-4 border-l-primary space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-on-surface font-sans">
            {isBangla ? 'ইউনিফর্ম ও আচরণ বিধি' : 'Uniform & Code of Conduct'}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs md:text-sm">
              {isBangla ? 'পোশাক বিধি (Dress Code)' : 'Dress Code'}
            </h4>
            <p className="text-on-surface-variant leading-relaxed">
              {isBangla
                ? 'বিদ্যালয়ের ক্লাস সময়ে শিক্ষার্থীদের নিজস্ব নির্ধারিত স্কুল ড্রেস সুচারুভাবে পরিধান করতে হয়। পরিষ্কার সাদা শার্ট, মেরুন বা সবুজ ব্লেজার এবং লোগো ব্যাজ ব্যবহার করা সব শিক্ষার্থীর জন্য আবশ্যক।'
                : 'Students are required to wear the prescribed school uniform at all times. This includes the designated green blazer, white shirt, and specific ties/badges. Cleanliness and neatness are mandatory to uphold institutional pride.'
              }
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs md:text-sm">
              {isBangla ? 'শৃঙ্খলা ও নিয়মানুবর্তিতা' : 'Discipline & Rules'}
            </h4>
            <p className="text-on-surface-variant leading-relaxed">
              {isBangla
                ? 'বিদ্যালয়ে দৈনিক সমাবেশ কর্মসূচিতে নিয়মিত উপস্থিতি এবং একাডেমিক নিয়ম শৃঙ্খলা মেনে চলা বাঞ্ছনীয়। যেকোনো অনভিপ্রেত গণ্ডগোল, ফাঁকিবাজি ও অসদুপায় অবলম্বনে জিরো-টলারেন্স নীতি গ্রহণ করা হয়।'
                : 'Strict adherence to school timings and behavioral guidelines is expected. We maintain a zero-tolerance policy towards bullying and academic dishonesty, ensuring a safe and respectful environment for all.'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Section: Academic Faculty Directory (Integrated elegantly) */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-slate-250 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Users className="h-5 w-5" />
              <h3 className="text-lg font-bold text-on-surface font-sans uppercase tracking-wide">
                {isBangla ? 'আমাদের সম্মানিত শিক্ষক মণ্ডলী' : 'Faculty Directory'}
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant">
              {isBangla 
                ? 'আমাদের প্রতিশ্রুতিবদ্ধ ও অভিজ্ঞ শিক্ষকদের বিবরণী দেখে নিন।' 
                : 'Meet our dedicated, experienced subject teachers and administrators.'
              }
            </p>
          </div>
          <span className="bg-primary/10 text-primary text-xs px-3.5 py-1.5 rounded-full font-bold">
            {isBangla ? `${activeTeachers.length} জন সক্রিয় শিক্ষক` : `${activeTeachers.length} Active Faculty`}
          </span>
        </div>

        {/* Grid of Faculty profiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="faculty-grid">
          {activeTeachers.map((teacher) => (
            <div 
              key={teacher.id}
              onClick={() => setSelectedFaculty(teacher)}
              className="bg-white border border-outline-variant rounded-2xl p-5 hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer flex gap-4 group"
            >
              {/* Profile Image / Initials Placeholder */}
              <div className="h-16 w-16 rounded-xl overflow-hidden bg-primary/5 border border-outline-variant shrink-0 flex items-center justify-center">
                {teacher.imageUrl ? (
                  <img alt={teacher.name} className="w-full h-full object-cover" src={teacher.imageUrl} />
                ) : (
                  <User className="h-7 w-7 text-primary/40" />
                )}
              </div>

              {/* Basic Info */}
              <div className="space-y-1 flex-1">
                <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                  {isBangla && teacher.banglaName ? teacher.banglaName : teacher.name}
                </h4>
                <p className="text-xs text-primary font-bold">
                  {isBangla && teacher.banglaDesignation ? teacher.banglaDesignation : teacher.designation}
                </p>
                <p className="text-[10px] text-on-surface-variant font-medium tracking-wide">
                  {teacher.qualification}
                </p>
                
                {/* Contact CTA in card */}
                <div className="pt-2 text-[10px] text-primary font-bold flex items-center gap-1">
                  <span>View Details</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed teacher overlay modal */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full my-auto overflow-y-auto max-h-[96vh] md:max-h-[90vh] shadow-2xl relative border border-slate-200/80 animate-scaleUp">
            
            {/* Header portion */}
            <div className="bg-primary text-on-primary p-6 relative">
              <div className="flex gap-4 items-center">
                <div className="h-14 w-14 rounded-xl bg-white/10 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center">
                  {selectedFaculty.imageUrl ? (
                    <img alt="Portrait" className="w-full h-full object-cover" src={selectedFaculty.imageUrl} />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white leading-snug">
                    {isBangla && selectedFaculty.banglaName ? selectedFaculty.banglaName : selectedFaculty.name}
                  </h4>
                  <p className="text-xs text-[#cbffc2] font-semibold leading-normal">
                    {isBangla && selectedFaculty.banglaDesignation ? selectedFaculty.banglaDesignation : selectedFaculty.designation}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile fields */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider leading-none block">Academic Background</span>
                <p className="text-xs font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2">
                  <FileText className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span>{selectedFaculty.qualification}</span>
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider leading-none block">Official Contact Address</span>
                <div className="space-y-2">
                  <a 
                    href={`mailto:${selectedFaculty.email}`} 
                    className="text-xs text-on-surface-variant hover:text-primary flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 transition-colors"
                  >
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate select-all">{selectedFaculty.email}</span>
                  </a>
                  <p className="text-xs text-on-surface-variant flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span>Serving school since {selectedFaculty.joiningYear}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="p-4 bg-slate-50 border-t border-outline-variant text-right">
              <button 
                onClick={() => setSelectedFaculty(null)}
                className="bg-primary text-on-primary px-5 py-2 rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

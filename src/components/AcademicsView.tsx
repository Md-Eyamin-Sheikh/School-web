/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  FileDown, 
  Search, 
  Clock, 
  AlertTriangle, 
  BookOpen, 
  HelpCircle,
  FileCheck2,
  CalendarDays,
  X,
  Users,
  ChevronRight,
  Mail,
  User,
  GraduationCap
} from 'lucide-react';
import { SCHOOL_NOTICES } from '../data';
import { Notice } from '../types';

interface AcademicsViewProps {
  isBangla: boolean;
  onSelectNotice: (notice: Notice) => void;
  notices?: Notice[];
}

// Complete localized faculty profiles according to mockup images and descriptions
const ACADEMIC_FACULTY = [
  {
    id: 'fac1',
    name: 'Dr. A. Rahman',
    banglaName: 'ড. এ. রহমান',
    designation: 'Head of Mathematics',
    banglaDesignation: 'গণিত বিভাগীয় প্রধান',
    dept: 'science',
    banglaDept: 'বিজ্ঞান',
    qualification: 'Ph.D in Applied Mathematics, M.Sc (First Class)',
    email: 'a.rahman.math@damagarasmdhs.edu.bd',
    joiningYear: 2011,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcK0nIaTsUUv7wBbT8erXSw4FWJ5AjRyBg13NrET3m1EOAUabK2tPS_zv58DcQ4QypoRMbHtwOG0apyPrgyW-vgsjFz5n9Sxasq0unWgVKGuf-0fpaPiEGBgPWgcNNyOXVHyfoH98rtj7xZIDqyz5_UOvZ14UeGdE1yDbvd14pehACTIqA_AOpZRrZimR-D636SDxZoQP6TpATuJ3hSeBZkT9Yg6Z_pLGrxoduhIvGsoMJfdHbTN3lzUW_selq1PaizlYqxd3gQq8'
  },
  {
    id: 'fac2',
    name: 'Ms. S. Begum',
    banglaName: 'মোসাঃ এস. বেগম',
    designation: 'Senior English Teacher',
    banglaDesignation: 'সিনিয়র ইংরেজি শিক্ষিকা',
    dept: 'arts',
    banglaDept: 'মানবিক',
    qualification: 'M.A in English Literature, B.Ed (Hons)',
    email: 's.begum.eng@damagarasmdhs.edu.bd',
    joiningYear: 2014,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtgKmpYuqYysNiXBXyNq5_8734Z_sNB5U60oxE4LdkRLO-a6tHeESRoQYnthQ7r_cqNa_CGSCMN6Dc1WPefuLTSmtlH5hql2mTi17RciKeV_j482Av-13Wcn4LOiLYUubuQB1HrEQk5hWtaeaF5sKFcc90lHlHWlItBnrZowB9CPi7yp5QK6pOw2sX0zbHshcHakobQBbKo1nzzSNrYr9RG6neA_f7oY9QTFcIN-P8Z0VPv6D-U8MatrhiZqzYVNVM-RmKVt5ngk4'
  },
  {
    id: 'fac3',
    name: 'Mr. M. Ali',
    banglaName: 'জনাব এম. আলী',
    designation: 'Accounting & Business Studies',
    banglaDesignation: 'হিসাববিজ্ঞান ও ব্যবসায় শিক্ষা',
    dept: 'commerce',
    banglaDept: 'ব্যবসায় শিক্ষা',
    qualification: 'M.B.A in Accounting, B.B.A (Finance)',
    email: 'm.ali.comm@damagarasmdhs.edu.bd',
    joiningYear: 2016,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCd_IDMDF5Gfl47prx61xdUmdGydDBdQBvudyKv7NgHSa0Cb7Zt2D1-L7P7M2ibsf86g03DmfFkGDAin7g1_2RovU8xLCYj0h0u7Iuu4rrxEpgmgyq1-vGnFpOfVEgMXEnfZsaJihYb2Qa1-k2dsy4TFOIS2N0WxBFWpDcK1RCHar3i5svndisNswhw3wZ1sVdh2J41ZCYGNEYIhe5wS3cndQ6L_0or0wG6EDInCXEvz7Tnc8KyRoVasO8FRnKCy7v-YOvq8GMRvCA'
  },
  {
    id: 'fac4',
    name: 'Mrs. F. Khan',
    banglaName: 'বেগম এফ. খান',
    designation: 'Physical Education Instructor',
    banglaDesignation: 'শারীরিক শিক্ষা প্রশিক্ষক',
    dept: 'general',
    banglaDept: 'সাধারণ',
    qualification: 'Bachelor of Physical Education (B.P.Ed), National Coach',
    email: 'f.khan.admin@damagarasmdhs.edu.bd',
    joiningYear: 2018,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTn7ki0geUVegZo0GysRH6dIyeJ5sAav8P-IuBhZnapKEQ87DmLkNfrMjdu5A9xralJuibSxtr_rEob0E8cfKGiu6tsUNBxhtDekm69I1JBbkdhF9x7EGYgJD8qhYzy8zhP1qIsX5YsgCuJZ7BPNx0sAiFO0oDRzl_CdwKsM-ZY7G6hnXhttmrTG5ZCIUG36Zvmg70nHARUV4Sx3Yds8n7ZBJYytw-pmC8UNFVjfxDvlnwWg0lLWd4qDdVJlwOYL0ct1gntoEnE-M'
  },
  {
    id: 'fac5',
    name: 'Mr. T. Hasan',
    banglaName: 'জনাব টি. হাসান',
    designation: 'Physics Teacher',
    banglaDesignation: 'পদার্থবিজ্ঞান শিক্ষক',
    dept: 'science',
    banglaDept: 'বিজ্ঞান',
    qualification: 'M.Sc in Physics, B.Sc (Hons)',
    email: 't.hasan.phy@damagarasmdhs.edu.bd',
    joiningYear: 2021,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtA50jqk0jS591QPw3LiYIqEmrO-XQsQaP3KyERfOXb0K-vAkHbGTQr5L78ZajYMYXBhPe-0fCpq3urJB9kGjoWikZhYsbOCdK1SjPYMUF9qSkeZYiuQCBpZiBnLeeS5D5hlhAN1bOEjrkxj_XPlRnQL-RNZ4_pyzXh83yHdyuu632iERA2wwVSW9uMZN2-muaeKfNNmQuZOeyJeFqj1_BGjpUereksM-nAjubmFztJapK8u00-Qc18_ef3P8-1td_zrkzhQntlqo'
  }
];

// Rich syllabus data aligned with design tokens
const SYLLABUS_ROWS = [
  { 
    code: 'SYL-06', 
    className: 'Class VI', 
    banglaClassName: '৬ষ্ঠ শ্রেণি', 
    subjectRange: 'Core Subjects, Introductory Sciences', 
    banglaSubjectRange: 'প্রধান বিষয়াদি ও প্রাথমিক বিজ্ঞান', 
    file: 'Syllabus_Class_6_2026.pdf' 
  },
  { 
    code: 'SYL-07', 
    className: 'Class VII', 
    banglaClassName: '৭ম শ্রেণি', 
    subjectRange: 'Core Subjects, Expanding Sciences & Arts', 
    banglaSubjectRange: 'প্রধান বিষয়াদি, বিজ্ঞান ও আর্টস সম্প্রসারণ', 
    file: 'Syllabus_Class_7_2026.pdf' 
  },
  { 
    code: 'SYL-08', 
    className: 'Class VIII', 
    banglaClassName: '৮ম শ্রেণি', 
    subjectRange: 'Pre-Secondary Foundation Courses', 
    banglaSubjectRange: 'প্রাক-মাধ্যমিক ভিত্তি পাঠ্যক্রম সমূহ', 
    file: 'Syllabus_Class_8_2026.pdf' 
  },
  { 
    code: 'SYL-09', 
    className: 'Class IX', 
    banglaClassName: '৯ম শ্রেণি', 
    subjectRange: 'Secondary Level Specialization (Science/Arts/Commerce)', 
    banglaSubjectRange: 'মাধ্যমিক স্তরের বিশেষ বিভাগ (বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা)', 
    file: 'Syllabus_Class_9_2026_NewCurriculum.pdf' 
  },
  { 
    code: 'SYL-10', 
    className: 'Class X', 
    banglaClassName: '১০ম শ্রেণি', 
    subjectRange: 'Secondary School Certificate (SSC) Exam Prep', 
    banglaSubjectRange: 'এসএসসি (SSC) বোর্ডের চূড়ান্ত প্রস্তুতি প্রজেক্ট', 
    file: 'Syllabus_Class_10_2026_SSC.pdf',
    hasHighlight: true
  },
];

// Timetable cards details
const TIMETABLE_CARDS = [
  { className: 'Class VI', banglaClassName: '৬ষ্ঠ শ্রেণি', file: 'Schedule_Class_VI_2026.pdf' },
  { className: 'Class VII', banglaClassName: '৭ম শ্রেণি', file: 'Schedule_Class_VII_2026.pdf' },
  { className: 'Class VIII', banglaClassName: '৮ম শ্রেণি', file: 'Schedule_Class_VIII_2026.pdf' },
  { className: 'Class IX', banglaClassName: '৯ম শ্রেণি', file: 'Schedule_Class_IX_2026.pdf' },
  { className: 'Class X', banglaClassName: '১০ম শ্রেণি', file: 'Schedule_Class_X_2026.pdf', hasHighlight: true }
];

export default function AcademicsView({
  isBangla,
  onSelectNotice,
  notices = []
}: AcademicsViewProps) {
  const activeNotices = notices && notices.length > 0 ? notices : SCHOOL_NOTICES;
  // Notices Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Faculty Department filter state
  const [facultyFilter, setFacultyFilter] = useState<'all' | 'science' | 'arts' | 'commerce' | 'general'>('all');

  // Selected faculty details modal state
  const [selectedFaculty, setSelectedFaculty] = useState<typeof ACADEMIC_FACULTY[0] | null>(null);

  // Simulated Download States
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [lastDownloaded, setLastDownloaded] = useState<string | null>(null);

  // Trigger simulated file downloads
  const handleDownloadFile = (fileName: string) => {
    if (downloadingFile) return;
    
    setDownloadingFile(fileName);
    setDownloadProgress(0);
    setLastDownloaded(null);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadingFile(null);
          setLastDownloaded(fileName);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  // Filter Notices logic (exactly matching the kept logic)
  const filteredNotices = activeNotices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (notice.banglaTitle && notice.banglaTitle.includes(searchTerm));
    
    const matchesFilter = filterCategory === 'All' || notice.category === filterCategory;
    
    return matchesSearch && matchesFilter;
  });

  // Filter Faculty logic
  const filteredFaculty = ACADEMIC_FACULTY.filter(fac => {
    if (facultyFilter === 'all') return true;
    return fac.dept === facultyFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-16 animate-fadeIn">
      
      {/* 1. Page Header (Fidelity matching HTML spec) */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0d631b] bg-primary/10 px-3 py-1.5 rounded-full select-none">
          {isBangla ? 'শিক্ষা ও পাঠ্যক্রম' : 'Academic Excellence'}
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-primary leading-tight font-sans">
          {isBangla ? 'শিক্ষাদক্ষতা ও শিক্ষক মণ্ডলী' : 'Academics & Faculty'}
        </h2>
        <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
          {isBangla 
            ? 'আমাদের চমৎকার শিক্ষাক্রম, হালনাগাদ শ্রেণির সময়সূচী এবং শিক্ষার্থীদের আগামী দিনের যোগ্য নাগরিক হিসেবে গড়ে তুলতে নিয়োজিত শিক্ষক মন্ডলী সম্পর্কে জানুন।' 
            : 'Explore our rigorous curriculum, up-to-date class schedules, and meet the dedicated educators guiding our students toward excellence.'
          }
        </p>

        {/* Global Action notification portal */}
        {downloadingFile && (
          <div className="bg-[#dbf1fe] text-[#071e27] px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-3 border border-outline-variant/60 max-w-sm mx-auto shadow-sm animate-pulse">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>{isBangla ? `ফাইল প্রস্তুত হচ্ছে: ${downloadingFile} (${downloadProgress}%)` : `Preparing: ${downloadingFile} (${downloadProgress}%)`}</span>
          </div>
        )}
        
        {lastDownloaded && (
          <div 
            onClick={() => setLastDownloaded(null)}
            className="bg-primary text-on-primary px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer max-w-sm mx-auto shadow-sm relative pr-8 animate-fadeIn"
          >
            <FileCheck2 className="h-4.5 w-4.5" />
            <span>{isBangla ? `${lastDownloaded} সফলভাবে ডাউনলোড হয়েছে!` : `${lastDownloaded} downloaded successfully!`}</span>
            <X className="h-3.5 w-3.5 absolute right-2.5 hover:scale-110" />
          </div>
        )}
      </section>

      {/* 2. Section 1: Curriculum & Syllabus */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-light-outline pb-3">
          <BookOpen className="h-6 w-6 text-primary shrink-0" />
          <h3 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight font-sans">
            {isBangla ? 'পাঠ্যক্রম ও সিল্যাবস বিবরণী' : 'Curriculum & Syllabus'}
          </h3>
        </div>

        {/* Responsive Syllabus Table */}
        <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#cfe6f2] border-b border-outline-variant">
                <tr>
                  <th className="py-4 px-6 text-xs md:text-sm font-bold text-slate-800 uppercase tracking-wider">
                    {isBangla ? 'শ্রেণি / লেভেল' : 'Class Level'}
                  </th>
                  <th className="py-4 px-6 text-xs md:text-sm font-bold text-slate-800 uppercase tracking-wider">
                    {isBangla ? 'প্রধান বিষয়সমূহ' : 'Subject Range'}
                  </th>
                  <th className="py-4 px-6 text-xs md:text-sm font-bold text-slate-800 uppercase tracking-wider text-right">
                    {isBangla ? 'সিলেবাস ডাউনলোড' : 'Download Syllabus'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {SYLLABUS_ROWS.map((row) => (
                  <tr 
                    key={row.code}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className={`py-4 px-6 text-xs md:text-sm font-bold text-on-surface ${row.hasHighlight ? 'border-l-4 border-[#8c6800]' : ''}`}>
                      {isBangla ? row.banglaClassName : row.className}
                    </td>
                    <td className="py-4 px-6 text-xs md:text-sm text-on-surface-variant font-medium">
                      {isBangla ? row.banglaSubjectRange : row.subjectRange}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleDownloadFile(row.file)}
                        disabled={!!downloadingFile}
                        className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-container bg-primary/5 hover:bg-primary/10 border border-primary/10 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FileDown className="h-4 w-4" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. Section 2: Class Timetable */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-light-outline pb-3">
          <CalendarDays className="h-6 w-6 text-primary shrink-0" />
          <h3 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight font-sans">
            {isBangla ? 'শ্রেণিভিত্তিক সময়সূচী' : 'Class Timetables'}
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {TIMETABLE_CARDS.map((card, idx) => (
            <div 
              key={idx}
              onClick={() => handleDownloadFile(card.file)}
              className={`bg-white border hover:shadow-md cursor-pointer transition-all duration-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 group ${
                card.hasHighlight 
                  ? 'border-2 border-[#8c6800]/40 border-b-4 border-b-[#8c6800]' 
                  : 'border-outline-variant hover:border-primary/40'
              }`}
            >
              <h4 className="text-xs md:text-base font-extrabold text-on-surface">
                {isBangla ? card.banglaClassName : card.className}
              </h4>
              <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs text-primary font-bold px-3 py-1 bg-primary/5 rounded-full group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <FileDown className="h-3.5 w-3.5" />
                <span>{isBangla ? 'ডাউনলোড' : 'Schedule'}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Section 3: Faculty Directory */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-light-outline pb-3">
          <Users className="h-6 w-6 text-primary shrink-0" />
          <h3 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight font-sans">
            {isBangla ? 'শিক্ষক মণ্ডলী পরিচিতি' : 'Faculty Directory'}
          </h3>
        </div>

        {/* Dynamic Category Filtering pills */}
        <div className="flex flex-wrap gap-2.5">
          {[
            { id: 'all', title: 'All Departments', banglaTitle: 'সকল বিভাগ' },
            { id: 'science', title: 'Science', banglaTitle: 'বিজ্ঞান' },
            { id: 'arts', title: 'Arts', banglaTitle: 'মানবিক' },
            { id: 'commerce', title: 'Commerce', banglaTitle: 'ব্যবসায় শিক্ষা' },
            { id: 'general', title: 'General', banglaTitle: 'সাধারণ' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFacultyFilter(item.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                facultyFilter === item.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-[#dbf1fe] text-[#071e27] hover:bg-[#cfe6f2] border border-outline-variant/60'
              }`}
            >
              {isBangla ? item.banglaTitle : item.title}
            </button>
          ))}
        </div>

        {/* Dynamic grid of faculty cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6" id="faculty-grid">
          {filteredFaculty.map((teacher) => (
            <div 
              key={teacher.id}
              onClick={() => setSelectedFaculty(teacher)}
              className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-[0px_4px_12px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              {/* Profile portrait area */}
              <div className="relative h-48 w-full bg-slate-50 overflow-hidden shrink-0">
                <img 
                  alt={teacher.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={teacher.imageUrl} 
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[9px] font-extrabold uppercase tracking-wide px-2.5 py-1 bg-white/95 backdrop-blur-sm text-primary rounded-full shadow-sm border border-slate-100">
                    {isBangla ? teacher.banglaDept : teacher.name.includes('Rahman') || teacher.name.includes('Hasan') ? 'Science' : teacher.name.includes('Begum') ? 'Arts' : teacher.name.includes('Ali') ? 'Commerce' : 'General'}
                  </span>
                </div>
              </div>

              {/* Informational area */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors leading-tight">
                    {isBangla ? teacher.banglaName : teacher.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {isBangla ? teacher.banglaDesignation : teacher.designation}
                  </p>
                </div>
                
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-primary font-bold">
                  <span>{isBangla ? 'বিস্তারিত দেখুন' : 'View Profile'}</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Kept Section: All Notices & Archive (Bilingual and intact) */}
      <section className="bg-white border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Title and Search filter panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-primary">
              <CalendarDays className="h-5.5 w-5.5 text-primary" />
              <h3 className="text-lg md:text-xl font-bold text-on-surface uppercase tracking-wide font-sans">
                {isBangla ? 'সকল নোটিশ ও ফাইল সংরক্ষণাগার' : 'All Notices & Archive'}
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant">
              {isBangla ? 'আমাদের প্রাতিষ্ঠানিক সকল নোটিশ এবং ঐতিহাসিক ঘোষণার বিজ্ঞপ্তি নিচে খুঁজুন।' : 'Search historical announcements, admissions details, or school holidays.'}
            </p>
          </div>

          {/* Search box input */}
          <div className="relative max-w-sm w-full">
            <Search className="h-4.5 w-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-primary/60" />
            <input 
              type="text" 
              placeholder={isBangla ? 'শিরোনাম দিয়ে নোটিশ খুঁজুন...' : 'Search notices...'} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-outline-variant rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
            />
          </div>
        </div>

        {/* Category filtering pills */}
        <div className="flex flex-wrap gap-2">
          {['All', 'Admission', 'Academic', 'Exam', 'Holiday'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4.1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-primary/5 text-primary hover:bg-primary/15 border border-primary/10'
              }`}
            >
              {cat === 'All' ? (isBangla ? 'সব নোটিশ' : 'All') : cat}
            </button>
          ))}
        </div>

        {/* filtered notices list render */}
        {filteredNotices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="academics-notices-grid">
            {filteredNotices.map((notice) => (
              <div 
                key={notice.id}
                onClick={() => onSelectNotice(notice)}
                className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 hover:bg-white hover:border-primary/40 hover:shadow-sm transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                    <span className="text-on-surface-variant font-bold">{notice.publishDate}</span>
                    <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full font-extrabold uppercase text-[9px]">
                      {notice.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                    {isBangla && notice.banglaTitle ? notice.banglaTitle : notice.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                    {isBangla && notice.banglaContent ? notice.banglaContent : notice.content}
                  </p>
                </div>
                <div className="pt-3 border-t border-dashed border-slate-200/80 mt-4 flex justify-between items-center text-xs font-bold text-primary">
                  <span>{isBangla ? 'বিস্তারিত পড়ুন' : 'Detailed Read'}</span>
                  <FileDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-slate-50 border border-outline-variant flex flex-col items-center justify-center space-y-2">
            <HelpCircle className="h-10 w-10 text-primary/40 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-800">{isBangla ? 'কোনো নোটিশ খুঁজে পাওয়া যায়নি' : 'No matching notices found'}</h4>
            <p className="text-xs text-on-surface-variant">{isBangla ? 'দয়া করে অন্য কোনো বিষয় বা কি-ওয়ার্ড দিয়ে আবার অনুসন্ধান করার চেষ্টা করুন।' : 'Try refining your keyword or filtering directly by categories.'}</p>
          </div>
        )}

      </section>

      {/* 6. Isolated Faculty Premium Profile Modal Overlay */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full my-auto overflow-y-auto max-h-[96vh] md:max-h-[90vh] shadow-2xl relative border border-slate-200/80 animate-scaleUp">
            
            {/* Header portion */}
            <div className="bg-primary text-on-primary p-6 relative">
              <div className="flex gap-4 items-center">
                <div className="h-14 w-14 rounded-xl bg-white/10 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center">
                  <img alt="Portrait" className="w-full h-full object-cover" src={selectedFaculty.imageUrl} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white leading-snug">
                    {isBangla ? selectedFaculty.banglaName : selectedFaculty.name}
                  </h4>
                  <p className="text-xs text-[#cbffc2] font-semibold leading-normal">
                    {isBangla ? selectedFaculty.banglaDesignation : selectedFaculty.designation}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFaculty(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-1 rounded-full text-white cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile fields */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider leading-none block">
                  {isBangla ? 'শিক্ষাগত ব্যাকগ্রাউন্ড' : 'Academic Background'}
                </span>
                <p className="text-xs font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2">
                  <GraduationCap className="h-4.5 w-4.5 shrink-0 text-primary mt-0.5" />
                  <span>{selectedFaculty.qualification}</span>
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider leading-none block">
                  {isBangla ? 'অফিসিয়াল বিবরণী ও যোগাযোগ' : 'Official Contact & Status'}
                </span>
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
                    <span>
                      {isBangla 
                        ? `${selectedFaculty.joiningYear} সাল থেকে বিদ্যালয়ে শিক্ষকতা করছেন` 
                        : `Serving school since ${selectedFaculty.joiningYear}`
                      }
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="p-4 bg-slate-50 border-t border-outline-variant text-right">
              <button 
                onClick={() => setSelectedFaculty(null)}
                className="bg-primary text-on-primary px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
              >
                {isBangla ? 'বন্ধ করুন' : 'Close Details'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

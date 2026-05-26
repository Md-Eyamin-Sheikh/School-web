/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  UserPlus, 
  LogIn, 
  ShieldAlert, 
  CheckCircle2, 
  User, 
  Briefcase,
  Eye,
  EyeOff,
  GraduationCap,
  Shield,
  Fingerprint,
  FileKey
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, signInAsDemoAdmin, signInAsDemoStudent } from '../firebase';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBangla: boolean;
}

export default function AdminAuthModal({ isOpen, onClose, isBangla }: AdminAuthModalProps) {
  // Dual-role selector: 'student' | 'admin'
  const [userRole, setUserRole] = useState<'student' | 'admin'>('student');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Student Login/Register state
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  
  // Coordinator/Admin Login/Register State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('Academic Coordinator');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Perform a Direct Instant Demo Login Bypass
  const handleDemoBypass = async (role: 'student' | 'admin') => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(isBangla ? 'ডেমো পোর্টাল অ্যাক্সেস তৈরি হচ্ছে...' : 'Generating secure instant demo access...');
    
    try {
      if (role === 'admin') {
        await signInAsDemoAdmin(isBangla);
      } else {
        await signInAsDemoStudent(isBangla);
      }
      
      setSuccessMsg(isBangla ? 'লগইন সফল হয়েছে! বোর্ড পুনরায় লোড হচ্ছে।' : 'Bypass successful! Activating academic session.');
      
      setTimeout(() => {
        setIsLoading(false);
        onClose();
        window.location.reload(); // Instantly syncs across Header, Admissions, and Results views
      }, 1000);
    } catch (err: any) {
      console.error("[Demo Bypass Error]", err);
      setErrorMsg(isBangla ? 'ডেমো সিস্টেমে প্রবেশ করা সম্ভব হয়নি। পুনরায় চেষ্টা করুন।' : 'Could not enter demo session. Please try again.');
      setIsLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = userRole === 'admin' ? adminEmail : studentEmail;
    const password = userRole === 'admin' ? adminPassword : studentPassword;

    if (!email.trim() || !password.trim()) {
      setErrorMsg(isBangla ? 'সবগুলো ফিল্ড সঠিকভাবে পূরণ করুন।' : 'Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Regular firebase email sign in
      await signInWithEmailAndPassword(auth, email, password);
      
      // Save metadata role
      localStorage.setItem('demo_user_role', userRole);
      
      setSuccessMsg(
        isBangla 
          ? (userRole === 'admin' ? 'এডমিন পোর্টাল সফলভাবে সক্রিয় হয়েছে!' : 'শিক্ষার্থী ড্যাশবোর্ডে লগইন সফল হয়েছে!')
          : (userRole === 'admin' ? 'Staff Room console active!' : 'Student session initiated successfully!')
      );
      
      setTimeout(() => {
        setIsLoading(false);
        onClose();
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      console.error('[Auth] Login failed:', err);
      setIsLoading(false);

      // Handle common Firebase connection/IndexedDB and provider-disabled faults cleanly
      let friendlyError = err.message;
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        friendlyError = isBangla 
          ? 'উইজারনেম বা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে ডেমো মোড চেষ্টা করুন।' 
          : 'Invalid credentials. You may also use the instant demo mode bypass above.';
      } else if (err.code === 'auth/operation-not-allowed') {
        friendlyError = isBangla
          ? 'ফায়ারবেস সিস্টেমে ইমেইল লগইন নিষ্ক্রিয়। অনুগ্রহ করে নিচের "instant demo" বা গুগল সাইন-অন ব্যবহার করুন।'
          : 'Email sign-in is deactivated on your Firebase project. Please use the instant demo button or Google Sync.';
      }
      setErrorMsg(friendlyError);
    }
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Dynamic field extracts
    const email = userRole === 'admin' ? adminEmail : studentEmail;
    const password = userRole === 'admin' ? regPassword : studentPassword;
    const confirmPassword = userRole === 'admin' ? regConfirmPassword : studentPassword; // Students simple
    const name = userRole === 'admin' ? regName : studentName;

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg(isBangla ? 'প্রয়োজনীয় ঘরগুলো সব পূরণ করুন।' : 'Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg(isBangla ? 'পাসওয়ার্ড ৬ অক্ষরের দীর্ঘ হতে হবে।' : 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(isBangla ? 'পাসওয়ার্ড দুটি মেলেনি।' : 'Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Firebase Auth Registration
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Set profile displayName
      await updateProfile(user, { displayName: name });

      // 3. Save to database based on role
      localStorage.setItem('demo_user_role', userRole);
      
      if (userRole === 'admin') {
        const adminRecordRef = doc(db, 'admins', user.uid);
        try {
          await setDoc(adminRecordRef, {
            uid: user.uid,
            name: name,
            email: email,
            role: regRole,
            registeredAt: new Date().toISOString(),
            verified: true, // Auto-verify inside demo setups to save time
          });
        } catch (dbErr: any) {
          handleFirestoreError(dbErr, OperationType.WRITE, `admins/${user.uid}`);
        }
      } else {
        // Save student specific entry if needed, otherwise rely on local storage
        localStorage.setItem('demo_user', JSON.stringify({
          uid: user.uid,
          displayName: name,
          email: email,
          role: 'student',
          studentId: studentId || 'DSMD-101'
        }));
      }

      setSuccessMsg(
        isBangla 
          ? 'নতুন অ্যাকাউন্ট সফলভাবে নিবন্ধিত হয়েছে!' 
          : 'Registration completed successfully!'
      );
      
      setTimeout(() => {
        setIsLoading(false);
        onClose();
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('[Auth] Registration error:', err);
      setIsLoading(false);

      let friendlyError = err.message;
      if (err.code === 'auth/email-already-in-use') {
        friendlyError = isBangla 
          ? 'এই ইমেইল দিয়ে ইতিমধ্যেই একটি আইডি তৈরি করা আছে।' 
          : 'This email is already registered. Please go to Log In.';
      } else if (err.code === 'auth/operation-not-allowed') {
        friendlyError = isBangla
          ? 'ফায়ারবেস সিস্টেমে ইমেইল সাইন-আপ নিষ্ক্রিয়। অনুগ্রহ করে নিচের "Demo Bypass" ব্যবহার করুন।'
          : 'Registration via email and password is currently disabled in your Firebase rules. Use the instant demo bypass above.';
      }
      setErrorMsg(friendlyError);
    }
  };

  // Google Single Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      localStorage.setItem('demo_user_role', userRole);
      
      if (userRole === 'admin') {
        const adminRecordRef = doc(db, 'admins', result.user.uid);
        try {
          await setDoc(adminRecordRef, {
            uid: result.user.uid,
            name: result.user.displayName || 'Google Staff Office',
            email: result.user.email,
            role: 'Google Staff Office Authorized Coordinator',
            registeredAt: new Date().toISOString(),
            verified: true
          }, { merge: true });
        } catch (dbErr: any) {
          handleFirestoreError(dbErr, OperationType.WRITE, `admins/${result.user.uid}`);
        }
      }

      setSuccessMsg(isBangla ? 'গুগল সংযোগ সফল হয়েছে!' : 'Google OAuth session connected!');
      setTimeout(() => {
        setIsLoading(false);
        onClose();
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      console.error('[Auth] Google sign-in failure:', err);
      setIsLoading(false);
      setErrorMsg(
        isBangla 
          ? 'প্রজেক্ট সেটিংস জটিলতার কারণে গুগল সাইন-অন সম্ভব হয়নি। অনুগ্রহ করে ওয়ান-ক্লিক ডেমো ব্যবহার করুন।' 
          : 'Google authentication skipped or blocked. Please prefer our One-click Instant Demo login above.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      {/* Dynamic responsive card: max-w-4xl is used for split dual screens on larger devices */}
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto overflow-hidden shadow-2xl relative border border-slate-200/80 animate-scaleUp flex flex-col md:flex-row">
        
        {/* Close button inside modal (Upper right corner) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-slate-900/10 hover:bg-slate-900/20 p-2.5 rounded-full transition-all text-slate-700 cursor-pointer shadow-xs border border-white/20"
          title={isBangla ? 'বন্ধ করুন' : 'Close'}
        >
          <X className="h-5 w-5" />
        </button>

        {/* LEFT COLUMN: Educational Mascot / Welcome banner (only visible on md screens +) */}
        <div className="hidden md:flex w-1/2 bg-[#f3faff] p-8 relative flex-col items-center justify-center border-r border-slate-100 shrink-0">
          <div className="absolute inset-0 bg-radial-gradient opacity-10 pointer-events-none" />
          
          <img 
            alt="Friendly students in school uniform" 
            className="w-full max-w-sm object-contain drop-shadow-md select-none transform hover:scale-105 transition-transform duration-500" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJ-S4GoasCq1UWujEJZ2GWeXxnqvyB6Y-9U4BTkc8oOKx2wdhELNOw7S_4wqE5cetSxf0-_Q3Pd7CaktbKJW4-KeaOedPlbCRVoNJz4K1h48ucnhRfTPDUxV2oICUng0HNJcWvxNexZYov6OdI2anU6UtLVrfSZfNZm2eGjJrMsY0OvBs8cbx1WDJr8hL5wrSWpjPiBk7_jkiiuN3q5ppE04a3C_WGYF0KvLjJ4IPVnw74nJbuw7E-REtjUP4nkq1lAOhWk5BWYys"
            referrerPolicy="no-referrer"
          />

          <div className="text-center mt-6 z-10">
            <h4 className="font-black text-primary text-base">
              {isBangla ? 'Syed Meena High School হাব' : 'Syed Meena High School Hub'}
            </h4>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-xs mx-auto">
              {isBangla 
                ? 'অনলাইন ভর্তি অনুমোদন, পরীক্ষা ফলাফল বিবরণ এবং প্রশাসনিক কার্যক্রম নিরাপদ সার্ভারে সংরক্ষিত।' 
                : 'Access student marksheets, enrollments tracker, and administrative office with authorized security.'}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Tab Switchers & Authentication Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-between bg-white relative">
          
          {/* Header Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-primary">
              <span className="p-1 px-1.5 bg-primary/10 rounded-lg">
                <FileKey className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider font-mono">
                {isBangla ? 'নিরাপদ স্কুল সংযোগ' : 'Educational Secure Portal'}
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight mt-1.5 leading-none">
              {userRole === 'student' 
                ? (activeTab === 'login' ? (isBangla ? 'শিক্ষার্থী লগইন' : 'STUDENT LOGIN') : (isBangla ? 'শিক্ষার্থী নিবন্ধন' : 'STUDENT REGISTRATION'))
                : (activeTab === 'login' ? (isBangla ? 'প্রশাসনিক লগইন' : 'STAFF LOGIN') : (isBangla ? 'প্রশাসনিক নিবন্ধন' : 'ADMIN REGISTRATION'))
              }
            </h2>
            <div className="w-12 h-1 bg-primary rounded-full mt-2" />
          </div>

          {/* ROLE SELECTOR CAPSULE */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-1 rounded-2xl border border-slate-100/80 mb-4 text-xs">
            <button
              type="button"
              onClick={() => { setUserRole('student'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                userRole === 'student'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="h-4.5 w-4.5" />
              <span>{isBangla ? 'শিক্ষার্থী' : 'Student'}</span>
            </button>
            <button
              type="button"
              onClick={() => { setUserRole('admin'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                userRole === 'admin'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>{isBangla ? 'প্রশাসক' : 'Admin Staff'}</span>
            </button>
          </div>

          {/* ACTION toggle: Sign In vs Register */}
          <div className="flex justify-start gap-4 border-b border-slate-100 pb-2 mb-4 text-xs font-black">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`pb-1 transition-all relative ${
                activeTab === 'login' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>{isBangla ? 'প্রবেশ করুন (Log In)' : 'LOG IN'}</span>
              {activeTab === 'login' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-scaleUp" />}
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`pb-1 transition-all relative ${
                activeTab === 'register' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>{isBangla ? 'নিবন্ধন (Sign Up)' : 'REGISTER'}</span>
              {activeTab === 'register' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-scaleUp" />}
            </button>
          </div>

          {/* INSTANT ONE-CLICK INSTANT DEMO BYPASS BOX */}
          <div className="bg-amber-500/[0.08] border border-amber-250/35 rounded-2xl p-3.5 mb-4 text-xs">
            <div className="flex items-center gap-2 font-black text-amber-800 text-[11px] mb-1">
              <span className="animate-bounce">💡</span>
              <span>{isBangla ? 'ওয়ান-ক্লিক ডেমো অ্যাক্সেস' : 'ONE-CLICK DEMO ACCESS'}</span>
            </div>
            <p className="text-slate-500 scale-95 origin-left leading-relaxed text-[11px] mb-2.5">
              {isBangla 
                ? 'ফায়ারবেস সার্টিফিকেট সেটআপ ছাড়াই তাত্ক্ষণিক বৈশিষ্ট্যসমূহ পরীক্ষা করুন।' 
                : 'Instantly view student marksheets, admissions logs, or teacher desks without Firebase credentials!'}
            </p>
            <button
              type="button"
              onClick={() => handleDemoBypass(userRole)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-2 rounded-xl transition-all shadow-xs cursor-pointer text-center text-[11px] flex items-center justify-center gap-1.5"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>
                {userRole === 'admin' 
                  ? (isBangla ? 'এডমিন ডেমো হিসেবে প্রবেশ' : 'Sign In as Coordinator (Demo)')
                  : (isBangla ? 'শিক্ষার্থী ডেমো হিসেবে প্রবেশ' : 'Sign In as Student (Demo)')
                }
              </span>
            </button>
          </div>

          {/* Form alert display logs */}
          <div className="mb-4">
            {errorMsg && (
              <div className="bg-red-50 border border-red-250/30 rounded-xl p-3 flex gap-2.5 items-start text-xs text-red-700 font-sans">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500" />
                <span className="font-semibold leading-relaxed">{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-250/35 rounded-xl p-3 flex gap-2.5 items-start text-xs text-emerald-800 font-sans">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                <span className="font-semibold leading-relaxed">{successMsg}</span>
              </div>
            )}
          </div>

          {/* DYNAMIC FORM ENGINE */}
          <form 
            onSubmit={activeTab === 'login' ? handleLogin : handleRegister} 
            className="space-y-4 text-xs"
          >
            {activeTab === 'register' && (
              <div className="relative flex items-end border-b border-slate-200 focus-within:border-primary transition-colors pb-2">
                <User className="text-slate-400 mr-3 mb-1 shrink-0 h-4.5 w-4.5" />
                <div className="flex-grow">
                  <label className="sr-only" htmlFor="fullname">
                    {userRole === 'admin' ? 'Full Staff Name' : 'Student Full Name'}
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    required
                    disabled={isLoading}
                    value={userRole === 'admin' ? regName : studentName}
                    onChange={(e) => userRole === 'admin' ? setRegName(e.target.value) : setStudentName(e.target.value)}
                    placeholder={userRole === 'admin' ? "Full Staff Name" : "Full Student Name"}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-850 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {userRole === 'student' && activeTab === 'register' && (
              <div className="relative flex items-end border-b border-slate-200 focus-within:border-primary transition-colors pb-2 animate-fadeIn">
                <Fingerprint className="text-slate-400 mr-3 mb-1 shrink-0 h-4.5 w-4.5" />
                <div className="flex-grow">
                  <label className="sr-only" htmlFor="stId">Student ID</label>
                  <input
                    type="text"
                    id="stId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Student ID (e.g. DSMD-101)"
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-850 placeholder:text-slate-400 font-mono focus:outline-none"
                  />
                </div>
              </div>
            )}

            {userRole === 'admin' && activeTab === 'register' && (
              <div className="relative flex items-end border-b border-slate-200 focus-within:border-primary transition-colors pb-2 animate-fadeIn">
                <Briefcase className="text-slate-400 mr-3 mb-1 shrink-0 h-4.5 w-4.5" />
                <div className="flex-grow">
                  <label className="sr-only" htmlFor="admRole">Designation</label>
                  <select
                    id="admRole"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-850 focus:outline-none focus:bg-white text-xs font-semibold"
                  >
                    <option value="Academic Coordinator">Academic Coordinator</option>
                    <option value="Admission Registrar">Admission Registrar</option>
                    <option value="Exam Controller Board">Exam Controller Board</option>
                  </select>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="relative flex items-end border-b border-slate-200 focus-within:border-primary transition-colors pb-2">
              <Mail className="text-slate-400 mr-3 mb-1 shrink-0 h-4.5 w-4.5" />
              <div className="flex-grow">
                <label className="sr-only" htmlFor="mainEmail">Email Address</label>
                <input
                  type="email"
                  id="mainEmail"
                  required
                  disabled={isLoading}
                  value={userRole === 'admin' ? adminEmail : studentEmail}
                  onChange={(e) => userRole === 'admin' ? setAdminEmail(e.target.value) : setStudentEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-850 placeholder:text-slate-400 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative flex items-end border-b border-slate-200 focus-within:border-primary transition-colors pb-2">
              <Lock className="text-slate-400 mr-3 mb-1 shrink-0 h-4.5 w-4.5" />
              <div className="flex-grow">
                <label className="sr-only" htmlFor="mainPassword">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="mainPassword"
                  required
                  disabled={isLoading}
                  value={userRole === 'admin' ? (activeTab === 'login' ? adminPassword : regPassword) : studentPassword}
                  onChange={(e) => {
                    if (userRole === 'admin') {
                      if (activeTab === 'login') setAdminPassword(e.target.value);
                      else setRegPassword(e.target.value);
                    } else {
                      setStudentPassword(e.target.value);
                    }
                  }}
                  placeholder="Password"
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-850 placeholder:text-slate-400 focus:outline-none font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none mb-1 cursor-pointer"
                title={showPassword ? "Hide" : "Show"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Confirm password slot for Admin register */}
            {userRole === 'admin' && activeTab === 'register' && (
              <div className="relative flex items-end border-b border-slate-200 focus-within:border-primary transition-colors pb-2 animate-fadeIn">
                <Lock className="text-slate-400 mr-3 mb-1 shrink-0 h-4.5 w-4.5" />
                <div className="flex-grow">
                  <label className="sr-only" htmlFor="confirmPwd">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPwd"
                    required
                    disabled={isLoading}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-850 placeholder:text-slate-400 focus:outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-container text-white py-3 px-4 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>{activeTab === 'login' ? (isBangla ? 'প্রবেশ করুন' : 'LOG IN') : (isBangla ? 'আজই যুক্ত হোন' : 'REGISTER')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Social Google Backup sign in */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                <span className="bg-white px-2">{isBangla ? 'অথবা গুগল দিয়ে সিঙ্ক নিশ্চিত করুন' : 'Or Sync via Work ID'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full border border-slate-200 hover:border-slate-300 bg-white text-slate-600 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>{isBangla ? 'গুগল অ্যাকাউন্ট সংযুক্তকরণ' : 'Google Work ID'}</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}

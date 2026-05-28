/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useRef } from 'react';
import { 
  FileCheck2, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  Printer, 
  X, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  FileText, 
  BookOpen, 
  FileCheck,
  AlertCircle,
  HelpCircle,
  Clock,
  User,
  GraduationCap,
  Sparkle,
  MailCheck,
  MessageSquare,
  LogOut,
  NotebookTabs,
  Trash2,
  ShieldAlert,
  FileSpreadsheet,
  Check,
  Filter
} from 'lucide-react';
import { doc, setDoc, getDoc, collection, updateDoc, onSnapshot, query, orderBy, deleteDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { AdmissionApplication } from '../types';
import { apiUrl } from '../api';

interface AdmissionsViewProps {
  isBangla: boolean;
}

export default function AdmissionsView({ isBangla }: AdmissionsViewProps) {
  // Multi-step form system state (Steps: 1 = Student, 2 = Parent & Address, 3 = Document Upload)
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  
  // Interactive Upload State
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Firestore Tracking states
  const [searchTrackingId, setSearchTrackingId] = useState('');
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ========================================================
  // ONLINE ADMISSIONS EVALUATOR & NOTIFICATION LOGS STATES
  // ========================================================
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminApplications, setAdminApplications] = useState<AdmissionApplication[] | any[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [selectedAdminApp, setSelectedAdminApp] = useState<any | null>(null);
  
  // Google Auth integration states for "google aut" sending option
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [activeTabLogs, setActiveTabLogs] = useState<'applications' | 'logs'>('applications');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'ReviewRequired'>('All');
  
  // Active updating status states
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Authenticate Admin Counselor using Google popup Auth
  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/gmail.send');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleAccessToken(credential.accessToken);
        setGoogleUser(result.user);
      }
    } catch (err: any) {
      console.error("[Auth] Google Sign-In Failed:", err);
      alert(isBangla ? "গুগল লগইন ব্যর্থ হয়েছে। সাধারণ ট্রিগার সক্রিয় থাকবে।" : "Google authentication failed. Defaulting to standard triggers.");
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOut(auth);
      setGoogleUser(null);
      setGoogleAccessToken(null);
    } catch (err) {
      console.error("[Auth] Log out failed:", err);
    }
  };

  // Safe manual application deletion helper for test data cleaning
  const handleDeleteApplication = async (trackingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(isBangla ? "আপনি কি নিশ্চিতভাবে এই আবেদনটি মুছে ফেলতে চান?" : `Are you sure you want to permanently delete application ${trackingId}?`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'admissions', trackingId));
      if (selectedAdminApp?.trackingId === trackingId) {
        setSelectedAdminApp(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Status Change API invocation
  const handleUpdateStatus = async (trackingId: string, newStatus: string) => {
    setIsUpdatingStatus(trackingId);
    try {
      const payload: any = {
        trackingId,
        status: newStatus
      };
      
      if (newStatus === 'Approved' && googleAccessToken) {
        payload.googleAccessToken = googleAccessToken;
      }

      const response = await fetch(apiUrl('/api/admissions/update-status'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Server error occurred during approval process.');
      }

      if (selectedAdminApp && selectedAdminApp.trackingId === trackingId) {
        setSelectedAdminApp(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      alert(isBangla ? `অবস্থা আপডেট ব্যর্থ হয়েছে: ${err.message}` : `Status transition failure: ${err.message}`);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Fetch admissions list and notification delivery logs dynamically on toggle
  React.useEffect(() => {
    if (!isAdminMode) return;
    
    setIsAdminLoading(true);
    
    // Live admissions collection listener
    const unsubAdmissions = onSnapshot(collection(db, 'admissions'), (snap) => {
      const apps = snap.docs.map(doc => doc.data() as AdmissionApplication);
      // Sort applicants by tracking ID descending or applied date
      apps.sort((a,b) => b.trackingId.localeCompare(a.trackingId));
      setAdminApplications(apps);
      setIsAdminLoading(false);
    }, (err) => {
      console.error("Firestore admissions lookup stream failed:", err);
      setIsAdminLoading(false);
    });

    // Live delivery logs listener
    const unsubLogs = onSnapshot(collection(db, 'delivery_logs'), (snap) => {
      const logs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setDeliveryLogs(logs);
    }, (err) => {
      console.error("Firestore delivery logs stream failed:", err);
    });

    return () => {
      unsubAdmissions();
      unsubLogs();
    };
  }, [isAdminMode]);

  // Synchronize authenticated admin user from global firebase state and verify they are administrative staff
  React.useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setGoogleUser(user);
      
      const savedRole = localStorage.getItem('demo_user_role');
      const isDemoAdmin = savedRole === 'admin';
      const isOfficialEmail = user?.email?.endsWith('@damagarasmdhs.edu.bd');

      if (user && (isDemoAdmin || isOfficialEmail)) {
        setIsAdminMode(true);
      } else {
        // Fallback to check if a local demo admin bypass exists
        const demoUserRaw = localStorage.getItem('demo_user');
        if (demoUserRaw) {
          try {
            const demoUser = JSON.parse(demoUserRaw);
            if (demoUser?.role === 'admin') {
              setIsAdminMode(true);
              return;
            }
          } catch (e) {}
        }
        setIsAdminMode(false);
      }
    });
    return unsub;
  }, []);

  // Core Form Fields State mapped dynamically
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'A+',
    applyingClass: 'Class VI',
    fatherName: '',
    fatherProfession: '',
    motherName: '',
    motherProfession: '',
    mobileNumber: '',
    email: '',
    permanentAddress: '',
  });

  // Submitted admit card state
  const [submittedVoucher, setSubmittedVoucher] = useState<AdmissionApplication | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Perform validation on step changes
  const validateStep = (step: number) => {
    const errors: string[] = [];
    if (step === 1) {
      if (!formData.firstName.trim()) errors.push(isBangla ? 'প্রথম নাম আবশ্যক।' : 'First Name is required.');
      if (!formData.lastName.trim()) errors.push(isBangla ? 'শেষ নাম আবশ্যক।' : 'Last Name is required.');
      if (!formData.dateOfBirth) errors.push(isBangla ? 'জন্ম তারিখ নির্বাচন করুন।' : 'Date of Birth is required.');
    } else if (step === 2) {
      if (!formData.fatherName.trim()) errors.push(isBangla ? 'পিতার নাম প্রদান করুন।' : "Father's Name is required.");
      if (!formData.motherName.trim()) errors.push(isBangla ? 'মাতার নাম প্রদান করুন।' : "Mother's Name is required.");
      if (!formData.mobileNumber.trim()) {
        errors.push(isBangla ? 'যোগাযোগের মোবাইল নম্বর দিন।' : 'Mobile Phone Number is required.');
      } else if (!/^\d{11}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
        errors.push(isBangla ? 'মোবাইল নম্বরটি ১১ সংখ্যার হতে হবে।' : 'Mobile Number must be 11 numeric digits (e.g., 017XXXXXXXX).');
      }
      if (!formData.permanentAddress.trim()) {
        errors.push(isBangla ? 'স্থায়ী ঠিকানা প্রদান করুন।' : 'Permanent address is required.');
      }
    } else if (step === 3) {
      if (!uploadedFile) {
        errors.push(isBangla ? 'পূর্ববর্তী পরীক্ষার মার্কশীট বা প্রশংসাপত্র আপলোড করা আবশ্যক।' : 'Uploading a previous marksheet or birth certificate is required to complete.');
      }
    }
    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setFormErrors([]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setFormErrors([]);
    setCurrentStep(prev => prev - 1);
  };

  // Multi-step Submit Button
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `DSMD-2026-${randomSuffix}`;

    const newVoucher: AdmissionApplication = {
      trackingId,
      studentName: `${formData.firstName} ${formData.lastName}`.trim().toUpperCase(),
      studentNameBangla: '',
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      religion: 'Islam',
      bloodGroup: formData.bloodGroup,
      seekingClass: formData.applyingClass,
      fatherName: formData.fatherName,
      fatherProfession: formData.fatherProfession,
      motherName: formData.motherName,
      motherProfession: formData.motherProfession,
      mobileNumber: formData.mobileNumber,
      email: formData.email,
      permanentAddress: formData.permanentAddress,
      status: 'Pending',
      appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const docPath = `admissions/${trackingId}`;
    try {
      await setDoc(doc(db, 'admissions', trackingId), newVoucher);
      setSubmittedVoucher(newVoucher);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, docPath);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tracking query workflow function
  const handleTrackSearch = async () => {
    setTrackingError(null);
    const id = searchTrackingId.trim().toUpperCase();
    if (!id) {
      setTrackingError(isBangla ? 'অনুগ্রহ করে ট্র্যাকিং আইডি প্রদান করুন।' : 'Please enter a Tracking ID.');
      return;
    }
    setIsTrackingLoading(true);
    const docPath = `admissions/${id}`;
    try {
      const docSnap = await getDoc(doc(db, 'admissions', id));
      if (docSnap.exists()) {
        setSubmittedVoucher(docSnap.data() as AdmissionApplication);
      } else {
        setTrackingError(isBangla ? 'কোনো আবেদনপত্র খুঁজে পাওয়া যায়নি।' : 'No application record found for this tracking ID.');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, docPath);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  // Drag and Drop simulation functions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev !== null && prev >= 100) {
          clearInterval(interval);
          setUploadedFile({
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
          });
          setUploadProgress(null);
          return null;
        }
        return prev !== null ? prev + 30 : null;
      });
    }, 150);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeUploadedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
  };

  const handleResetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Male',
      bloodGroup: 'A+',
      applyingClass: 'Class VI',
      fatherName: '',
      fatherProfession: '',
      motherName: '',
      motherProfession: '',
      mobileNumber: '',
      email: '',
      permanentAddress: '',
    });
    setUploadedFile(null);
    setCurrentStep(1);
    setSubmittedVoucher(null);
    setFormErrors([]);
  };

  const scrollIntoForm = () => {
    document.getElementById('application-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-16 animate-fadeIn">
      
      {/* 1. HERO BANNER - HIGH FIDELITY TO VISUAL MOCKUP */}
      <section className="relative rounded-2xl overflow-hidden bg-white border border-outline-variant shadow-sm flex flex-col md:flex-row min-h-[440px]">
        
        {/* Left Informational text content */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center space-y-5">
          <span className="inline-flex items-center gap-2 bg-[#dbf1fe] text-[#0d631b] px-3 py-1 bg-primary/10 rounded-full w-max">
            <span className="h-2 w-2 rounded-full bg-[#0d631b] animate-ping" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">
              {isBangla ? 'অনলাইন ভর্তি কার্যক্রম ২০২৬' : 'Admissions Open 2026'}
            </span>
          </span>
          
          <h2 className="text-3xl md:text-5xl font-black text-on-surface tracking-tight leading-tight font-sans">
            {isBangla ? 'আপনার ভবিষ্যৎ গড়ুন আমাদের সাথে' : 'Shape Your Future With Us'}
          </h2>
          
          <p className="text-sm md:text-base text-on-surface-variant font-medium leading-relaxed max-w-xl">
            {isBangla 
              ? 'ঐতিহ্যমণ্ডিত দামাগারা সৈয়দ মিনা দ্বিমুখী উচ্চ বিদ্যালয়ে সমৃদ্ধ শিক্ষাদানের মাধ্যমে শিক্ষার্থীদের মেধা ও শৃঙ্খলার নতুন দিগন্ত উন্মুক্ত করতে আমাদের সাথে যোগ দিন।' 
              : 'Join an institution built on academic rigor, heritage, and modern excellence. We provide a structured environment designed to foster growth and exceptional achievements.'
            }
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={scrollIntoForm}
              className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-xs hover:bg-primary-hover shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{isBangla ? 'ভর্তির আবেদন করুন' : 'Apply Now'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button 
              onClick={() => alert(isBangla ? 'মেধার ভিত্তিতে ভর্তি পরীক্ষা অনুষ্ঠিত হবে। পাস নম্বর ৪০%।' : 'Written examination rules: English, Math, Bangla 100 marks prep.')}
              className="border-2 border-primary text-primary px-6 py-3 rounded-xl font-bold text-xs hover:bg-primary/5 transition-all cursor-pointer"
            >
              {isBangla ? 'ভর্তি নীতিমালা' : 'Admission Policy'}
            </button>
          </div>
        </div>

        {/* Right decorative image segment exact template url */}
        <div 
          className="flex-1 bg-[#cfe6f2] relative min-h-[280px] md:min-h-full"
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCrZDcQWmsGar4t7G2_NyP85gpXSfVuGHiF9uN2mDZRIFulErKsob1GvjTz-f2QqJ-nYsF_tEWC38Qs8gC3VLQPidwpQy2bhCc1pNH7A03wHpjx8G_b_d1ujILkKA4BQt7vIjngw5KVPBlY46zo5_RSMLI9VyDLrNJaJnZJfArUvq9Fld-7P0OKqhKml6ZjApOjtCLQNbxzu0Zq4GS02fF_AlDqXTflZiBUAq0okzXJ4XFWN2GsapS1cZG1z_SBC5RI6Qvvad4spfo')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        >
          {/* Overlay gradient to blend nicely */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent to-white/70" />
        </div>
      </section>

      {/* Primary evaluation board or user admissions view */}
      {isAdminMode ? (
        <div className="space-y-12 w-full animate-fadeIn" id="admissions-evaluator-board">
          
          {/* A. STAFF HEADER PANEL WITH GOOGLE AUTH INTEGRATION */}
          <div className="bg-[#0d631b] text-on-primary p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-[10px] md:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full w-max">
                <Sparkle className="h-3.5 w-3.5 text-[#cbffc2]" />
                {isBangla ? 'ভর্তি মূল্যায়ন প্যানেল ও নোটিফিকেশন ডেস্ক' : 'Admissions Board & Notification Desk'}
              </span>
              <h3 className="text-xl md:text-2xl font-black tracking-tight leading-none text-white font-sans">
                {isBangla ? 'শিক্ষা পরিষদ যাচাই কেন্দ্র' : 'Academic Evaluation & Sign-off'}
              </h3>
              <p className="text-xs md:text-sm text-white/80 max-w-xl">
                {isBangla 
                  ? 'আবেদনসমূহ পরীক্ষা করুন, স্থিতি পরিবর্তন করুন এবং স্বয়ংক্রিয় ভর্তি নিশ্চিতকরণ ইমেইল বা এসএমএস ফায়ার করুন।' 
                  : 'Review submitted applications, manage statuses, and fire automatic SMTP confirmations, authentic Google Gmail API emails, or Twilio SMS alerts.'
                }
              </p>
            </div>

            {/* Google Authentication Integration Desk */}
            <div className="bg-slate-950/20 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 shrink-0">
              {googleUser ? (
                <div className="flex items-center gap-3">
                  {googleUser.photoURL ? (
                    <img referrerPolicy="no-referrer" src={googleUser.photoURL} alt="admin" className="w-10 h-10 rounded-full border-2 border-[#cbffc2]" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[#cbffc2]">{googleUser.displayName?.[0] || 'A'}</div>
                  )}
                  <div className="text-left shrink-0 max-w-[150px]">
                    <p className="text-xs font-bold truncate text-white leading-tight">{googleUser.displayName}</p>
                    <p className="text-[10px] text-[#cbffc2] font-semibold truncate leading-none">Gmail API active</p>
                  </div>
                  <button 
                    onClick={handleGoogleSignOut}
                    title="Sign Out"
                    className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white cursor-pointer"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              ) : (
                <div className="text-center sm:text-left space-y-2">
                  <p className="text-[10px] text-white/70 max-w-[200px] leading-tight font-sans">
                    {isBangla ? 'গুগল অথেন্টিকেশন ব্যবহার করে আপনার জিমেইল অ্যাকাউন্ট উইন্ডো দিয়ে মেইল পাঠান:' : 'Connect Google Workspace Account to send confirmations via authentic Gmail API:'}
                  </p>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleSigningIn}
                    className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm border border-slate-200 cursor-pointer"
                  >
                    {isGoogleSigningIn ? (
                      <span className="h-3 w-3 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 0, 0)">
                          <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48C21.68,11.75 21.56,11.1 21.35,11.1z" fill="#4285F4" />
                          <path d="M12,20.8c2.38,0 4.38,-0.78 5.84,-2.1l-3.3,-2.58c-0.91,0.61 -2.07,0.98 -3.54,0.98 -2.71,0 -5.01,-1.83 -5.83,-4.29H1.72v2.67c1.47,2.92 4.49,4.92 8.01,4.92z" fill="#34A853" />
                          <path d="M6.17,12.81c-0.21,-0.61 -0.33,-1.28 -0.33,-1.96s0.12,-1.35 0.33,-1.96V6.22H1.72C1.03,7.6 0.63,9.15 0.63,10.85s0.4,3.25 1.09,4.63l3.85,-2.67z" fill="#FBBC05" />
                          <path d="M12,5.2c1.29,0 2.45,0.44 3.36,1.31l2.52,-2.52C16.37,2.58 14.37,1.8 12,1.8 8.48,1.8 5.46,3.8 3.99,6.72L7.84,9.39c0.82,-2.46 3.12,-4.19 5.83,-4.19z" fill="#EA4335" />
                        </g>
                      </svg>
                    )}
                    <span>{isBangla ? 'গুগল পোর্টাল লগইন' : 'Google Auth Login'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* B. TAB SELECTOR DESK */}
          <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none w-full scroll-smooth flex-nowrap" id="admission-logs-tabs">
            <button
              onClick={() => setActiveTabLogs('applications')}
              className={`pb-3.5 sm:pb-4 px-3 sm:px-6 font-bold text-xs sm:text-sm tracking-tight border-b-2 transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 leading-none shrink-0 ${
                activeTabLogs === 'applications' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              <span>{isBangla ? 'আবেদন তালিকা' : 'Admission Entries'} ({adminApplications.length})</span>
            </button>
            <button
              onClick={() => setActiveTabLogs('logs')}
              className={`pb-3.5 sm:pb-4 px-3 sm:px-6 font-bold text-xs sm:text-sm tracking-tight border-b-2 transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 leading-none shrink-0 ${
                activeTabLogs === 'logs' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MailCheck className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              <span>{isBangla ? 'বিজ্ঞপ্তি জার্নাল' : 'Notifications Logs'} ({deliveryLogs.length})</span>
            </button>
          </div>

          {activeTabLogs === 'applications' ? (
            <div className="space-y-8">
              {/* C. BENTO STATS CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white border border-outline-variant p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm text-center">
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-extrabold uppercase tracking-wider sm:tracking-widest">{isBangla ? 'সর্বমোট প্রাপ্ত আবেদন' : 'Total Submissions'}</p>
                  <p className="text-xl sm:text-3xl font-black text-slate-800 mt-1 font-mono">{adminApplications.length}</p>
                </div>
                <div className="bg-[#fef9c3] border border-yellow-200 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm text-center">
                  <p className="text-[9px] sm:text-[10px] text-yellow-800 font-extrabold uppercase tracking-wider sm:tracking-widest">{isBangla ? 'অপেক্ষমাণ' : 'Pending'}</p>
                  <p className="text-xl sm:text-3xl font-black text-yellow-900 mt-1 font-mono">
                    {adminApplications.filter(a => a.status === 'Pending').length}
                  </p>
                </div>
                <div className="bg-[#dcfce7] border border-green-200 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm text-center">
                  <p className="text-[9px] sm:text-[10px] text-green-800 font-extrabold uppercase tracking-wider sm:tracking-widest">{isBangla ? 'অনুমোদিত' : 'Approved'}</p>
                  <p className="text-xl sm:text-3xl font-black text-green-950 mt-1 font-mono">
                    {adminApplications.filter(a => a.status === 'Approved').length}
                  </p>
                </div>
                <div className="bg-[#fee2e2] border border-red-200 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm text-center">
                  <p className="text-[9px] sm:text-[10px] text-red-800 font-extrabold uppercase tracking-wider sm:tracking-widest">{isBangla ? 'রিভিউ প্রয়োজন' : 'Review Required'}</p>
                  <p className="text-xl sm:text-3xl font-black text-red-950 mt-1 font-mono">
                    {adminApplications.filter(a => a.status === 'ReviewRequired').length}
                  </p>
                </div>
              </div>

              {/* D. APPLICATION MANAGER BENTO GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* List View Left Panel (7-cols) */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Status Filters Bar */}
                  <div className="bg-white p-3 border border-outline-variant rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                      <Filter className="h-4 w-4" />
                      {isBangla ? 'ফিল্টার করুন:' : 'Filter applicants:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(['All', 'Pending', 'Approved', 'ReviewRequired'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setStatusFilter(filter)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer border ${
                            statusFilter === filter
                              ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          {filter === 'All' && (isBangla ? 'সব আবেদন' : 'All')}
                          {filter === 'Pending' && (isBangla ? 'অপেক্ষমাণ' : 'Pending')}
                          {filter === 'Approved' && (isBangla ? 'অনুমোদিত' : 'Approved')}
                          {filter === 'ReviewRequired' && (isBangla ? 'রিভিউ প্রয়োজন' : 'Review Required')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main scrolling applicants list */}
                  <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
                    {isAdminLoading ? (
                      <div className="p-12 text-center space-y-2">
                        <span className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block" />
                        <p className="text-xs text-slate-500 font-medium font-sans">{isBangla ? 'লোড হচ্ছে...' : 'Streaming from Firestore...'}</p>
                      </div>
                    ) : adminApplications.filter(a => statusFilter === 'All' || a.status === statusFilter).length === 0 ? (
                      <div className="p-12 text-center text-slate-400 space-y-1">
                        <AlertCircle className="h-10 w-10 mx-auto text-slate-300" />
                        <p className="text-xs font-bold">{isBangla ? 'কোনো ডাটা পাওয়া যায়নি' : 'No application entries match filter parameters'}</p>
                      </div>
                    ) : (
                      adminApplications
                        .filter(a => statusFilter === 'All' || a.status === statusFilter)
                        .map((app) => (
                          <div
                            key={app.trackingId}
                            onClick={() => {
                              setSelectedAdminApp(app);
                              setTimeout(() => {
                                document.getElementById('inspector-detail-panel')?.scrollIntoView({ behavior: 'smooth' });
                              }, 110);
                            }}
                            className={`p-4 transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
                              selectedAdminApp?.trackingId === app.trackingId 
                                ? 'bg-[#f4fbe6] border-l-4 border-[#0d631b]' 
                                : 'hover:bg-slate-50/70 border-l-4 border-transparent'
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">{app.trackingId}</span>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  app.status === 'Approved' 
                                    ? 'bg-[#dcfce7] text-[#15803d]' 
                                    : app.status === 'ReviewRequired' 
                                      ? 'bg-[#fee2e2] text-[#ef4444]' 
                                      : 'bg-[#fef9c3] text-[#854d0e]'
                                }`}>
                                  {app.status === 'Approved' && (isBangla ? 'অনুমোদিত' : 'Approved')}
                                  {app.status === 'ReviewRequired' && (isBangla ? 'রিভিউ প্রয়োজন' : 'Review Required')}
                                  {app.status === 'Pending' && (isBangla ? 'অপেক্ষমাণ' : 'Pending')}
                                </span>
                              </div>
                              <p className="font-bold text-sm text-slate-800 font-sans truncate">{app.studentName}</p>
                              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold font-sans">
                                <span>{isBangla ? 'শ্রেণী:' : 'Class:'} {app.seekingClass}</span>
                                <span>•</span>
                                <span>{isBangla ? 'আবেদন:' : 'Applied:'} {app.appliedDate}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={(e) => handleDeleteApplication(app.trackingId, e)}
                                title="Delete entry"
                                className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            </div>
                          </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Inspector Detail and Notification Card (5-cols) */}
                <div className="lg:col-span-5 scroll-mt-24" id="inspector-detail-panel">
                  {selectedAdminApp ? (
                    <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden sticky top-4">
                      
                      {/* Name Card Header */}
                      <div className="bg-slate-50 p-5 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                          {selectedAdminApp.studentName[0]}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-800 leading-tight">{selectedAdminApp.studentName}</h4>
                          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{selectedAdminApp.trackingId}</p>
                        </div>
                      </div>

                      {/* Detail list */}
                      <div className="p-5 space-y-5">
                        
                        {/* Status Change Board buttons */}
                        <div className="space-y-2">
                          <h5 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{isBangla ? 'ভর্তি মূল্যায়ন সিগন্যাল ট্রিগার' : 'Decision Sign-off Signal'}</h5>
                          <div className="grid grid-cols-3 gap-2">
                            
                            <button
                              disabled={isUpdatingStatus === selectedAdminApp.trackingId}
                              onClick={() => handleUpdateStatus(selectedAdminApp.trackingId, 'Approved')}
                              className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border cursor-pointer transition-all ${
                                selectedAdminApp.status === 'Approved'
                                  ? 'bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]'
                                  : 'bg-white hover:bg-[#f0fcf4] text-slate-700 border-slate-200'
                              }`}
                            >
                              <Check className="h-4 w-4 shrink-0" />
                              <span>{isBangla ? 'অনুমোদন' : 'Approved'}</span>
                            </button>
                            
                            <button
                              disabled={isUpdatingStatus === selectedAdminApp.trackingId}
                              onClick={() => handleUpdateStatus(selectedAdminApp.trackingId, 'ReviewRequired')}
                              className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border cursor-pointer transition-all ${
                                selectedAdminApp.status === 'ReviewRequired'
                                  ? 'bg-[#fee2e2] text-[#ef4444] border-[#fecaca]'
                                  : 'bg-white hover:bg-red-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              <ShieldAlert className="h-4 w-4 shrink-0" />
                              <span>{isBangla ? 'রিভিউ দিন' : 'Review Req'}</span>
                            </button>

                            <button
                              disabled={isUpdatingStatus === selectedAdminApp.trackingId}
                              onClick={() => handleUpdateStatus(selectedAdminApp.trackingId, 'Pending')}
                              className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border cursor-pointer transition-all ${
                                selectedAdminApp.status === 'Pending'
                                  ? 'bg-[#fef9c3] text-[#854d0e] border-[#fef08a]'
                                  : 'bg-white hover:bg-[#fffbeb] text-slate-700 border-slate-200'
                              }`}
                            >
                              <Clock className="h-4 w-4 shrink-0" />
                              <span>{isBangla ? 'রিসেট' : 'Pending'}</span>
                            </button>

                          </div>
                        </div>

                        {/* Delivery report state check */}
                        <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                          <h6 className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1 select-none">
                            <MailCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{isBangla ? 'বিজ্ঞপ্তি প্রেরণ ট্র্যাকিং' : 'AUTOMATED SENT DISPATCH'}</span>
                          </h6>
                          <div className="grid grid-cols-2 gap-3 divide-x divide-slate-150">
                            
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 font-extrabold uppercase block leading-none">{isBangla ? 'ইমেইল অবস্থা' : 'EMAIL DELIVERED'}</span>
                              <span className={`inline-block text-[11px] font-black leading-tight mt-1 ${
                                selectedAdminApp.emailStatus === 'Success' || selectedAdminApp.emailStatus?.includes('Google')
                                  ? 'text-green-600'
                                  : selectedAdminApp.notificationSent 
                                    ? 'text-blue-600'
                                    : 'text-amber-500'
                              }`}>
                                {selectedAdminApp.emailStatus || (selectedAdminApp.notificationSent ? 'Generated' : 'Idle Queue')}
                              </span>
                            </div>

                            <div className="pl-3 space-y-1">
                              <span className="text-[9px] text-slate-400 font-extrabold uppercase block leading-none">{isBangla ? 'এসএমএস ট্রিগার' : 'SMS DELIVERED'}</span>
                              <span className={`inline-block text-[11px] font-black leading-tight mt-1 ${
                                selectedAdminApp.smsStatus === 'Success'
                                  ? 'text-green-600'
                                  : selectedAdminApp.notificationSent
                                    ? 'text-blue-600 font-bold'
                                    : 'text-amber-500'
                              }`}>
                                {selectedAdminApp.smsStatus || (selectedAdminApp.notificationSent ? 'Generated' : 'Idle Queue')}
                              </span>
                            </div>

                          </div>
                        </div>

                        {/* Fields information details */}
                        <div className="border-t border-dashed border-slate-100 pt-4 space-y-3.5 text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{isBangla ? 'শ্রেণী:' : 'Class Seeked'}</p>
                              <p className="font-bold text-slate-800 mt-0.5">{selectedAdminApp.seekingClass}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{isBangla ? 'জন্ম তারিখ:' : 'Date Of Birth'}</p>
                              <p className="font-bold text-slate-800 mt-0.5">{selectedAdminApp.dateOfBirth}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{isBangla ? 'মোবাইল ফোন:' : 'Guardian Mobile'}</p>
                              <p className="font-bold text-slate-800 font-mono mt-0.5">{selectedAdminApp.mobileNumber || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{isBangla ? 'ইমেইল এড্রেস:' : 'Guardian Email'}</p>
                              <p className="font-bold text-slate-800 mt-0.5 truncate" title={selectedAdminApp.email}>{selectedAdminApp.email || 'N/A'}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{isBangla ? 'পিতার নাম ও পেশা:' : "Father's Name & Profession"}</p>
                            <p className="font-bold text-slate-800 mt-0.5">{selectedAdminApp.fatherName} • {selectedAdminApp.fatherProfession}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{isBangla ? 'মাতার নাম ও পেশা:' : "Mother's Name & Profession"}</p>
                            <p className="font-bold text-slate-800 mt-0.5">{selectedAdminApp.motherName} • {selectedAdminApp.motherProfession}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{isBangla ? 'স্থায়ী ঠিকানা:' : 'Permanent Address'}</p>
                            <p className="font-medium text-slate-700 leading-relaxed mt-0.5">{selectedAdminApp.permanentAddress}</p>
                          </div>
                        </div>

                      </div>

                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 text-center p-12 rounded-2xl text-slate-400 space-y-2 select-none sticky top-4">
                      <GraduationCap className="h-10 w-10 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold leading-normal">
                        {isBangla 
                          ? 'আবেদনের সম্পূর্ণ বিবরণ দেখতে অনুগ্রহ করে বাম প্যানেল থেকে একটি ক্যান্ডিডেট নির্বাচন করুন।' 
                          : 'Select an admission application record from the grid list to view full particulars and fire decisions.'
                        }
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ) : (
            
            /* E. REAL-TIME DELIVERY LOG JOURNAL */
            <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
              <div className="bg-slate-50 p-5 border-b border-slate-100 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-slate-800">{isBangla ? 'বিজ্ঞপ্তি প্রেরণ ডায়রি ডিরেক্টরি' : 'Automatic Sent Delivery Logs Registry'}</h4>
                  <p className="text-[11px] text-slate-400 font-sans">{isBangla ? 'ফায়ার হওয়া স্বয়ংক্রিয় ভর্তি নিশ্চিতকরণ নোটিশ ইমেইল ও এসএমএস এর রিয়েল-টাইম তথ্য।' : 'Inspecting historical and real-time outputs generated via SMTP, Twilio API webhooks or Google API popup auth.'}</p>
                </div>
                <MailCheck className="h-5 w-5 text-[#0d631b] shrink-0" />
              </div>

              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {deliveryLogs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-1">
                    <MailCheck className="h-10 w-10 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold font-sans">{isBangla ? 'কোনো নোটিফিকেশন এখনও পাঠানো হয়নি।' : 'No confirmation alerts dispatched in current firestore database database database.'}</p>
                  </div>
                ) : (
                  deliveryLogs.map((log) => (
                    <div key={log.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-slate-50/50 transition-all">
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">{log.trackingId}</span>
                          <span className="text-[10px] text-slate-400 font-bold font-sans">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 leading-none">{isBangla ? 'ছাত্রের নাম:' : 'Candidate:'} {log.studentName}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                          
                          {/* Rich Email Log item */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 leading-none">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                log.emailStatus === 'Success' || log.emailStatus?.includes('Google') ? 'bg-green-500' : 'bg-blue-400'
                              }`} />
                              <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Email ({log.email})</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed pl-3 font-semibold font-sans">{log.emailLogMessage}</p>
                          </div>

                          {/* Rich SMS Log item */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 leading-none">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                log.smsStatus === 'Success' ? 'bg-green-500' : 'bg-blue-400'
                              }`} />
                              <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">SMS ({log.mobileNumber})</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed pl-3 font-semibold font-sans">{log.smsLogMessage}</p>
                          </div>

                        </div>

                        {/* Expandable html template accordion drawer */}
                        <details className="text-xs border border-slate-100 rounded-xl bg-slate-50 overflow-hidden cursor-pointer">
                          <summary className="p-2 font-bold text-slate-600 hover:text-slate-900 select-none flex items-center justify-between gap-2 bg-slate-100/50 leading-none">
                            <span>{isBangla ? 'ইমেইল টেমপ্লেট ও এসএমএস টেক্সট ইনস্পেকশন' : 'Developer Rich payloads Inspect block'}</span>
                          </summary>
                          <div className="p-4 bg-white divide-y divide-slate-100 space-y-4">
                            <div className="space-y-1.5">
                              <p className="text-[10px] text-[#0d631b] font-black uppercase tracking-wider">{isBangla ? 'জাজ সাজানো ইমেইল কনটেন্ট (এইচটিএমএল)' : 'Dispatched Rich HTML template body:'}</p>
                              <div className="border border-slate-100 p-3 rounded-lg overflow-x-auto max-h-[300px] text-[11px] font-mono whitespace-pre-wrap bg-slate-950 text-slate-200">
                                {log.emailHtml}
                              </div>
                            </div>
                            <div className="space-y-1.5 pt-3">
                              <p className="text-[10px] text-[#0d631b] font-black uppercase tracking-wider">{isBangla ? 'জাজ সংক্ষিপ্ত বার্তা বডি (এসএমএস)' : 'Dispatched Notification SMS body:'}</p>
                              <p className="p-2.5 bg-[#f0f9ff] text-[#0284c7] border border-[#bae6fd] rounded-lg font-sans font-bold leading-relaxed">{log.smsText}</p>
                            </div>
                          </div>
                        </details>

                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      ) : submittedVoucher ? (
        
        /* ADMISSION ENTRANCE ADMIT CARD SUCCESS SLATE */
        <div className="max-w-3xl mx-auto bg-white border-2 border-[#bfcaba] rounded-3xl overflow-hidden shadow-xl print:shadow-none print:border-none animate-scaleUp" id="voucher-portal col">
          
          {/* Top layout */}
          <div className="bg-primary text-on-primary p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#cbffc2] bg-white/10 px-2.5 py-1 rounded-full">
                {isBangla ? 'অফিসিয়াল ভর্তি প্রবেশপত্র' : 'OFFICIAL EXAMINATION ADMIT CARD'}
              </span>
              <h3 className="text-lg md:text-xl font-bold tracking-tight text-white leading-none">Damagara Syed Meena Dimukhe High School</h3>
              <p className="text-xs text-white/80">
                {isBangla ? 'রিসেপশন ট্র্যাকিং আইডি:' : 'Track ID Reference:'} <span className="font-mono font-black text-sm bg-slate-900/40 text-[#cbffc2] px-2.5 py-0.5 rounded ml-1 leading-none">{submittedVoucher.trackingId}</span>
              </p>
            </div>
            <FileCheck2 className="h-12 w-12 text-[#cbffc2] shrink-0" />
          </div>

          {/* Ticket Information Matrix */}
          <div className="p-6 md:p-8 space-y-6">
            
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-primary uppercase font-mono tracking-wide">{isBangla ? 'আবেদনটি সফলভাবে জমা হয়েছে' : 'APPLICATION SUCCESSFULLY FILED'}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {isBangla 
                    ? `অনলাইন আবেদনপত্রটি ${submittedVoucher.appliedDate} তারিখে গৃহীত হয়েছে। লিখিত মূল পরীক্ষার দিন প্রবেশপত্রটি ডাউনলোড করে সঙ্গে আনুন।` 
                    : `The admission registration was updated in databases on ${submittedVoucher.appliedDate}. Print this generated ticket card and present it at exam center.`
                  }
                </p>
              </div>
            </div>

            {/* Candidate Info Grid Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs md:text-sm border-b border-dashed border-slate-200 pb-6">
              <div className="space-y-0.5">
                <span className="text-on-surface-variant font-bold uppercase text-[9px] block tracking-wide">{isBangla ? 'পরীক্ষার্থীর পূর্ণ নাম' : 'Candidate Student Name'}</span>
                <p className="font-bold text-slate-800 text-sm">{submittedVoucher.studentName}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-on-surface-variant font-bold uppercase text-[9px] block tracking-wide">{isBangla ? 'আবেদনকৃত শ্রেণি ও লিঙ্গ' : 'Class Applied & Gender'}</span>
                <p className="font-bold text-slate-800 text-sm">{submittedVoucher.seekingClass} ({submittedVoucher.gender})</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-on-surface-variant font-bold uppercase text-[9px] block tracking-wide">{isBangla ? 'জন্ম তারিখ' : 'Date of Birth'}</span>
                <p className="font-bold text-slate-800 text-sm font-mono">{submittedVoucher.dateOfBirth}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-on-surface-variant font-bold uppercase text-[9px] block tracking-wide">{isBangla ? 'মোবাইল ফোন নম্বর' : 'Emergency Mobile Contact'}</span>
                <p className="font-bold text-slate-800 text-sm font-mono">{submittedVoucher.mobileNumber}</p>
              </div>
              <div className="space-y-0.5 sm:col-span-2">
                <span className="text-on-surface-variant font-bold uppercase text-[9px] block tracking-wide">{isBangla ? 'পিতা ও মাতার বিবরণী' : "Parents Credentials"}</span>
                <p className="font-bold text-slate-800 text-sm">{submittedVoucher.fatherName} (Father) / {submittedVoucher.motherName} (Mother)</p>
              </div>
            </div>

            {/* Entrance Written Exam particulars card block */}
            <div className="p-5 bg-[#dbf1fe] rounded-2xl border border-outline-variant/60 space-y-3">
              <span className="text-[10px] font-extrabold uppercase text-[#0d631b] tracking-wider flex items-center gap-1.5 leading-none">
                <Clock className="h-4 w-4" />
                <span>{isBangla ? 'লিখিত ভর্তি পরীক্ষার সূচী ও নিয়মাবলী' : 'Written Admission Exam Schedule'}</span>
              </span>
              <div className="text-xs text-[#071e27] space-y-2 leading-relaxed">
                <p>• <strong>{isBangla ? 'পরীক্ষার কেন্দ্র:' : 'Exam Center:'}</strong> {isBangla ? 'একাডেমিক ব্লক, ভবনের নিচতলা, দামাগারা উচ্চ বিদ্যালয় ক্যাম্পাস।' : 'Academic Block Center, Room 104-106, School Campus.'}</p>
                <p>• <strong>{isBangla ? 'তারিখ ও সময়:' : 'Date & Timing:'}</strong> {isBangla ? 'জানুয়ারী ২৮, ২০২৬ খ্রি. সকাল ১০:০০ টা হতে দুপুর ১২:০০ টা পর্যন্ত।' : 'January 28, 2026, 10:00 AM to 12:00 PM (Report 30 mins earlier).'}</p>
                <p>• <strong>{isBangla ? 'পরীক্ষামূলক বিষয়সূচী:' : 'Syllabus guidelines:'}</strong> {isBangla ? 'বাংলা (২৫), ইংরেজি (২৫), সাধারণ গণিত (৩০) ও বিজ্ঞান (২০) বিষয়ের বেসিক মূল্যায়ন।' : 'Evaluation on primary English grammar, basic arithmetic formulas, mother tongue, and general sciences.'}</p>
              </div>
            </div>

          </div>

          {/* Footer controls */}
          <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-between gap-4 print:hidden">
            <button 
              onClick={handleResetForm}
              className="text-primary text-xs font-black hover:underline py-2 px-4 cursor-pointer"
            >
              {isBangla ? 'নতুন করে আবেদন ফরম লিখুন' : 'Submit Another Form'}
            </button>
            <button 
              onClick={() => window.print()}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-primary-hover transition-all flex items-center gap-2 cursor-pointer shadow"
            >
              <Printer className="h-4.5 w-4.5" />
              <span>{isBangla ? 'প্রবেশপত্র প্রিন্ট করুন' : 'Print Admit Voucher'}</span>
            </button>
          </div>

        </div>

      ) : (
        <div className="space-y-12 w-full">
          {/* Dynamic Tracker Lookup Panel */}
          <div className="bg-white border border-outline-variant p-6 md:p-8 rounded-2xl shadow-sm max-w-2xl mx-auto space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#e6f6ff] text-primary flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-on-surface font-sans">
                  {isBangla ? 'আবেদনের বর্তমান অবস্থা যাচাই করুন' : 'Track Submitted Application Status'}
                </h3>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  {isBangla ? 'আপনার ভর্তি ট্র্যাকিং কোড (যেমন DSMD-2026-6142) নিচে দিন।' : 'Enter your admission tracking code (e.g., DSMD-2026-6142) to view status.'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder={isBangla ? 'ভর্তি ট্র্যাকিং আইডি লিখুন...' : 'Tracking Code e.g. DSMD-2026-1024'} 
                value={searchTrackingId}
                onChange={(e) => setSearchTrackingId(e.target.value)}
                className="flex-1 bg-slate-50 border border-outline-variant px-4 py-2.5 text-xs rounded-xl focus:bg-white text-on-surface font-mono uppercase tracking-wider"
              />
              <button 
                onClick={handleTrackSearch}
                disabled={isTrackingLoading}
                className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-primary-hover flex items-center gap-2 cursor-pointer shrink-0 transition-all disabled:opacity-50"
              >
                {isTrackingLoading ? (
                  <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                ) : null}
                <span>{isBangla ? 'খুঁজুন' : 'Track Status'}</span>
              </button>
            </div>
            {trackingError && (
              <p className="text-[11px] text-red-600 font-semibold animate-fadeIn">{trackingError}</p>
            )}
            <div className="border-t border-dashed border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-[10px] md:text-xs text-slate-500 font-semibold flex items-center gap-1 select-none">
                <NotebookTabs className="h-4 w-4 text-primary shrink-0" />
                {isBangla ? 'ভর্তি মূল্যায়ন ও বিজ্ঞপ্তি ডেস্কে যান:' : 'Admission evaluators desk & notifications hub:'}
              </span>
              <button
                type="button"
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm border ${
                  isAdminMode 
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100/50' 
                    : 'bg-[#f0fbdc] text-[#2e5e04] border-[#d2ecb4] hover:bg-[#e1ffd4]'
                }`}
              >
                <span>{isAdminMode ? (isBangla ? 'প্যানেল বন্ধ করুন' : 'Close Evaluator') : (isBangla ? 'প্যানেল খুলুন' : 'Open Evaluator')}</span>
              </button>
            </div>
          </div>

          {/* 2. BENTO GRID: ADMISSION REQUIREMENTS & MULTI-STEP APPLICATION FORM */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="application-form-section">
          
          {/* Left Column (5-cols) - Eligibility & Dates info */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Card A: Eligibility */}
            <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#8c6800]" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-on-surface leading-tight font-sans">
                  {isBangla ? 'ভর্তির যোগ্যতা ও শর্তাবলী' : 'Eligibility & Requirements'}
                </h3>
              </div>
              <ul className="space-y-3.5 text-xs md:text-sm text-on-surface-variant leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  <span>{isBangla ? 'স্বীকৃত প্রাথমিক শিক্ষা প্রতিষ্ঠান বা বোর্ড হতে প্রাথমিক শিক্ষা শেষ হতে হবে।' : 'Completed primary education certificate from a recognized board.'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  <span>{isBangla ? 'ভর্তির শিক্ষাবর্ষে শিক্ষার্থীর বয়স ১১ থেকে ১৩ বছরের মধ্যে হওয়া সমীচীন।' : 'Age limit: Ideal range 11 to 13 years old as of application month.'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  <span>{isBangla ? 'ভর্তির চূড়ান্ত সময়ে জন্ম সনদের রঙ্গিন কপি এবং স্কুল ট্রান্সফার সার্টিফিকেট লাগবে।' : 'Birth registration card and original School Transfer Certificate (TC) required.'}</span>
                </li>
              </ul>
            </div>

            {/* Card B: Dates */}
            <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#ffefd7] text-[#8c6800] flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-on-surface leading-tight font-sans">
                  {isBangla ? 'গুরুত্বপূর্ণ সময়সূচী' : 'Important Dates'}
                </h3>
              </div>
              <div className="space-y-4 text-xs md:text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-on-surface-variant">{isBangla ? 'আবেদন শুরু' : 'Application Opens'}</span>
                  <span className="font-bold text-slate-800">Oct 15, 2026</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-on-surface-variant font-bold text-primary">{isBangla ? 'ভর্তি লিখিত পরীক্ষা' : 'Written Entrance Exam'}</span>
                  <span className="font-bold text-primary">Jan 28, 2026</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">{isBangla ? 'চূড়ান্ত মেধাতালিকা' : 'Final Merit List'}</span>
                  <span className="font-bold text-slate-800">Feb 05, 2026</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (7-cols) - The Application Wizard */}
          <div className="lg:col-span-7 bg-white border border-outline-variant rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
            
            {/* Step Wizard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-on-surface font-sans">
                  {isBangla ? 'অনলাইন ভর্তি ফরম' : 'Application Form'}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  {isBangla ? 'দয়া করে প্রতিটি তথ্য নির্ভুলভাবে ইংরেজিতে পূরণ করুন।' : 'Please fill in your details accurately.'}
                </p>
              </div>

              {/* Steps Progress Visual Indicator Circles */}
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center leading-none transition-all ${
                  currentStep >= 1 ? 'bg-primary text-on-primary' : 'bg-slate-100 text-slate-500'
                }`}>1</span>
                <span className={`w-6 h-1 rounded ${currentStep >= 2 ? 'bg-primary' : 'bg-slate-200'}`} />
                <span className={`w-6 h-6 rounded-full flex items-center justify-center leading-none transition-all ${
                  currentStep >= 2 ? 'bg-primary text-on-primary' : 'bg-slate-100 text-slate-500'
                }`}>2</span>
                <span className={`w-6 h-1 rounded ${currentStep >= 3 ? 'bg-primary' : 'bg-slate-200'}`} />
                <span className={`w-6 h-6 rounded-full flex items-center justify-center leading-none transition-all ${
                  currentStep >= 3 ? 'bg-primary text-on-primary' : 'bg-slate-100 text-slate-500'
                }`}>3</span>
              </div>
            </div>

            {/* Error notifications container */}
            {formErrors.length > 0 && (
              <div className="bg-[#ffdad6] text-[#ba1a1a] p-4 rounded-xl border border-error/20 flex gap-2.5 items-start animate-fadeIn">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold block">{isBangla ? 'অনুগ্রহ করে ত্রুটিগুলো সংশোধন করুন:' : 'Please resolve the following errors:'}</span>
                  {formErrors.map((err, idx) => (
                    <p key={idx}>• {err}</p>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------- STEP 1: Candidate particulars -------------------- */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* First Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface" htmlFor="firstName">
                      {isBangla ? 'প্রথম নাম (First Name)' : 'First Name'} <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input 
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder={isBangla ? 'যেমন: SAKIB' : 'e.g., SAKIB'}
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface" htmlFor="lastName">
                      {isBangla ? 'শেষ নাম (Last Name)' : 'Last Name'} <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input 
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder={isBangla ? 'যেমন: HASAN' : 'e.g., HASAN'}
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface"
                    />
                  </div>

                  {/* Date of birth */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface" htmlFor="dateOfBirth">
                      {isBangla ? 'জন্ম তারিখ (Date of Birth)' : 'Date of Birth'} <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input 
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface font-mono"
                    />
                  </div>

                  {/* Class applied for */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface" htmlFor="applyingClass">
                      {isBangla ? 'আবেদনকৃত ক্লাস' : 'Applying For Class'} <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <select
                      id="applyingClass"
                      name="applyingClass"
                      value={formData.applyingClass}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface"
                    >
                      <option value="Class VI">{isBangla ? '৬ষ্ঠ শ্রেণি (Class 6)' : 'Class VI (Class 6)'}</option>
                      <option value="Class VII">{isBangla ? '৭ম শ্রেণি (Class 7)' : 'Class VII (Class 7)'}</option>
                      <option value="Class VIII">{isBangla ? '৮ম শ্রেণি (Class 8)' : 'Class VIII (Class 8)'}</option>
                      <option value="Class IX">{isBangla ? '৯ম শ্রেণি (Class 9)' : 'Class IX (Class 9)'}</option>
                      <option value="Class X">{isBangla ? '১০ম শ্রেণি (Class 10)' : 'Class X (Class 10)'}</option>
                    </select>
                  </div>

                  {/* Gender selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface" htmlFor="gender">
                      {isBangla ? 'শিক্ষার্থীর লিঙ্গ' : 'Student Gender'}
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface"
                    >
                      <option value="Male">{isBangla ? 'ছাত্র (Male)' : 'Male'}</option>
                      <option value="Female">{isBangla ? 'ছাত্রী (Female)' : 'Female'}</option>
                    </select>
                  </div>

                  {/* Blood Group */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface" htmlFor="bloodGroup">
                      {isBangla ? 'রক্তের গ্রুপ' : 'Blood Group'}
                    </label>
                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{isBangla ? 'পরবর্তী ধাপে যান' : 'Next Step'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* -------------------- STEP 2: Parents & Contact credentials -------------------- */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Father Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface" htmlFor="fatherName">
                      {isBangla ? 'পিতার নাম' : "Father's Name"} <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input 
                      type="text"
                      id="fatherName"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      placeholder={isBangla ? 'ইংরেজি বড় অক্ষরে লিখুন' : 'e.g., ABDUL KARIM'}
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface font-sans"
                    />
                  </div>

                  {/* Father Occupation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface" htmlFor="fatherProfession">
                      {isBangla ? 'পিতার পেশা' : "Father's Profession"}
                    </label>
                    <input 
                      type="text"
                      id="fatherProfession"
                      name="fatherProfession"
                      value={formData.fatherProfession}
                      onChange={handleInputChange}
                      placeholder={isBangla ? 'যেমন: Farmer / Business' : 'e.g., Teacher / Business'}
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface"
                    />
                  </div>

                  {/* Mother Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface" htmlFor="motherName">
                      {isBangla ? 'মাতার নাম' : "Mother's Name"} <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input 
                      type="text"
                      id="motherName"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      placeholder={isBangla ? 'ইংরেজি বড় অক্ষরে লিখুন' : 'e.g., MORIOM BEGUM'}
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface"
                    />
                  </div>

                  {/* Mother Profession */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface" htmlFor="motherProfession">
                      {isBangla ? 'মাতার পেশা' : "Mother's Profession"}
                    </label>
                    <input 
                      type="text"
                      id="motherProfession"
                      name="motherProfession"
                      value={formData.motherProfession}
                      onChange={handleInputChange}
                      placeholder={isBangla ? 'যেমন: Homemaker' : 'e.g., Homemaker'}
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface"
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface" htmlFor="mobileNumber">
                      {isBangla ? 'মোবাইল ফোন নম্বর' : 'Contact Mobile No'} <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input 
                      type="tel"
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., 01712345678"
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface font-mono"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface" htmlFor="email">
                      {isBangla ? 'অভিভাবকের ইমেইল' : 'Guardian Email'}
                    </label>
                    <input 
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g., parent@example.com"
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface font-mono"
                    />
                  </div>

                </div>

                {/* Permanent address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface" htmlFor="permanentAddress">
                    {isBangla ? 'স্থায়ী ঠিকানা' : 'Permanent Home Address'} <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <textarea 
                    id="permanentAddress"
                    name="permanentAddress"
                    rows={2}
                    value={formData.permanentAddress}
                    onChange={handleInputChange}
                    placeholder={isBangla ? 'গ্রাম, পোস্ট অফিস ও জেলার নাম লিখুন।' : 'e.g., Village: Damagara, Post: Dimukhe, Tangail Sadar, Tangail.'}
                    className="w-full bg-slate-50 border border-outline-variant rounded-xl px-4 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface leading-normal text-clip"
                  />
                </div>

                <div className="pt-4 flex justify-between gap-4">
                  <button 
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-3 border border-outline rounded-xl font-bold text-xs text-on-surface hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {isBangla ? 'আগের ধাপে যান' : 'Back'}
                  </button>
                  <button 
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{isBangla ? 'দাখিল ধাপে যান' : 'Next Step'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* -------------------- STEP 3: Document marksheet file upload -------------------- */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-on-surface block">
                    {isBangla ? 'পূর্ববর্তী বছরের মার্কশীট বা প্রশংসাপত্র আপলোড' : 'Upload Previous Marksheet (or Birth Certificate)'} <span className="text-[#ba1a1a]">*</span>
                  </span>

                  {/* Interactive Drag and Drop Container area */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleFileDrop}
                    onClick={triggerFileSelect}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${
                      isDragging 
                        ? 'border-primary bg-primary/5' 
                        : uploadedFile 
                          ? 'border-[#2e7d32] bg-[#2e7d32]/5' 
                          : 'border-outline-variant bg-slate-50 hover:bg-slate-100/60'
                    }`}
                  >
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                    />

                    {uploadProgress !== null ? (
                      /* File upload processing animation progress */
                      <div className="space-y-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto animate-spin border-2 border-primary border-t-transparent" />
                        <p className="text-xs font-bold text-[#0d631b]">{isBangla ? 'নথি যাচাই করা হচ্ছে...' : 'Validating document security content...'}</p>
                      </div>
                    ) : uploadedFile ? (
                      /* Display successfully uploaded state */
                      <div className="space-y-3">
                        <div className="h-12 w-12 bg-[#2e7d32]/10 rounded-full flex items-center justify-center text-[#2e7d32] mx-auto">
                          <FileCheck className="h-6 w-6" />
                        </div>
                        <p className="text-xs font-bold text-[#2e7d32] truncate max-w-xs">{uploadedFile.name}</p>
                        <p className="text-[10px] text-on-surface-variant">File size: {uploadedFile.size}</p>
                        <button 
                          onClick={removeUploadedFile}
                          className="text-[10px] text-[#ba1a1a] hover:underline font-bold px-3 py-1.5 bg-red-50 border border-red-200/50 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                          <span>{isBangla ? 'ফাইল পরিবর্তন করুন' : 'Remove File'}</span>
                        </button>
                      </div>
                    ) : (
                      /* Standard default drag instructions state */
                      <div className="space-y-3">
                        <div className="h-12 w-12 bg-white rounded-full text-on-surface flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                          <UploadCloud className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface">
                            {isBangla ? 'ফাইল আপলোড করতে এখানে ক্লিক করুন অথবা ড্র্যাগ করুন' : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">PDF, JPG or PNG (MAX. 5MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-xs text-on-surface-variant flex items-start gap-2.5 leading-relaxed">
                  <Sparkles className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  <span>
                    {isBangla 
                      ? 'সাবমিট বাটন ক্লিক করার সাথে সাথে আপনার প্রবেশপত্র এবং রিসেপশন ট্র্যাকিং কোড তৈরি করা হবে।' 
                      : 'Pressing the submit key compiles all data structure formats and outputs printable official Exam Admit cards instantly.'
                    }
                  </span>
                </div>

                <div className="pt-4 flex justify-between gap-4">
                  <button 
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-3 border border-outline rounded-xl font-bold text-xs text-on-surface hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    {isBangla ? 'আগের ধাপে যান' : 'Back'}
                  </button>
                  <button 
                    type="button"
                    onClick={handleFormSubmit}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{isBangla ? 'আবেদন সাবমিট করুন' : 'Submit & Create Admit Card'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </section>
        </div>
      )}

    </div>
  );
}

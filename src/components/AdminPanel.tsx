/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  FileText, 
  CheckCircle, 
  Calendar, 
  Trash2, 
  Plus, 
  Edit, 
  Settings, 
  Image as ImageIcon, 
  FileCheck2, 
  LogOut, 
  Globe, 
  ArrowLeft, 
  Upload, 
  Activity, 
  UserCheck, 
  Clock, 
  Search, 
  ShieldCheck, 
  BookOpen, 
  GraduationCap, 
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  setDoc, 
  getDoc,
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../firebase';
import { SCHOOL_NOTICES, SCHOOL_FACULTY } from '../data';
import { Notice, Faculty, StudentResult, AdmissionApplication } from '../types';
import { apiUrl } from '../api';

interface AdminPanelProps {
  isBangla: boolean;
  setIsBangla: (val: boolean) => void;
  pathname: string;
  navigate: (to: string) => void;
  adminUser: any;
  onLogout: () => void;
}

export default function AdminPanel({
  isBangla,
  setIsBangla,
  pathname,
  navigate,
  adminUser,
  onLogout
}: AdminPanelProps) {
  // Determine current active section based on sub-path
  const getSubSection = () => {
    if (pathname === '/admin/notices') return 'notices';
    if (pathname === '/admin/teachers') return 'teachers';
    if (pathname === '/admin/results') return 'results';
    if (pathname === '/admin/gallery') return 'gallery';
    if (pathname === '/admin/admissions') return 'admissions';
    if (pathname === '/admin/settings') return 'settings';
    return 'dashboard';
  };

  const activeSection = getSubSection();

  // Firestore collections states
  const [notices, setNotices] = useState<Notice[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]); // Combines SCHOOL_FACULTY & custom ones
  const [results, setResults] = useState<StudentResult[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    schoolName: 'Damagara Syed Meena Dimukhe High School',
    schoolNameBangla: 'দামাগারা সৈয়দ মিনা দ্বিমুখী উচ্চ বিদ্যালয়',
    eiin: '119828',
    established: '1964',
    email: 'info@damagarasmdhs.edu.bd',
    hotline: '+880 1711-366659',
    helpline: '+88 01552-349811',
    address: 'Tarat gari, Bogra, Rajshahi, Bangladesh',
    addressBangla: 'তারট গাড়ী, ধুনট, বগুড়া, রাজশাহী, বাংলাদেশ'
  });

  // UI state managers
  const [loading, setLoading] = useState<Record<string, boolean>>({
    notices: false,
    teachers: false,
    results: false,
    gallery: false,
    admissions: false,
    settings: false,
    seeding: false
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Core dialog trigger states
  const [noticeForm, setNoticeForm] = useState<Partial<Notice>>({
    title: '',
    banglaTitle: '',
    category: 'Academic',
    content: '',
    banglaContent: '',
    publishDate: ''
  });
  const [isNoticeEdit, setIsNoticeEdit] = useState(false);
  const [editNoticeId, setEditNoticeId] = useState<string | null>(null);

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    banglaName: '',
    designation: '',
    banglaDesignation: '',
    qualification: '',
    email: '',
    phone: '',
    dept: 'science',
    joiningYear: new Date().getFullYear(),
    imageUrl: ''
  });

  const [resultsForm, setResultsForm] = useState({
    studentId: '',
    studentName: '',
    banglaName: '',
    class: 'Class X',
    section: 'A',
    rollNo: 1,
    examType: 'Annual Examination',
    year: new Date().getFullYear(),
    bengali: 80,
    english: 82,
    mathematics: 85,
    science: 78,
    ict: 88,
    highestBengali: 95,
    highestEnglish: 92,
    highestMathematics: 98,
    highestScience: 90,
    highestIct: 97
  });

  const [galleryForm, setGalleryForm] = useState({
    title: '',
    banglaTitle: '',
    category: 'classroom',
    description: '',
    banglaDescription: '',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    banglaDate: new Date().toLocaleDateString('bn-BD'),
    imageUrl: ''
  });

  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [teacherPreviewUrl, setTeacherPreviewUrl] = useState<string | null>(null);
  const [galleryPreviewUrl, setGalleryPreviewUrl] = useState<string | null>(null);
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionApplication | null>(null);

  // Auto flash message dismissal
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // Set up Firebase Real-time listeners & initial seeds
  useEffect(() => {
    // 1. Notices subscription
    const unsubNotices = onSnapshot(collection(db, 'notices'), (snap) => {
      const noticeList: Notice[] = [];
      snap.forEach((doc) => {
        noticeList.push({ id: doc.id, ...doc.data() } as Notice);
      });
      setNotices(noticeList);

      // Auto-Seed notices if collection empty to keep high-fidelity mock operational!
      if (snap.empty && !loading.seeding && localStorage.getItem('demo_user_role') === 'admin') {
        seedNotices();
      }
    });

    // 2. Teachers subscription
    const unsubTeachers = onSnapshot(collection(db, 'teachers'), (snap) => {
      const docs: any[] = [];
      snap.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setTeachers(docs);

      // Auto-Seed teachers if collection empty to avoid blank state
      if (snap.empty && !loading.seeding && localStorage.getItem('demo_user_role') === 'admin') {
        seedTeachers();
      }
    });

    // 3. Results subscription
    const unsubResults = onSnapshot(collection(db, 'results'), (snap) => {
      const docs: StudentResult[] = [];
      snap.forEach((doc) => {
        docs.push({ ...doc.data() } as StudentResult);
      });
      setResults(docs);
    });

    // 4. Admissions subscription
    const unsubAdmissions = onSnapshot(collection(db, 'admissions'), (snap) => {
      const docs: AdmissionApplication[] = [];
      snap.forEach((doc) => {
        docs.push({ ...doc.data() } as AdmissionApplication);
      });
      // Sort admissions by date descending
      docs.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
      setAdmissions(docs);
    });

    // 5. Notifications audit logs subscription
    const unsubLogs = onSnapshot(collection(db, 'delivery_logs'), (snap) => {
      const docs: any[] = [];
      snap.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      docs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setDeliveryLogs(docs);
    });

    // 6. Settings loader
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'school_info'));
        if (snap.exists()) {
          setSettings(snap.data());
        } else if (localStorage.getItem('demo_user_role') === 'admin') {
          // Initialize in firestore ONLY if logged in as admin
          await setDoc(doc(db, 'settings', 'school_info'), settings);
        }
      } catch (err) {
        console.warn("Could not fetch school settings from Firestore, using locals:", err);
      }
    };
    loadSettings();

    return () => {
      unsubNotices();
      unsubTeachers();
      unsubResults();
      unsubAdmissions();
      unsubLogs();
    };
  }, []);

  // --- SEEDING LOGICS FOR COLD DATABASES ---
  const seedNotices = async () => {
    setLoading(prev => ({ ...prev, seeding: true }));
    try {
      console.log("[Seeder] Initializing FireStore 'notices' seeding...");
      for (const notice of SCHOOL_NOTICES) {
        await setDoc(doc(db, 'notices', notice.id), {
          id: notice.id,
          title: notice.title,
          banglaTitle: notice.banglaTitle || '',
          publishDate: notice.publishDate,
          category: notice.category,
          isNew: notice.isNew || false,
          content: notice.content,
          banglaContent: notice.banglaContent || ''
        });
      }
      console.log("[Seeder] Seeding 'notices' completed successfully.");
    } catch (err) {
      console.error("[Seeder] Failed notices seeding:", err);
    } finally {
      setLoading(prev => ({ ...prev, seeding: false }));
    }
  };

  const seedTeachers = async () => {
    setLoading(prev => ({ ...prev, seeding: true }));
    try {
      console.log("[Seeder] Initializing FireStore 'teachers' seeding...");
      for (const faculty of SCHOOL_FACULTY) {
        await setDoc(doc(db, 'teachers', faculty.id), {
          id: faculty.id,
          name: faculty.name,
          banglaName: faculty.banglaName || '',
          designation: faculty.designation,
          banglaDesignation: faculty.banglaDesignation || '',
          qualification: faculty.qualification,
          email: faculty.email,
          joiningYear: faculty.joiningYear || 2018,
          dept: faculty.name.includes('Rahman') || faculty.name.includes('Roy') ? 'science' : faculty.name.includes('Begum') ? 'arts' : faculty.name.includes('Ali') ? 'commerce' : 'general',
          imageUrl: faculty.imageUrl || ''
        });
      }
      console.log("[Seeder] Seeding 'teachers' completed successfully.");
    } catch (err) {
      console.error("[Seeder] Failed teachers seeding:", err);
    } finally {
      setLoading(prev => ({ ...prev, seeding: false }));
    }
  };

  // Cloudinary image upload utility API proxy
  const handleImageFileChangeEvent = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    targetForm: 'teacher' | 'gallery'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a real-time thumbnail preview of the selected image before it is sent to Cloudinary
    const previewUrl = URL.createObjectURL(file);
    if (targetForm === 'teacher') {
      setTeacherPreviewUrl(previewUrl);
    } else {
      setGalleryPreviewUrl(previewUrl);
    }

    setUploadProgress(isBangla ? 'ছবি আপলোড হচ্ছে...' : 'Transmitting media file securely to Cloudinary...');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(apiUrl('/api/upload'), {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(isBangla ? 'আপলোড ব্যর্থ হয়েছে।' : 'Upload handler rejected attachment.');
      }

      const data = await response.json();
      if (data.success && data.url) {
        if (targetForm === 'teacher') {
          setTeacherForm(prev => ({ ...prev, imageUrl: data.url }));
        } else {
          setGalleryForm(prev => ({ ...prev, imageUrl: data.url }));
        }
        setSuccessMessage(isBangla ? 'মিডিয়া আপলোড সফল হয়েছে!' : 'Media connected and stored into Cloudinary CDN!');
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err: any) {
      console.error('[Upload] Media transmission fail:', err);
      setErrorMessage(isBangla ? 'ফাইল আপলোড ব্যর্থ হয়েছে: ' + err.message : 'Media pipeline failed: ' + err.message);
      // Reset preview on failure
      if (targetForm === 'teacher') {
        setTeacherPreviewUrl(null);
      } else {
        setGalleryPreviewUrl(null);
      }
    } finally {
      setUploadProgress(null);
    }
  };

  // --- ACTIONS HANDLERS ---

  // Notice Create/Edit
  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.content) {
      setErrorMessage(isBangla ? 'অনগ্রহ করে শিরোনাম ও বিবরণ প্রদান করুন।' : 'Please supply a title and description content.');
      return;
    }

    setLoading(prev => ({ ...prev, notices: true }));
    try {
      const id = isNoticeEdit && editNoticeId ? editNoticeId : 'notice_' + Date.now();
      const payload = {
        id: id,
        title: noticeForm.title,
        banglaTitle: noticeForm.banglaTitle || '',
        category: noticeForm.category || 'Academic',
        content: noticeForm.content,
        banglaContent: noticeForm.banglaContent || '',
        publishDate: noticeForm.publishDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        isNew: true
      };

      await setDoc(doc(db, 'notices', id), payload);
      if (isNoticeEdit && editNoticeId) {
        setSuccessMessage(isBangla ? 'নোটিশ সফলভাবে সংশোধন হয়েছে!' : 'Notice compiled and updated successfully in Firestore.');
      } else {
        setSuccessMessage(isBangla ? 'নতুন নোটিশ সফলভাবে যুক্ত হয়েছে!' : 'Notice publication broadcast active on live boards.');
      }

      // Reset form
      setNoticeForm({
        title: '',
        banglaTitle: '',
        category: 'Academic',
        content: '',
        banglaContent: '',
        publishDate: ''
      });
      setIsNoticeEdit(false);
      setEditNoticeId(null);
    } catch (err: any) {
      setErrorMessage(isBangla ? 'সংরক্ষণ ব্যর্থ: ' + err.message : 'Notice execution failed: ' + err.message);
    } finally {
      setLoading(prev => ({ ...prev, notices: false }));
    }
  };

  const handleNoticeEditTrigger = (notice: Notice) => {
    setNoticeForm({
      title: notice.title,
      banglaTitle: notice.banglaTitle || '',
      category: notice.category,
      content: notice.content,
      banglaContent: notice.banglaContent || '',
      publishDate: notice.publishDate
    });
    setIsNoticeEdit(true);
    setEditNoticeId(notice.id);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleNoticeDelete = async (id: string) => {
    if (!window.confirm(isBangla ? 'নিশ্চিতভাবে এই নোটিশটি মুছতে চান?' : 'Are you sure you want to delete this notice?')) return;
    try {
      await deleteDoc(doc(db, 'notices', id));
      setSuccessMessage(isBangla ? 'নোটিশ মুছে ফেলা হয়েছে!' : 'Notice successfully expunged from rosters.');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Teacher Create/Delete
  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name || !teacherForm.designation) {
      setErrorMessage(isBangla ? 'নাম এবং পদবী আবশ্যক।' : 'Name and Designation details are mandatory fields.');
      return;
    }

    setLoading(prev => ({ ...prev, teachers: true }));
    try {
      const id = 'fac_' + Date.now();
      const payload = {
        id: id,
        name: teacherForm.name,
        banglaName: teacherForm.banglaName || teacherForm.name,
        designation: teacherForm.designation,
        banglaDesignation: teacherForm.banglaDesignation || teacherForm.designation,
        qualification: teacherForm.qualification,
        email: teacherForm.email,
        phone: teacherForm.phone || '',
        dept: teacherForm.dept,
        joiningYear: Number(teacherForm.joiningYear) || new Date().getFullYear(),
        imageUrl: teacherForm.imageUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&fit=crop'
      };

      await setDoc(doc(db, 'teachers', id), payload);
      setSuccessMessage(isBangla ? 'শিক্ষক সফলভাবে যুক্ত হয়েছেন!' : 'Teacher successfully inducted into academic faculty.');
      
      setTeacherForm({
        name: '',
        banglaName: '',
        designation: '',
        banglaDesignation: '',
        qualification: '',
        email: '',
        phone: '',
        dept: 'science',
        joiningYear: new Date().getFullYear(),
        imageUrl: ''
      });
      setTeacherPreviewUrl(null);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(prev => ({ ...prev, teachers: false }));
    }
  };

  const handleTeacherDelete = async (id: string) => {
    if (!window.confirm(isBangla ? 'আপনি কি নিশ্চিতভাবে এই শিক্ষককে অপসারণ করতে চান?' : 'Confirm removing this faculty from active roster?')) return;
    try {
      await deleteDoc(doc(db, 'teachers', id));
      setSuccessMessage(isBangla ? 'শিক্ষক সফলভাবে অপসারিত হয়েছেন।' : 'Faculty cleanly removed from academic database.');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Result Upload
  const handleResultsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedId = resultsForm.studentId.trim().toUpperCase();

    if (!normalizedId.match(/^DSMD-\d+$/)) {
      setErrorMessage(isBangla ? 'স্টুডেন্ট আইডি ফরম্যাট সঠিক নয় (যেমন: DSMD-101)' : 'Student ID must conform to syntax DSMD-XXX (e.g. DSMD-103)');
      return;
    }

    if (!resultsForm.studentName) {
      setErrorMessage(isBangla ? 'শিক্ষার্থীর নাম দিন।' : 'Student Name is required.');
      return;
    }

    setLoading(prev => ({ ...prev, results: true }));
    try {
      const docId = `${normalizedId}_${resultsForm.examType.replace(/\s+/g, '_')}`;
      
      const payload: StudentResult = {
        studentId: normalizedId,
        studentName: resultsForm.studentName,
        banglaName: resultsForm.banglaName || resultsForm.studentName,
        class: resultsForm.class,
        section: resultsForm.section,
        rollNo: Number(resultsForm.rollNo),
        examType: resultsForm.examType,
        year: Number(resultsForm.year),
        subjectsMarks: [
          { subjectName: 'Bengali', banglaSubjectName: 'বাংলা', marks: Number(resultsForm.bengali), highestMarks: Number(resultsForm.highestBengali) },
          { subjectName: 'English', banglaSubjectName: 'ইংরেজি', marks: Number(resultsForm.english), highestMarks: Number(resultsForm.highestEnglish) },
          { subjectName: 'Mathematics', banglaSubjectName: 'গণিত', marks: Number(resultsForm.mathematics), highestMarks: Number(resultsForm.highestMathematics) },
          { subjectName: 'General Science', banglaSubjectName: 'বিজ্ঞান', marks: Number(resultsForm.science), highestMarks: Number(resultsForm.highestScience) },
          { subjectName: 'ICT', banglaSubjectName: 'আইসিটি', marks: Number(resultsForm.ict), highestMarks: Number(resultsForm.highestIct) }
        ]
      };

      await setDoc(doc(db, 'results', docId), payload);
      setSuccessMessage(isBangla ? 'শিক্ষার্থীর ফলাফল সফলভাবে আপলোড হয়েছে!' : 'Marksheet published securely in student results database.');
      
      // Reset
      setResultsForm(prev => ({
        ...prev,
        studentId: '',
        studentName: '',
        banglaName: '',
        rollNo: prev.rollNo + 1
      }));
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(prev => ({ ...prev, results: false }));
    }
  };

  const handleResultDelete = async (studentId: string, examType: string) => {
    if (!window.confirm(isBangla ? 'এই শিক্ষার্থীর ফলাফলটি ডিলিট করতে চান?' : 'Remove this marksheet from live servers?')) return;
    try {
      const docId = `${studentId}_${examType.replace(/\s+/g, '_')}`;
      await deleteDoc(doc(db, 'results', docId));
      setSuccessMessage(isBangla ? 'ফলাফল মোছা হয়েছে!' : 'Student marksheet removed.');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Gallery Add/Delete
  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.imageUrl || !galleryForm.title) {
      setErrorMessage(isBangla ? 'অনগ্রহ করে একটি ছবি ফাইল এবং শিরোনাম নির্বাচন করুন।' : 'Please drag or upload an attachment image and fill in the titles.');
      return;
    }

    setLoading(prev => ({ ...prev, gallery: true }));
    try {
      const mediaId = 'media_' + Date.now();
      const payload = {
        id: mediaId,
        url: galleryForm.imageUrl,
        title: galleryForm.title,
        banglaTitle: galleryForm.banglaTitle || galleryForm.title,
        category: galleryForm.category,
        banglaCategory: galleryForm.category === 'classroom' ? 'শ্রেণীকক্ষ' : galleryForm.category === 'sports' ? 'ক্রীড়া' : galleryForm.category === 'campus' ? 'ক্যাম্পাস' : 'অনুষ্ঠান',
        description: galleryForm.description || 'Captured school activity',
        banglaDescription: galleryForm.banglaDescription || galleryForm.description || 'বিদ্যালয়ের শিক্ষণকালীন মুহূর্ত',
        date: galleryForm.date,
        banglaDate: galleryForm.banglaDate,
        resourceType: 'image',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'gallery_media', mediaId), payload);
      setSuccessMessage(isBangla ? 'গ্যালারিতে ছবি আপলোড সফল হয়েছে!' : 'Photo registered and visible in public gallery scroll.');
      
      setGalleryForm({
        title: '',
        banglaTitle: '',
        category: 'classroom',
        description: '',
        banglaDescription: '',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        banglaDate: new Date().toLocaleDateString('bn-BD'),
        imageUrl: ''
      });
      setGalleryPreviewUrl(null);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(prev => ({ ...prev, gallery: false }));
    }
  };

  const handleGalleryDelete = async (id: string) => {
    if (!window.confirm(isBangla ? 'গ্যালারি থেকে ছবিটি ডিলিট করতে চান?' : 'Confirm deleting this image resource?')) return;
    try {
      await deleteDoc(doc(db, 'gallery_media', id));
      setSuccessMessage(isBangla ? 'ছবিটি সফলভাবে মোছা হয়েছে।' : 'Gallery picture resource expunged.');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Admission Status API dispatcher (Triggering twilio and email locks)
  const handleAdmissionStatusChange = async (trackingId: string, targetStatus: 'Approved' | 'ReviewRequired' | 'Pending') => {
    setLoading(prev => ({ ...prev, admissions: true }));
    try {
      const response = await fetch(apiUrl('/api/admissions/update-status'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trackingId,
          status: targetStatus
        })
      });

      if (!response.ok) {
        throw new Error(isBangla ? 'সার্ভার রেসপন্স ত্রুটি।' : 'Backend server rejected the status update.');
      }

      const data = await response.json();
      if (data.success) {
        setSuccessMessage(
          isBangla 
            ? `আবেদন সফলভাবে ${targetStatus === 'Approved' ? 'অনুমোদিত' : 'পর্যবেক্ষণে'} নেওয়া হয়েছে! অভিভাবক বিজ্ঞপ্তি পাঠানো হয়েছে।`
            : `Admissions application transitioned to ${targetStatus}. Twilio and SMTP pipelines triggered.`
        );
        // Refresh selected
        if (selectedAdmission && selectedAdmission.trackingId === trackingId) {
          setSelectedAdmission(prev => prev ? { ...prev, status: targetStatus } : null);
        }
      } else {
        throw new Error(data.error || 'Failed update');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(prev => ({ ...prev, admissions: false }));
    }
  };

  // General Settings update
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, settings: true }));
    try {
      await setDoc(doc(db, 'settings', 'school_info'), settings);
      setSuccessMessage(isBangla ? 'বিদ্যালয়ের সাধারণ তথ্য সফলভাবে সংরক্ষিত হয়েছে!' : 'School general meta-information saved to Firestore.');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(prev => ({ ...prev, settings: false }));
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8" id="admin-panel-container">
      
      {/* Outer Banner Controller */}
      <div className="lg:col-span-12 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#f1fcf1]/80 border border-green-250 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              {isBangla ? 'ডিজিটাল অ্যাডমিন রুম' : 'Administrative Board Control'}
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant font-semibold mt-1">
            {isBangla ? 'প্যানেল কো-অর্ডিনেটর: ' : 'Admin Staff Session: '}
            <span className="text-primary font-bold">{adminUser?.displayName || 'Authorized Coordinator'}</span> | 
            email: <span className="font-mono text-slate-600">{adminUser?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBangla(!isBangla)}
            className="px-3.5 py-1.8 bg-white border border-slate-200 hover:bg-slate-50 transition-all rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <Globe className="h-4 w-4 text-primary" />
            <span>{isBangla ? 'English Language' : 'বাংলা সংস্করণ'}</span>
          </button>
          
          <button
            onClick={() => {
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-3.5 py-1.8 bg-white border border-slate-200 hover:bg-slate-50 transition-all rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span>{isBangla ? 'মূল ওয়েবসাইট' : 'Main Website'}</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-1.8 bg-red-50 hover:bg-red-150 border border-red-200 transition-all rounded-xl text-xs font-black text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>{isBangla ? 'লগআউট' : 'Logout Staff'}</span>
          </button>
        </div>
      </div>

      {/* Admin Panel Notification Board */}
      {(successMessage || errorMessage) && (
        <div className="lg:col-span-12">
          {successMessage && (
            <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold animate-fadeIn">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>{successMessage}</div>
            </div>
          )}
          {errorMessage && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold animate-fadeIn">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}
        </div>
      )}

      {/* LEFT NAVIGATION COLUMN */}
      <aside className="lg:col-span-3 space-y-2">
        <div className="bg-white border border-slate-250 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3 mb-3">
            {isBangla ? 'প্যানেল মেনু' : 'Console Sub-divisions'}
          </p>
          <nav className="space-y-1">
            <button
              onClick={() => navigate('/admin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeSection === 'dashboard'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>{isBangla ? 'ড্যাশবোর্ড' : 'System Dashboard'}</span>
            </button>

            <button
              onClick={() => navigate('/admin/notices')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeSection === 'notices'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>{isBangla ? 'নোটিশ বোর্ড' : 'Academic Notices'}</span>
            </button>

            <button
              onClick={() => navigate('/admin/teachers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeSection === 'teachers'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>{isBangla ? 'শিক্ষক মণ্ডলী' : 'Pillars & Faculty'}</span>
            </button>

            <button
              onClick={() => navigate('/admin/results')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeSection === 'results'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileCheck2 className="h-4 w-4" />
              <span>{isBangla ? 'ফলাফল আপলোডার' : 'Marksheets Manager'}</span>
            </button>

            <button
              onClick={() => navigate('/admin/gallery')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeSection === 'gallery'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span>{isBangla ? 'গ্যালারি কন্ট্রোল' : 'Gallery Stream'}</span>
            </button>

            <button
              onClick={() => navigate('/admin/admissions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeSection === 'admissions'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>{isBangla ? 'ভর্তি কার্যক্রম' : 'Admissions Board'}</span>
            </button>

            <button
              onClick={() => navigate('/admin/settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeSection === 'settings'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>{isBangla ? 'স্কুল সেটিংস' : 'General Configuration'}</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* RIGHT WORKSPACE WORK AREA */}
      <main className="lg:col-span-9 space-y-6">
        
        {/* ==========================================
            SECTION 1: DASHBOARD
            ========================================== */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Quick Overview Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div 
                onClick={() => navigate('/admin/notices')}
                className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-primary/50 transition-all cursor-pointer select-none group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-2xl font-black text-slate-800 group-hover:text-primary transition-colors">{notices.length}</span>
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><FileText className="h-4 w-4" /></div>
                </div>
                <p className="text-[11px] font-bold text-slate-500 mt-2">{isBangla ? 'স্কুল নোটিশ' : 'Total Notices'}</p>
              </div>

              <div 
                onClick={() => navigate('/admin/teachers')}
                className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-primary/50 transition-all cursor-pointer select-none group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-2xl font-black text-slate-800 group-hover:text-primary transition-colors">{teachers.length}</span>
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Users className="h-4 w-4" /></div>
                </div>
                <p className="text-[11px] font-bold text-slate-500 mt-2">{isBangla ? 'অনুমোদিত শিক্ষক' : 'Active Faculty'}</p>
              </div>

              <div 
                onClick={() => navigate('/admin/admissions')}
                className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-primary/50 transition-all cursor-pointer select-none group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-2xl font-black text-slate-800 group-hover:text-primary transition-colors">
                    {admissions.filter(a => a.status === 'Pending').length}
                  </span>
                  <div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckCircle className="h-4 w-4" /></div>
                </div>
                <p className="text-[11px] font-bold text-slate-500 mt-2">{isBangla ? 'ভর্তি পেন্ডিং' : 'Pending Approvals'}</p>
              </div>

              <div 
                onClick={() => navigate('/admin/results')}
                className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-primary/50 transition-all cursor-pointer select-none group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-2xl font-black text-slate-800 group-hover:text-primary transition-colors">{results.length}</span>
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><FileCheck2 className="h-4 w-4" /></div>
                </div>
                <p className="text-[11px] font-bold text-slate-500 mt-2">{isBangla ? 'ফলাফল আপলোডেড' : 'Digitized Marksheets'}</p>
              </div>
            </div>

            {/* Quick seeding option if collections are small */}
            {(notices.length === 0 || teachers.length === 0) && (
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-xs space-y-3">
                <h4 className="font-bold text-amber-800 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  {isBangla ? 'ডেটাবেজ সীডিং উপলব্ধ' : 'Database Seeding Recommendation'}
                </h4>
                <p className="text-amber-700 leading-relaxed font-medium">
                  {isBangla 
                    ? 'আপনার ফায়ারস্টোর ডেটাবেজে নোটিশ এবং শিক্ষক তালিকায় কোনো ডেটা পাওয়া যায়নি। আপনি নিচের বাটনে ক্লিক করে মূল ডেমো ডেটা এক ক্লিকে সিড বা ক্লাউডে লোড করতে পারেন।'
                    : 'The FireStore instances are currently unpopulated. Click below to load our standard high-fidelity mock notices and faculty directories to populate the database instantly!'
                  }
                </p>
                <button
                  onClick={async () => {
                    if (notices.length === 0) await seedNotices();
                    if (teachers.length === 0) await seedTeachers();
                    setSuccessMessage(isBangla ? 'ডেটাবেজ সফলভাবে সিড করা হয়েছে!' : 'Seeding complete! Local UI tables synchronized.');
                  }}
                  disabled={loading.seeding}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold font-mono text-[10px] uppercase cursor-pointer"
                >
                  {loading.seeding ? 'Seeding...' : 'Seed Live Mock Data'}
                </button>
              </div>
            )}

            {/* Simulated bento layout chart of grading standards or student registrations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Bento: Interactive System Activity Logs */}
              <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    {isBangla ? 'বিজ্ঞপ্তি বিতরণ লোগ' : 'SMS & Email Notification Reports'}
                  </h3>
                  <button onClick={() => navigate('/admin/admissions')} className="text-[10px] text-primary hover:underline font-bold">
                    {isBangla ? 'সকল আবেদন' : 'Audit Admissions'}
                  </button>
                </div>
                
                <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1 text-xs">
                  {deliveryLogs.length === 0 ? (
                    <p className="text-slate-400 py-6 text-center">{isBangla ? 'কোনো নোটিফিকেশন এখনও বিতরণ করা হয়নি।' : 'No notification dispatches generated yet.'}</p>
                  ) : (
                    deliveryLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="py-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{log.studentName}</span>
                          <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Class: {log.seekingClass || 'Admissions'} | Code: {log.trackingId}</span>
                          <div className="flex gap-1.5 font-mono text-[9px]">
                            <span className={log.emailStatus === 'Success' || log.emailStatus?.includes('Success') ? 'text-green-600 font-bold' : 'text-slate-400'}>
                              Email:{log.emailStatus?.includes('Success') ? 'OK' : 'OFF'}
                            </span>
                            <span className={log.smsStatus === 'Success' ? 'text-green-600 font-bold' : 'text-slate-400'}>
                              SMS:{log.smsStatus === 'Success' ? 'OK' : 'OFF'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Bento: School summary values */}
              <div className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-primary" />
                    {isBangla ? 'অ্যাডমিন অধিকার সমূহ' : 'Security Policy Overview'}
                  </h3>
                  <p className="text-[11.5px] text-on-surface-variant font-medium leading-relaxed mt-2.5">
                    {isBangla 
                      ? 'ডিজিটাল অ্যাডমিন রুমের মাধ্যমে স্কুলের সকল আপডেট সরাসরি ক্লাউড ফায়ারস্টোরে সংরক্ষিত হয়। শিক্ষক অপসারণ, ফলাফল সম্পাদন, বা ভর্তির সিদ্ধান্ত পরিবর্তনের ক্ষেত্রে অনুগ্রহ করে সর্বোচ্চ সতর্কতা অবলম্বন করুন।'
                      : 'All edits performed inside this panel synchronize instantly with our secure Google Cloud Run and Firebase instances. Changes made here apply immediately to the public pages.'
                    }
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4 text-[11px] font-bold">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-slate-400 block mb-0.5">{isBangla ? ' EIIN কোড' : 'School EIIN'}</span>
                      <span className="text-slate-800">{settings.eiin}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-slate-400 block mb-0.5">{isBangla ? 'প্রতিষ্ঠাকাল' : 'Established'}</span>
                      <span className="text-slate-800">{settings.established} AD</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 text-[10.5px] text-slate-400 text-center font-medium">
                  {isBangla ? 'নিরাপত্তা স্থিতি: এনক্রিপ্টেড (SSL/Firebase ABAC)' : 'System Security Status: Hardened Zero-Trust ABAC Active'}
                </div>
              </div>
            </div>

          </div>
        )}


        {/* ==========================================
            SECTION 2: NOTICES
            ========================================== */}
        {activeSection === 'notices' && (
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-8 animate-fadeIn">
            
            {/* Notices editor form */}
            <form onSubmit={handleNoticeSubmit} className="space-y-4">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <Edit className="h-4 w-4 text-primary" />
                <span>{isNoticeEdit ? (isBangla ? 'নোটিশ সংশোধন করুন' : 'Edit notice details') : (isBangla ? 'নতুন নোটিশ যোগ করুন' : 'Create a new notice broadcast')}</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'শিরোনাম (ইংরেজিতে)' : 'Title (English)'}</label>
                  <input
                    type="text"
                    value={noticeForm.title || ''}
                    onChange={(e) => setNoticeForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Winter Holiday Schedule Published"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'শিরোনাম (বাংলায়)' : 'Title (Bangla)'}</label>
                  <input
                    type="text"
                    value={noticeForm.banglaTitle || ''}
                    onChange={(e) => setNoticeForm(prev => ({ ...prev, banglaTitle: e.target.value }))}
                    placeholder="যেমন: শীতকালীন ছুটির নোটিশ প্রকাশ"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'বিভাগ বা ক্যাটাগরি' : 'Category'}</label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Admission">Admission</option>
                    <option value="Exam">Exam</option>
                    <option value="Holiday">Holiday</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'প্রকাশের তারিখ (ঐচ্ছিক)' : 'Publish Date (Optional)'}</label>
                  <input
                    type="text"
                    value={noticeForm.publishDate || ''}
                    onChange={(e) => setNoticeForm(prev => ({ ...prev, publishDate: e.target.value }))}
                    placeholder="e.g. 26 Dec 2026"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'বিশদ বিবরণ (ইংরেজিতে)' : 'Full Content (English)'}</label>
                  <textarea
                    rows={3}
                    value={noticeForm.content || ''}
                    onChange={(e) => setNoticeForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Describe full notice detailed rules or logs..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'বিশদ বিবরণ (বাংলায়)' : 'Full Content (Bangla)'}</label>
                  <textarea
                    rows={3}
                    value={noticeForm.banglaContent || ''}
                    onChange={(e) => setNoticeForm(prev => ({ ...prev, banglaContent: e.target.value }))}
                    placeholder="নোটিশের বাংলা বিস্তারিত বিবরণ লিখুন..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading.notices}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {loading.notices ? 'Saving...' : (isBangla ? 'সংরক্ষণ করুন' : 'Confirm Publish')}
                </button>
                {isNoticeEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNoticeEdit(false);
                      setEditNoticeId(null);
                      setNoticeForm({ title: '', banglaTitle: '', category: 'General', content: '', banglaContent: '', publishDate: '' });
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {isBangla ? 'বাতিল' : 'Cancel'}
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                {isBangla ? 'প্রকাশিত নোটিশ তালিকা' : 'Active notices listing'}
              </h4>
              
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">{isBangla ? 'তারিখ' : 'Date'}</th>
                      <th className="p-3">{isBangla ? 'শ্রেণী' : 'Category'}</th>
                      <th className="p-3">{isBangla ? 'শিরোনাম' : 'Title'}</th>
                      <th className="p-3 text-right">{isBangla ? 'পদক্ষেপ' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {notices.map((n) => (
                      <tr key={n.id} className="hover:bg-slate-50/50">
                        <td className="p-3 whitespace-nowrap font-mono">{n.publishDate}</td>
                        <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">{n.category}</span></td>
                        <td className="p-3 font-semibold">{isBangla && n.banglaTitle ? n.banglaTitle : n.title}</td>
                        <td className="p-3 text-right space-x-1 whitespace-nowrap">
                          <button onClick={() => handleNoticeEditTrigger(n)} className="p-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-bold cursor-pointer">
                            {isBangla ? 'সম্পাদনা' : 'Edit'}
                          </button>
                          <button onClick={() => handleNoticeDelete(n.id)} className="p-1 text-red-650 hover:text-red-800 cursor-pointer">
                            <Trash2 className="h-4.5 w-4.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}


        {/* ==========================================
            SECTION 3: TEACHERS / FACULTY DIRECTORY
            ========================================== */}
        {activeSection === 'teachers' && (
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-8 animate-fadeIn">
            
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <Plus className="h-4 w-4 text-primary" />
                <span>{isBangla ? 'নতুন শিক্ষক যোগ করুন' : 'Induct new faculty member'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'পূর্ণ নাম (ইংরেজিতে)' : 'Full Name (English)'}</label>
                  <input
                    type="text"
                    value={teacherForm.name}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Md. Abul Kalam"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'পূর্ণ নাম (বাংলায়)' : 'Full Name (Bangla)'}</label>
                  <input
                    type="text"
                    value={teacherForm.banglaName}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, banglaName: e.target.value }))}
                    placeholder="যেমন: মোঃ আবুল কালাম"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'পদবী (ইংরেজিতে)' : 'Designation (English)'}</label>
                  <input
                    type="text"
                    value={teacherForm.designation}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, designation: e.target.value }))}
                    placeholder="e.g. Senior Teacher (Mathematics)"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'পদবী (বাংলায়)' : 'Designation (Bangla)'}</label>
                  <input
                    type="text"
                    value={teacherForm.banglaDesignation}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, banglaDesignation: e.target.value }))}
                    placeholder="যেমন: সিনিয়র শিক্ষক (গণিত)"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'শিক্ষাগত যোগ্যতা' : 'Qualifications'}</label>
                  <input
                    type="text"
                    value={teacherForm.qualification}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, qualification: e.target.value }))}
                    placeholder="e.g. M.Sc (Mathematics), B.Ed (Hons)"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'ইমেইল অ্যাড্রেস' : 'Official Staff Email'}</label>
                  <input
                    type="email"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="staff@damagarasmdhs.edu.bd"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'বিভাগ বা অনুষদ' : 'Faculty Department'}</label>
                  <select
                    value={teacherForm.dept}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, dept: e.target.value }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  >
                    <option value="science">Science (বিজ্ঞান)</option>
                    <option value="arts">Arts (মানবিক)</option>
                    <option value="commerce">Commerce (ব্যবসায় শিক্ষা)</option>
                    <option value="general">General (সাধারণ)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'যোগদানের বছর' : 'Joining Year'}</label>
                  <input
                    type="number"
                    value={teacherForm.joiningYear}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, joiningYear: Number(e.target.value) }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                {/* Cloudinary photo file attachment */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'শিক্ষকের ছবি আপলোড করুন' : 'Photo Attachment (Cloudinary CDN)'}</label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-primary/40 p-4 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      id="teacher-photo"
                      accept="image/*"
                      onChange={(e) => handleImageFileChangeEvent(e, 'teacher')}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="h-6 w-6 text-slate-400 mb-1.5" />
                    {teacherPreviewUrl ? (
                      <div className="flex flex-col items-center gap-1.5 z-10">
                        <img src={teacherPreviewUrl} className="h-16 w-16 object-cover rounded-full border border-primary/20 shadow-sm animate-pulse" />
                        <span className="text-[10px] text-slate-500 font-bold">
                          {uploadProgress ? (isBangla ? 'আপলোড হচ্ছে...' : 'Uploading...') : (isBangla ? 'নির্বাচিত ছবি প্রিভিউ' : 'Real-time Selected Preview')}
                        </span>
                      </div>
                    ) : teacherForm.imageUrl ? (
                      <div className="flex items-center gap-2">
                        <img src={teacherForm.imageUrl} className="h-10 w-10 object-cover rounded-full" />
                        <span className="text-xs text-green-600 font-bold truncate max-w-[200px]">{teacherForm.imageUrl}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        {isBangla ? 'এখানে ক্লিক করে ছবি নির্বাচন করুন...' : 'Click to select JPG/PNG attachment...'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading.teachers}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {loading.teachers ? 'Saving...' : (isBangla ? 'শিক্ষক তালিকাভুক্ত করুন' : 'Confirm Faculty Induction')}
              </button>
            </form>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                {isBangla ? 'নিবন্ধিত শিক্ষক তালিকা' : 'Active faculty directory listings'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teachers.map((t) => (
                  <div key={t.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={t.imageUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&fit=crop'} 
                        alt={t.name}
                        className="h-12 w-12 object-cover rounded-full border shrink-0 bg-slate-200" 
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{isBangla ? t.banglaName : t.name}</h4>
                        <p className="text-[10px] text-primary font-bold uppercase">{isBangla ? t.banglaDesignation : t.designation}</p>
                        <p className="text-[10px] font-mono text-slate-400">{t.email}</p>
                      </div>
                    </div>
                    <button onClick={() => handleTeacherDelete(t.id)} className="p-1.5 text-slate-400 hover:text-red-700 cursor-pointer select-none">
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}


        {/* ==========================================
            SECTION 4: RESULTS UPLOADER
            ========================================== */}
        {activeSection === 'results' && (
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-8 animate-fadeIn">
            
            <form onSubmit={handleResultsSubmit} className="space-y-4">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <FileCheck2 className="h-4 w-4 text-primary" />
                <span>{isBangla ? 'নতুন ফলাফল আপলোড' : 'Publish Student Marksheet'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'স্টুডেন্ট আইডি (অবশ্যই DSMD-XXX)' : 'Student ID (e.g. DSMD-101)'}</label>
                  <input
                    type="text"
                    value={resultsForm.studentId}
                    onChange={(e) => setResultsForm(prev => ({ ...prev, studentId: e.target.value }))}
                    placeholder="DSMD-101"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono uppercase focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'শিক্ষার্থীর নাম (ইংরেজিতে)' : 'Student Name (English)'}</label>
                  <input
                    type="text"
                    value={resultsForm.studentName}
                    onChange={(e) => setResultsForm(prev => ({ ...prev, studentName: e.target.value }))}
                    placeholder="e.g. S. M. Tasnim"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'শিক্ষার্থীর নাম (বাংলায়)' : 'Student Name (Bangla)'}</label>
                  <input
                    type="text"
                    value={resultsForm.banglaName}
                    onChange={(e) => setResultsForm(prev => ({ ...prev, banglaName: e.target.value }))}
                    placeholder="যেমন: এস. এম. তাসনিম"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'রেজিস্টার্ড শ্রেণী' : 'Registered Class'}</label>
                  <select
                    value={resultsForm.class}
                    onChange={(e) => setResultsForm(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  >
                    <option value="Class VI">Class VI (৬ষ্ঠ)</option>
                    <option value="Class VII">Class VII (৭ম)</option>
                    <option value="Class VIII">Class VIII (৮ম)</option>
                    <option value="Class IX">Class IX (৯ম)</option>
                    <option value="Class X">Class X (১০ম)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'শিক্ষা সেকশন' : 'Section'}</label>
                  <input
                    type="text"
                    value={resultsForm.section}
                    onChange={(e) => setResultsForm(prev => ({ ...prev, section: e.target.value }))}
                    placeholder="A"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40 animate-fadeIn"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'রোল নং' : 'Class Roll No'}</label>
                  <input
                    type="number"
                    value={resultsForm.rollNo}
                    onChange={(e) => setResultsForm(prev => ({ ...prev, rollNo: Number(e.target.value) }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'পরীক্ষার নাম' : 'Examination Type'}</label>
                  <select
                    value={resultsForm.examType}
                    onChange={(e) => setResultsForm(prev => ({ ...prev, examType: e.target.value }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  >
                    <option value="Annual Examination">Annual Examination</option>
                    <option value="Half Yearly Examination">Half Yearly Examination</option>
                    <option value="First Term Evaluation">First Term Evaluation</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'রোজ ইয়ার বা বছর' : 'Academic Year'}</label>
                  <input
                    type="number"
                    value={resultsForm.year}
                    onChange={(e) => setResultsForm(prev => ({ ...prev, year: Number(e.target.value) }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>
              </div>

              {/* Sub-block of academic ratings/subject marks input rows */}
              <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-250 pb-2 mb-2">
                  {isBangla ? 'বিষয়ভিত্তিক নম্বর সমূহের বিবরণ (সর্বোচ্চ ১০০)' : 'Subject Marks Allocation Details (Max 100)'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-bold text-slate-600">
                  <div className="md:col-span-1 py-1">Subject</div>
                  <div className="md:col-span-2">Obtained Marks</div>
                  <div className="md:col-span-2">Highest Marks in Class</div>
                </div>

                {/* Bengali */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-xs">
                  <div className="font-bold text-slate-700">Bengali (বাংলা)</div>
                  <input type="number" value={resultsForm.bengali} onChange={(e) => setResultsForm(prev => ({ ...prev, bengali: Number(e.target.value) }))} className="md:col-span-2 p-2 border bg-white rounded-lg focus:outline-primary" />
                  <input type="number" value={resultsForm.highestBengali} onChange={(e) => setResultsForm(prev => ({ ...prev, highestBengali: Number(e.target.value) }))} className="md:col-span-2 p-2 border bg-white rounded-lg focus:outline-primary" />
                </div>

                {/* English */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-xs">
                  <div className="font-bold text-slate-700">English (ইংরেজি)</div>
                  <input type="number" value={resultsForm.english} onChange={(e) => setResultsForm(prev => ({ ...prev, english: Number(e.target.value) }))} className="md:col-span-2 p-2 border bg-white rounded-lg focus:outline-primary" />
                  <input type="number" value={resultsForm.highestEnglish} onChange={(e) => setResultsForm(prev => ({ ...prev, highestEnglish: Number(e.target.value) }))} className="md:col-span-2 p-2 border bg-white rounded-lg focus:outline-primary" />
                </div>

                {/* Mathematics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-xs">
                  <div className="font-bold text-slate-700">Mathematics (গণিত)</div>
                  <input type="number" value={resultsForm.mathematics} onChange={(e) => setResultsForm(prev => ({ ...prev, mathematics: Number(e.target.value) }))} className="md:col-span-2 p-2 border bg-white rounded-lg focus:outline-primary" />
                  <input type="number" value={resultsForm.highestMathematics} onChange={(e) => setResultsForm(prev => ({ ...prev, highestMathematics: Number(e.target.value) }))} className="md:col-span-2 p-2 border bg-white rounded-lg focus:outline-primary" />
                </div>

                {/* General Science */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-xs">
                  <div className="font-bold text-slate-700">Science (বিজ্ঞান)</div>
                  <input type="number" value={resultsForm.science} onChange={(e) => setResultsForm(prev => ({ ...prev, science: Number(e.target.value) }))} className="md:col-span-2 p-2 border bg-white rounded-lg focus:outline-primary" />
                  <input type="number" value={resultsForm.highestScience} onChange={(e) => setResultsForm(prev => ({ ...prev, highestScience: Number(e.target.value) }))} className="md:col-span-2 p-2 border bg-white rounded-lg focus:outline-primary" />
                </div>

                {/* ICT */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-xs">
                  <div className="font-bold text-slate-700">ICT (আইসিটি)</div>
                  <input type="number" value={resultsForm.ict} onChange={(e) => setResultsForm(prev => ({ ...prev, ict: Number(e.target.value) }))} className="md:col-span-2 p-2 border bg-white rounded-lg focus:outline-primary" />
                  <input type="number" value={resultsForm.highestIct} onChange={(e) => setResultsForm(prev => ({ ...prev, highestIct: Number(e.target.value) }))} className="md:col-span-2 p-2 border bg-white rounded-lg focus:outline-primary" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading.results}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {loading.results ? 'Uploading...' : (isBangla ? 'ফলাফল আপলোড করুন' : 'Confirm Marksheet Publish')}
              </button>
            </form>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                {isBangla ? 'আপলোডকৃত সাম্প্রতিক ফলাফল সমূহ' : 'Recently published result transcripts'}
              </h4>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 font-bold border-b border-slate-100">
                      <th className="p-3">Student ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Exam</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.length === 0 ? (
                      <tr><td colSpan={5} className="p-6 text-center text-slate-400 font-medium">No custom transcripts published to Firestore. Search DSMD-103 on results portal for instant dynamic evaluation card generation!</td></tr>
                    ) : (
                      results.map((res) => (
                        <tr key={`${res.studentId}_${res.examType}`} className="border-b hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-primary">{res.studentId}</td>
                          <td className="p-3 font-semibold">{isBangla && res.banglaName ? res.banglaName : res.studentName}</td>
                          <td className="p-3">{res.class}</td>
                          <td className="p-3">{res.examType} ({res.year})</td>
                          <td className="p-3 text-right">
                            <button onClick={() => handleResultDelete(res.studentId, res.examType)} className="text-red-600 hover:text-red-800 font-bold font-mono">Remove</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}


        {/* ==========================================
            SECTION 5: GALLERY
            ========================================== */}
        {activeSection === 'gallery' && (
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-8 animate-fadeIn">
            
            <form onSubmit={handleGallerySubmit} className="space-y-4">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <Upload className="h-4 w-4 text-primary" />
                <span>{isBangla ? 'নতুন ছবি আপলোড করুন' : 'Register new gallery snapshot'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'ছবির শিরোনাম (ইংরেজিতে)' : 'Image Title (English)'}</label>
                  <input
                    type="text"
                    value={galleryForm.title}
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Smart Classroom Interactive Session"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'ছবির শিরোনাম (বাংলায়)' : 'Image Title (Bangla)'}</label>
                  <input
                    type="text"
                    value={galleryForm.banglaTitle}
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, banglaTitle: e.target.value }))}
                    placeholder="যেমন: স্মার্ট শ্রেণীকক্ষে পাঠদান কার্যক্রম"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'ক্যাটাগরি' : 'Category'}</label>
                  <select
                    value={galleryForm.category}
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  >
                    <option value="classroom">Classroom (শ্রেণীকক্ষ)</option>
                    <option value="sports">Sports (খেলাধুলা)</option>
                    <option value="campus">Campus (বিদ্যালয় প্রাঙ্গণ)</option>
                    <option value="events">Events (অনুষ্ঠানমালা)</option>
                  </select>
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'ছবির সংক্ষিপ্ত তারিখ' : 'Snap Date'}</label>
                  <input
                    type="text"
                    value={galleryForm.date}
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'ছবির বিবরণ (ইংরেজিতে)' : 'Description (English)'}</label>
                  <input
                    type="text"
                    value={galleryForm.description}
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                {/* Cloudinary Drag/Click Uploader */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'ছবির ফাইল বেছে নিন' : 'Select Image (Uploads straight to Cloudinary)'}</label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-primary/45 p-5 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 relative cursor-pointer">
                    <input
                      type="file"
                      id="gallery-photo"
                      accept="image/*"
                      onChange={(e) => handleImageFileChangeEvent(e, 'gallery')}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="h-6 w-6 text-slate-400 mb-1.5" />
                    {galleryPreviewUrl ? (
                      <div className="flex flex-col items-center gap-1.5 z-10">
                        <img src={galleryPreviewUrl} className="h-20 w-28 object-cover rounded-xl border border-primary/20 shadow-sm animate-pulse" />
                        <span className="text-[10px] text-slate-500 font-bold">
                          {uploadProgress ? (isBangla ? 'আপলোড হচ্ছে...' : 'Uploading...') : (isBangla ? 'নির্বাচিত ছবি প্রিভিউ' : 'Real-time Selected Preview')}
                        </span>
                      </div>
                    ) : galleryForm.imageUrl ? (
                      <div className="flex items-center gap-2">
                        <img src={galleryForm.imageUrl} className="h-10 w-12 object-cover rounded-lg" />
                        <span className="text-xs text-green-600 font-bold truncate max-w-[200px]">{galleryForm.imageUrl}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-semibold">{isBangla ? 'এখানে ফাইল ড্রপ বা ক্লিক করে ফাইল আপলোড করুন' : 'Drag file here or click to run Cloudinary uploader pipeline'}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading.gallery}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {loading.gallery ? 'Publishing...' : (isBangla ? 'গ্যালারিতে যুক্ত করুন' : 'Confirm Gallery Publish')}
              </button>
            </form>

            {/* List uploaded */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                {isBangla ? 'গ্যালারির বর্তমান মিডিয়াজল' : 'Live Photos Stream'}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" id="admin-gallery-grid">
                {/* Dynamically list documents inside gallery_media collection */}
                {/* Fallback to warning if empty list */}
                <DynamicGalleryView isBangla={isBangla} onDelete={handleGalleryDelete} />
              </div>
            </div>

          </div>
        )}


        {/* ==========================================
            SECTION 6: ADMISSIONS APPLICATIONS & AUDITING
            ========================================== */}
        {activeSection === 'admissions' && (
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-6 animate-fadeIn">
            
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                <UserCheck className="h-5 w-5 text-primary" />
                <span>{isBangla ? 'ভর্তি ইভালুয়েশন বোর্ড' : 'Admissions Evaluation Dashboard'}</span>
              </h3>
              <p className="text-[11px] text-on-surface-variant font-semibold">
                {isBangla 
                  ? 'উইজেটের মাধ্যমে শিক্ষার্থীর অনলাইন ভর্তি আবেদন ইভালুয়েট করুন। অনুমোদন চেঞ্জে স্বয়ংক্রিয়ভাবে Twilio ও Google SMTP সক্রিয় হবে।' 
                  : 'Update admissions logs. Approved status automatically sends email vouchers & Twilio notifications in real-time.'}
              </p>
            </div>

            {/* Grid display layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Applications Table (Takes 7 cols) */}
              <div className="lg:col-span-7 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <div className="bg-slate-50 font-bold p-3 border-b text-slate-700">
                  {isBangla ? 'আবেদনসমূহ' : 'Submitted Candidates'}
                </div>
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {admissions.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 font-medium">No admissions applications recorded in Firestore database. Try submitting one on the Admissions tab.</div>
                  ) : (
                    admissions.map((application) => (
                      <div 
                        key={application.trackingId}
                        onClick={() => setSelectedAdmission(application)}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex justify-between items-center ${
                          selectedAdmission?.trackingId === application.trackingId ? 'bg-primary/5 border-l-4 border-primary' : ''
                        }`}
                      >
                        <div>
                          <p className="font-bold text-slate-800">{application.studentName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {application.trackingId} | Class: {application.seekingClass}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                            application.status === 'Approved' ? 'bg-green-100 text-green-700' :
                            application.status === 'ReviewRequired' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {application.status}
                          </span>
                          <p className="text-[9px] text-slate-400">{new Date(application.appliedDate).toLocaleDateString([], { day: '2-digit', month: 'short' })}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Detailed Candidate View & Auditor (Takes 5 cols) */}
              <div className="lg:col-span-5 bg-slate-50/50 border border-slate-200 rounded-2xl p-4 space-y-4">
                {selectedAdmission ? (
                  <div className="space-y-4 animate-fadeIn text-xs">
                    <div className="flex items-center gap-3">
                      <img 
                        src={selectedAdmission.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&h=200&fit=crop'} 
                        alt="Student"
                        className="h-14 w-14 object-cover rounded-xl border shrink-0 bg-white shadow-xs" 
                      />
                      <div>
                        <h4 className="font-bold text-slate-800">{selectedAdmission.studentName}</h4>
                        <p className="font-mono text-[10px] text-primary">{selectedAdmission.trackingId}</p>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-200/50 border-t border-b border-slate-200/50 py-1.5 leading-relaxed text-[11px] text-slate-700 space-y-1.5">
                      <p className="flex justify-between py-1"><span>{isBangla ? 'গ্রেড বা শ্রেণি:' : 'Seeking Class:'}</span> <strong className="font-bold text-slate-800">{selectedAdmission.seekingClass}</strong></p>
                      <p className="flex justify-between py-1"><span>{isBangla ? 'পিতার নাম:' : 'Father\'s Name:'}</span> <strong className="font-semibold text-slate-800">{selectedAdmission.fatherName}</strong></p>
                      <p className="flex justify-between py-1"><span>{isBangla ? 'পেশা:' : 'Profession:'}</span> <strong className="font-mono text-slate-500">{selectedAdmission.fatherProfession || 'N/A'}</strong></p>
                      <p className="flex justify-between py-1"><span>{isBangla ? 'মোবাইল নং:' : 'Guardian Mobile:'}</span> <strong className="font-mono text-slate-800">{selectedAdmission.mobileNumber}</strong></p>
                      <p className="flex justify-between py-1"><span>Email:</span> <strong className="font-mono text-slate-800 truncate max-w-[150px]">{selectedAdmission.email || 'N/A'}</strong></p>
                      <p className="flex justify-between py-1"><span>Permanent Address:</span> <strong className="text-slate-800 text-right truncate max-w-[130px]">{selectedAdmission.permanentAddress}</strong></p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Decision Gate Control</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleAdmissionStatusChange(selectedAdmission.trackingId, 'Approved')}
                          disabled={selectedAdmission.status === 'Approved' || loading.admissions}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-[10.5px] rounded-xl cursor-pointer"
                        >
                          {isBangla ? 'অনুমোদন দিন' : 'Approve & Notify'}
                        </button>
                        
                        <button 
                          onClick={() => handleAdmissionStatusChange(selectedAdmission.trackingId, 'ReviewRequired')}
                          disabled={selectedAdmission.status === 'ReviewRequired' || loading.admissions}
                          className="px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-[10.5px] rounded-xl cursor-pointer"
                        >
                          {isBangla ? 'পর্যবেক্ষণে রাখুন' : 'Review Required'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center font-medium">
                    <Activity className="h-8 w-8 text-slate-300 mb-2" />
                    {isBangla ? 'আবেদন সিলেক্ট করুন' : 'Select a candidate card is pending from left rows to start evaluate actions.'}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}


        {/* ==========================================
            SECTION 7: SETTINGS
            ========================================== */}
        {activeSection === 'settings' && (
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-6 animate-fadeIn">
            
            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <Settings className="h-4 w-4 text-primary" />
                <span>{isBangla ? 'স্কুলের সাধারণ তথ্য পরিচালনা' : 'General Information Settings'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'স্কুলের নাম (ইংরেজিতে)' : 'School Name (English)'}</label>
                  <input
                    type="text"
                    value={settings.schoolName}
                    onChange={(e) => setSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'স্কুলের নাম (বাংলায়)' : 'School Name (Bangla)'}</label>
                  <input
                    type="text"
                    value={settings.schoolNameBangla}
                    onChange={(e) => setSettings(prev => ({ ...prev, schoolNameBangla: e.target.value }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5 col-span-1">
                  <label className="text-xs font-bold text-slate-500">EIIN Code</label>
                  <input
                    type="text"
                    value={settings.eiin}
                    onChange={(e) => setSettings(prev => ({ ...prev, eiin: e.target.value }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40 font-mono"
                  />
                </div>

                <div className="space-y-1.5 col-span-1">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'প্রতিষ্ঠার বছর' : 'Established Year'}</label>
                  <input
                    type="text"
                    value={settings.established}
                    onChange={(e) => setSettings(prev => ({ ...prev, established: e.target.value }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'যোগাযোগ হটলাইন' : 'Primary Hotline'}</label>
                  <input
                    type="text"
                    value={settings.hotline}
                    onChange={(e) => setSettings(prev => ({ ...prev, hotline: e.target.value }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Official Web Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40 font-mono"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'ফুল ঠিকানা (ইংরেজিতে)' : 'Full Postal Address (English)'}</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500">{isBangla ? 'ফুল ঠিকানা (বাংলায়)' : 'Full Postal Address (Bangla)'}</label>
                  <input
                    type="text"
                    value={settings.addressBangla}
                    onChange={(e) => setSettings(prev => ({ ...prev, addressBangla: e.target.value }))}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-primary/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading.settings}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {loading.settings ? 'Saving...' : (isBangla ? 'সংরক্ষণ করুন' : 'Confirm Save')}
              </button>
            </form>

          </div>
        )}

      </main>

    </div>
  );
}

/**
 * Nested sub-component to handle gallery elements elegantly
 */
function DynamicGalleryView({ isBangla, onDelete }: { isBangla: boolean; onDelete: (id: string) => void }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'gallery_media'), (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setItems(list);
    });
    return unsub;
  }, []);

  if (items.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-slate-400 font-medium">
        {isBangla ? 'গ্যালারিতে কোনো ছবি ফায়ারস্টোরে পাওয়া যায়নি।' : 'No custom photos uploaded. Check public Gallery page for static assets.'}
      </div>
    );
  }

  return (
    <>
      {items.map((img) => (
        <div key={img.id} className="relative group bg-slate-50 rounded-2xl overflow-hidden border border-slate-250/50 flex flex-col justify-between">
          <img src={img.url} alt={img.title} className="h-32 w-full object-cover bg-slate-200" />
          <div className="p-3 space-y-1 text-slate-800">
            <h5 className="font-bold text-[11px] truncate leading-tight">{isBangla ? img.banglaTitle : img.title}</h5>
            <p className="text-[9px] text-slate-500 font-mono flex justify-between items-center bg-slate-150 p-1 rounded">
              <span>{img.category}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(img.id);
                }} 
                className="text-red-650 hover:text-red-800 select-none cursor-pointer"
              >
                Delete
              </button>
            </p>
          </div>
        </div>
      ))}
    </>
  );
}

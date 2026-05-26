/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  Sparkles, 
  Compass, 
  CheckCircle2,
  Lock,
  ChevronRight,
  School,
  Share2,
  Navigation,
  Search,
  Printer,
  PlusCircle,
  Briefcase,
  AlertTriangle,
  Ruler,
  Copy,
  Map as MapIcon,
  Info,
  ExternalLink,
  Check,
  X,
  FileText,
  HelpCircle,
  Car,
  Footprints,
  Bike
} from 'lucide-react';
import LeafletMap from './LeafletMap';

interface ContactViewProps {
  isBangla: boolean;
}

type MapWorkspaceTab = 'school_focus' | 'directions' | 'search_nearby' | 'measure_distance';

export default function ContactView({ isBangla }: ContactViewProps) {
  // Contact Inquiry Form State
  const [formData, setFormData] = useState({
    inquirerName: '',
    email: '',
    phoneNumber: '',
    subject: 'Admissions Queries',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Map Workspace States
  const [activeMapTab, setActiveMapTab] = useState<MapWorkspaceTab>('school_focus');
  const [directionMode, setDirectionMode] = useState<'to' | 'from'>('to');
  const [selectedHubId, setSelectedHubId] = useState<'bogra' | 'tarat_gari' | 'mokamtola' | 'shajahanpur' | 'custom'>('bogra');
  
  // Custom Directions Coordinates
  const [customLat, setCustomLat] = useState('24.8481');
  const [customLng, setCustomLng] = useState('89.3730');

  // Distance Measurement Coordinates
  const [measuredSpot, setMeasuredSpot] = useState<'mahasthangarh' | 'cantonment' | 'tari_masjid' | 'jamuna' | 'custom'>('mahasthangarh');
  const [customMeasureLat, setCustomMeasureLat] = useState('24.9608');
  const [customMeasureLng, setCustomMeasureLng] = useState('89.3414');

  // Modals Toggles
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Success Feedback triggers in Modals
  const [copied, setCopied] = useState(false);

  // School Central Coordinates
  const SCHOOL_LAT = 24.94528;
  const SCHOOL_LNG = 89.24670;

  // Transit Hub presets for directions
  const TRANSIT_HUBS = {
    bogra: {
      name: isBangla ? 'বগুড়া শহর কেন্দ্র (সাতমাথা)' : 'Bogra Town Center (Satmatha)',
      lat: 24.8481,
      lng: 89.3730,
      distanceText: '16.5 km',
      timeCar: '35 mins',
      timeBike: '22 mins',
      timeFoot: '3.3 hours',
      routes: [
        isBangla ? 'বগুড়া-রংপুর জাতীয় মহাসড়ক (N5) দিয়ে উত্তর দিকে অগ্রসর হোন।' : 'Head north on the Bogra-Rangpur Highway / N5 route.',
        isBangla ? 'মহাস্থানগড় বাইপাস পার হয়ে মেইন ফিডার সংযোগ রোডে প্রবেশ করুন।' : 'Cross the historic Mahasthangarh link bypass to reach Plain Land feeds.',
        isBangla ? 'টারাতগাড়ী বাজার মোড়ে বামে মোড় নিন এবং ৫০০ মিটার এগিয়ে যান।' : 'Turn left at the Tarat Gari bazar junction and head 500m straight ahead.',
        isBangla ? 'সৈয়দ মীনা জামে মসজিদের বিপরীতে বিদ্যালয়ের মূল ফটক দেখতে পাবেন।' : 'The school high-contrast gates are located opposite Syed Meena Jame Mosque.'
      ]
    },
    tarat_gari: {
      name: isBangla ? 'টারাতগাড়ী স্থানীয় বাজার' : 'Tarat Gari Local Bazaar',
      lat: 24.9412,
      lng: 89.2410,
      distanceText: '1.2 km',
      timeCar: '3 mins',
      timeBike: '1 mins',
      timeFoot: '12 mins',
      routes: [
        isBangla ? 'টারাতগাড়ী সেন্ট্রাল রোডের উত্তর-পূর্ব দিকে অগ্রসর হোন।' : 'Head northeast on Tarat Gari Central Road bypass lane.',
        isBangla ? 'কৃষি খামার কো-অপারেটিভ পার হয়ে স্কুল লেনে প্রবেশ করুন।' : 'Pass the local agricultural cooperative into the School sub-branch lane.',
        isBangla ? 'সামনে সোজা এগিয়ে গেলেই বিদ্যালয়ের নান্দনিক খেলার মাঠ দেখতে পাবেন।' : 'Proceed straight ahead; the beautiful campus boundary is fully visible.'
      ]
    },
    mokamtola: {
      name: isBangla ? 'মোকামতলা হাইওয়ে জংশন' : 'Mokamtola Highway Junction',
      lat: 25.0255,
      lng: 89.3742,
      distanceText: '14.8 km',
      timeCar: '28 mins',
      timeBike: '18 mins',
      timeFoot: '3 hours',
      routes: [
        isBangla ? 'মোকামতলা জংশন থেকে দক্ষিণ দিকে (বগুড়া অভিমুখী) অগ্রসর হোন।' : 'Head south from Mokamtola crossing towards southern feeds.',
        isBangla ? 'শীবগঞ্জ লিংক বাইপাস রোড দিয়ে টারাতগাড়ী সংযোগ সড়কে প্রবেশ করুন।' : 'Access Tarat Gari bypass via local Shibganj feeder roads.',
        isBangla ? 'টারাতগাড়ী বাজার সংযোগ পার হয়ে স্কুল গেটে সরাসরি পৌঁছান।' : 'Cross Tarat Gari bazaar junction to arrive directly at school block gates.'
      ]
    },
    shajahanpur: {
      name: isBangla ? 'শাহজাহানপুর বাস স্ট্যান্ড' : 'Shajahanpur Bus Stand',
      lat: 24.8016,
      lng: 89.3685,
      distanceText: '21.0 km',
      timeCar: '45 mins',
      timeBike: '28 mins',
      timeFoot: '4.5 hours',
      routes: [
        isBangla ? 'শাহজাহানপুর থেকে বগুড়া মেইন টাউন পার হয়ে উত্তর রোডে উঠুন।' : 'Drive north from Shajahanpur crossing through Bogra main roads out.',
        isBangla ? 'মহাস্থান পিলগ্রিমেজ জংশন দিয়ে টারাতগাড়ী গ্রামীণ ফিডারে প্রবেশ করুন।' : 'Turn through Mahasthangarh pilgrimage junction to Tarat Gari local feeder.',
        isBangla ? 'মসজিদ লেন পার হয়ে ৩৫০ মিটার পরেই বিদ্যালয়ের সীমানা দেয়াল।' : 'Follow the mosque lane to the primary school complex boundary wall.'
      ]
    },
    custom: {
      name: isBangla ? 'কাস্টম কো-অর্ডিনেটস' : 'Custom Geo Coordinates',
      lat: 24.94528,
      lng: 89.24670,
      distanceText: 'Dynamic',
      timeCar: 'Calculated',
      timeBike: 'Calculated',
      timeFoot: 'Calculated',
      routes: []
    }
  };

  // Landmark targets for distance measuring
  const MEASURE_PRESETS = {
    mahasthangarh: { name: isBangla ? 'মহাস্থানগড় পর্যটন কেন্দ্র' : 'Mahasthangarh Archaic Ruins', lat: 24.9608, lng: 89.3414 },
    cantonment: { name: isBangla ? 'বগুড়া সেনানিবাস' : 'Bogra Cantonment Gate', lat: 24.8197, lng: 89.3421 },
    tari_masjid: { name: isBangla ? 'সৈয়দ মীনা জ্যামে মসজিদ (৫১ মিটার)' : 'Syed Meena Jame Mosque (51m)', lat: 24.9454, lng: 89.2462 },
    jamuna: { name: isBangla ? 'সারিয়াকান্দি যমুনা রিভার ভিউ' : 'Sariakandi Jamuna River Viewport', lat: 24.8931, lng: 89.5714 },
    custom: { name: isBangla ? 'ম্যানুয়াল ইনপুট পয়েন্ট' : 'Manual Coordinates Point', lat: 24.94528, lng: 89.24670 }
  };

  // What's Here landmark presets (Campus nodes)
  const CAMPUS_LANDMARKS = [
    {
      name: isBangla ? 'মূল প্রশাসনিক ও শিক্ষা ভবন' : 'Syed Meena High Academic Block',
      coords: '24.94528, 89.24670',
      description: isBangla 
        ? 'তিন তলা বিশিষ্ট অত্যাধুনিক ক্লাসরুম কমপ্লেক্স, সমৃদ্ধ বিজ্ঞান ল্যাবরেটরি ও আইটি হাব।' 
        : 'Three-story state-of-the-art classroom core housing premium laboratories and IT facilities.'
    },
    {
      name: isBangla ? 'প্রধান ফুটবল ও ক্রীড়া ময়দান' : 'DSMD Sports Arena & Athletics Field',
      coords: '24.94560, 89.24620',
      description: isBangla 
        ? 'বাৎসরিক ক্রীড়া প্রতিযোগিতা ও ফুটবল টুর্নামেন্টের জন্য প্রশস্ত প্রাকৃতিক ঘাসের মাঠ।' 
        : 'Expansive lush natural grass arena serving school assemblies, athletics, and regional cups.'
    },
    {
      name: isBangla ? 'সৈয়দ মীনা মেমোরিয়াল বোটানিক্যাল গার্ডেন' : 'Syed Meena Memorial Botanical Sylvan',
      coords: '24.94490, 89.24710',
      description: isBangla 
        ? 'শান্ত বসার জায়গা এবং বিরল বৃক্ষ সমৃদ্ধ পরিবেশ বান্ধব পার্ক ক্যাম্পাস।' 
        : 'Eco-haven assembly space cultivating rare herbs, botanical specimens and community rest zones.'
    }
  ];

  // Search Nearby preset places around Tarat gari
  const NEARBY_PLACES = [
    { name: 'Syed Meena Jame Mosque', cat: 'Religious Spot', dist: '51 m', desc: 'Directly opposite main campus entrance.' },
    { name: 'Tarat Gari Local Village Bazaar', cat: 'Daily Market', dist: '800 m', desc: 'Fresh local farm produce, groceries and rural logistics.' },
    { name: 'Damagara Primary Healthcare Center', cat: 'Public Clinic', dist: '1.4 km', desc: 'First-aid, pediatric checkups and family welfare station.' },
    { name: 'Shibganj Rural Link Temp Station', cat: 'Transit Stop', dist: '650 m', desc: 'Available local battery rickshaws and electric auto-services.' }
  ];

  // Helper: Calculate Haversine Distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(deltaLambda / 2) *
        Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // meters
  };

  // Dynamic values derived depending on selections
  const currentHub = TRANSIT_HUBS[selectedHubId];
  const targetDirectionsLat = selectedHubId === 'custom' ? parseFloat(customLat) || SCHOOL_LAT : currentHub.lat;
  const targetDirectionsLng = selectedHubId === 'custom' ? parseFloat(customLng) || SCHOOL_LNG : currentHub.lng;

  const rawCalculatedMeters = calculateDistance(SCHOOL_LAT, SCHOOL_LNG, targetDirectionsLat, targetDirectionsLng);
  const formattedCalculatedDistance = (rawCalculatedMeters / 1000).toFixed(2) + ' km';
  const calculatedDrivingTimeUnformatted = Math.round((rawCalculatedMeters / 1000) * 2.2);
  const formattedCalculatedDrivingTime = calculatedDrivingTimeUnformatted < 1 ? '1 min' : `${calculatedDrivingTimeUnformatted} mins`;

  const measurePresetTarget = MEASURE_PRESETS[measuredSpot];
  const measureLatVal = measuredSpot === 'custom' ? parseFloat(customMeasureLat) || SCHOOL_LAT : measurePresetTarget.lat;
  const measureLngVal = measuredSpot === 'custom' ? parseFloat(customMeasureLng) || SCHOOL_LNG : measurePresetTarget.lng;
  const rawMeasureMeters = calculateDistance(SCHOOL_LAT, SCHOOL_LNG, measureLatVal, measureLngVal);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.inquirerName.trim() || !formData.message.trim()) return;
    setIsSubmitted(true);
  };

  const handleResetForm = () => {
    setFormData({
      inquirerName: '',
      email: '',
      phoneNumber: '',
      subject: 'Admissions Queries',
      message: ''
    });
    setIsSubmitted(false);
  };

  // Copy coordinates function
  const handleCopyLink = () => {
    const textToCopy = `School Coordinates: 24.94528, 89.24670 (Tarat gari, Bogra, Bangladesh). Map search URL: https://www.google.com/maps/search/?api=1&query=24.94528,89.24670`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch((err) => console.error('Failed to copy', err));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-12 animate-fadeIn" id="school-location-panel">
      
      {/* Upper Layout: Split form and Contact details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Details (Left 5-cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-primary/5 rounded-3xl p-6 md:p-8 border border-primary/10 space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-primary tracking-widest block mb-1">VISIT SCHOOL OFFICE</span>
              <h3 className="text-xl font-bold text-on-surface tracking-tight">Contact Information</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                Reach out to school coordinators during official study hours for admission registers or results queries.
              </p>
            </div>

            <div className="space-y-4">
              
              <div className="flex gap-4 items-start p-4 bg-white rounded-2xl border border-outline-variant/60 shadow-sm">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-on-surface-variant">
                  <span className="font-extrabold text-slate-800 uppercase text-[9px] block mb-0.5">School Premises Address</span>
                  Location Code: W6WW+2F9, Tarat gari, Plain Land, Post Code: 6300, Bogra, Rajshahi Division, Bangladesh.
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 bg-white rounded-2xl border border-outline-variant/60 shadow-sm">
                <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-on-surface-variant">
                  <span className="font-extrabold text-slate-800 uppercase text-[9px] block mb-0.5">Telephone Hotline</span>
                  <p className="font-mono font-bold text-slate-800">+880 1711-366659</p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 bg-white rounded-2xl border border-outline-variant/60 shadow-sm">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-on-surface-variant">
                  <span className="font-extrabold text-slate-800 uppercase text-[9px] block mb-0.5">Official email query</span>
                  <p className="font-mono font-bold text-slate-800 hover:underline">info@damagarasmdhs.edu.bd</p>
                  <p className="font-mono text-[11px] text-slate-500">admissions@damagarasmdhs.edu.bd</p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 bg-white rounded-2xl border border-outline-variant/60 shadow-sm">
                <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-on-surface-variant">
                  <span className="font-extrabold text-slate-800 uppercase text-[9px] block mb-0.5">Working hours</span>
                  Saturday to Thursday: 09:30 AM to 04:30 PM (Friday closed).
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Contact Inquiry form (Right 7-cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm">
            {isSubmitted ? (
               <div className="p-8 text-center space-y-4 animate-scaleUp">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto animate-bounce" />
                <div>
                  <h4 className="text-lg font-bold text-slate-850">{isBangla ? 'বার্তা সফলভাবে পাঠানো হয়েছে' : 'Inquiry Message Sent Successfully'}</h4>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto leading-relaxed">
                    Thank you {formData.inquirerName}. Your ticket has been registered under subject: <span className="font-semibold text-slate-800">{formData.subject}</span>. Our admission office will email you shortly.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={handleResetForm}
                    className="bg-primary text-on-primary px-6 py-2 rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider leading-none">DO YOU HAVE QUESTIONS?</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{isBangla ? 'যোগাযোগ বা প্রশ্ন করুন' : 'Submit Admissions & General Inquiry'}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant" htmlFor="inquirerName">Name <span className="text-secondary">*</span></label>
                    <input 
                      type="text"
                      id="inquirerName"
                      name="inquirerName"
                      value={formData.inquirerName}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. SAKIB HOSSAIN"
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-outline-variant rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant" htmlFor="email">Email Address</label>
                    <input 
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="parent@example.com"
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-outline-variant rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant" htmlFor="phoneNumber">Contact Phone No</label>
                    <input 
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 01712345678"
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-outline-variant rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant" htmlFor="subject">Subject Topic</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-outline-variant rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                    >
                      <option value="Admissions Queries">Admissions Queries (ভর্তি সংক্রান্ত)</option>
                      <option value="Result Correction request">Result Correction (ফলাফল সংক্রান্ত)</option>
                      <option value="Financial AID inquiry">Financial AID (বৃত্তি ও সহযোগিতা)</option>
                      <option value="Other issues/Feedback">Other issues/Feedback (অন্যান্য)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant" htmlFor="message">Message Body <span className="text-secondary">*</span></label>
                  <textarea 
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="Describe your inquiry topic in detail..."
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-outline-variant rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    className="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-primary-hover transition-all flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send Message Ticket</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE GEOGRAPHICAL WORKSPACE & ROUTE FINDER (24.94528, 89.24670)    */}
      {/* ========================================================================= */}
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 bg-[#f0fbdc] text-[#2e5e04] border border-[#d2ecb4] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full w-max">
              <Compass className="h-4 w-4 text-[#2e5e04] animate-spin-slow" />
              {isBangla ? 'ভৌগোলিক তথ্য ও রুট গাইড' : 'GEOGRAPHICAL COORDINATES & ACCESS ROUTES'}
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight leading-none font-sans">
              {isBangla ? 'বিদ্যালয়ের সঠিক লোকেশন ও যাতায়াত রুট' : 'Official School Location & Directions Desk'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Explore the exact physical coordinates <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1 py-0.5 rounded">24.94528° N, 89.24670° E</span> of Damagara Syed Meena Dimukhe High School.
            </p>
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Share or copy coordinates"
            >
              <Share2 className="h-4 w-4" />
              <span>{isBangla ? 'শেয়ার' : 'Share'}</span>
            </button>
            <button
              onClick={() => setShowPrintPreview(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Print location details"
            >
              <Printer className="h-4 w-4" />
              <span>{isBangla ? 'প্রিন্ট' : 'Print Map'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Map Workspace Area */}
        <div className="bg-white border border-outline-variant rounded-3xl overflow-hidden shadow-md grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
          
          {/* Left Panel - Workspace Tools (5-cols) */}
          <div className="lg:col-span-5 border-r border-slate-100 flex flex-col bg-slate-50/50">
            {/* Header Tabs Navigation */}
            <div className="border-b border-slate-100 text-[10px] md:text-xs overflow-x-auto">
              <div className="grid min-w-[520px] grid-cols-4 text-center sm:min-w-0">
              <button
                onClick={() => setActiveMapTab('school_focus')}
                className={`py-3.5 px-2 font-bold border-b-2 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  activeMapTab === 'school_focus' 
                    ? 'border-primary text-primary bg-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <School className="h-4.5 w-4.5" />
                <span>{isBangla ? 'স্কুল পয়েন্ট' : 'School Point'}</span>
              </button>

              <button
                onClick={() => setActiveMapTab('directions')}
                className={`py-3.5 px-2 font-bold border-b-2 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  activeMapTab === 'directions' 
                    ? 'border-primary text-primary bg-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <Navigation className="h-4.5 w-4.5" />
                <span>{isBangla ? 'দিকের রুট' : 'Directions'}</span>
              </button>

              <button
                onClick={() => setActiveMapTab('search_nearby')}
                className={`py-3.5 px-2 font-bold border-b-2 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  activeMapTab === 'search_nearby' 
                    ? 'border-primary text-primary bg-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <Search className="h-4.5 w-4.5" />
                <span>{isBangla ? 'আশেপাশে' : 'Search Nearby'}</span>
              </button>

              <button
                onClick={() => setActiveMapTab('measure_distance')}
                className={`py-3.5 px-2 font-bold border-b-2 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  activeMapTab === 'measure_distance' 
                    ? 'border-primary text-primary bg-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <Ruler className="h-4.5 w-4.5" />
                <span>{isBangla ? 'দূরত্ব মাপা' : 'Distance'}</span>
              </button>
              </div>
            </div>

            {/* Tab Workspace Panel Content */}
            <div className="p-5 flex-1 overflow-y-auto max-h-[480px]">
              
              {/* TAB 1: DIRECTIONS */}
              {activeMapTab === 'directions' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#0d631b]">
                      {isBangla ? 'রুট এবং ডিরেকশন প্ল্যানার' : 'Transit Route Planner'}
                    </h4>
                    
                    {/* Toggle: Directions TO vs FROM */}
                    <div className="bg-slate-200/60 p-1 rounded-lg flex gap-1">
                      <button
                        onClick={() => setDirectionMode('to')}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-black cursor-pointer transition-all ${
                          directionMode === 'to' ? 'bg-primary text-on-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {isBangla ? 'এখানে আসুন' : 'Directions TO'}
                      </button>
                      <button
                        onClick={() => setDirectionMode('from')}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-black cursor-pointer transition-all ${
                          directionMode === 'from' ? 'bg-primary text-on-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {isBangla ? 'এখান থেকে যান' : 'Directions FROM'}
                      </button>
                    </div>
                  </div>

                  {/* Hub Selection Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block">{isBangla ? 'প্রারম্ভিক কেন্দ্র নির্বাচন করুন:' : 'Select Starting Hub Point:'}</label>
                    <select
                      value={selectedHubId}
                      onChange={(e) => setSelectedHubId(e.target.value as any)}
                      className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/25"
                    >
                      <option value="bogra">🏢 {TRANSIT_HUBS.bogra.name} [~16 km]</option>
                      <option value="tarat_gari">🕌 {TRANSIT_HUBS.tarat_gari.name} [~1.2 km]</option>
                      <option value="mokamtola">🏫 {TRANSIT_HUBS.mokamtola.name} [~14 km]</option>
                      <option value="shajahanpur">🚌 {TRANSIT_HUBS.shajahanpur.name} [~21 km]</option>
                      <option value="custom">🗺️ {isBangla ? 'নির্ধারিত কো-অর্ডিনেট টাইপ করুন' : 'Enter Custom Coordinates Point'}</option>
                    </select>
                  </div>

                  {/* Custom coordinates manual fields */}
                  {selectedHubId === 'custom' && (
                    <div className="bg-white p-3 border border-slate-200 rounded-xl grid grid-cols-2 gap-3 animate-slideDown">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 block">{isBangla ? 'অক্ষাংশ (Latitude):' : 'Custom Latitude:'}</label>
                        <input
                          type="text"
                          value={customLat}
                          onChange={(e) => setCustomLat(e.target.value)}
                          className="w-full text-xs font-bold font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 block">{isBangla ? 'দ্রাঘিমাংশ (Longitude):' : 'Custom Longitude:'}</label>
                        <input
                          type="text"
                          value={customLng}
                          onChange={(e) => setCustomLng(e.target.value)}
                          className="w-full text-xs font-bold font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                        />
                      </div>
                    </div>
                  )}

                  {/* Summary of Distance/Time */}
                  <div className="bg-[#bbf7d0]/20 border border-[#bbf7d0]/30 rounded-2xl p-4 space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">{isBangla ? 'মোট দূরত্ব' : 'TOTAL TRANSIT DISTANCE'}</span>
                        <span className="text-sm font-black text-slate-800 font-mono">
                          {selectedHubId === 'custom' ? formattedCalculatedDistance : currentHub.distanceText}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">{isBangla ? 'রুট ধরণ' : 'TRAVEL PATH WAY'}</span>
                        <span className="text-xs font-extrabold text-[#0d631b] uppercase">Tarat gari Feeder Link</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-slate-200/50 pt-3">
                      <div className="bg-white/80 rounded-xl p-2 text-center border border-slate-100 flex flex-col items-center">
                        <Car className="h-4 w-4 text-[#0d631b] mb-1" />
                        <span className="text-[8px] text-slate-400 font-bold block">CAR DRIVE</span>
                        <span className="text-[10px] font-black text-slate-800 mt-0.5">
                          {selectedHubId === 'custom' ? formattedCalculatedDrivingTime : currentHub.timeCar}
                        </span>
                      </div>
                      <div className="bg-white/80 rounded-xl p-2 text-center border border-slate-100 flex flex-col items-center">
                        <Bike className="h-4 w-4 text-[#0d631b] mb-1" />
                        <span className="text-[8px] text-slate-400 font-bold block">BIKE MOTOR</span>
                        <span className="text-[10px] font-black text-slate-800 mt-0.5">
                          {selectedHubId === 'custom' ? currentHub.timeBike : currentHub.timeBike}
                        </span>
                      </div>
                      <div className="bg-white/80 rounded-xl p-2 text-center border border-slate-100 flex flex-col items-center">
                        <Footprints className="h-4 w-4 text-[#0d631b] mb-1" />
                        <span className="text-[8px] text-slate-400 font-bold block">WALK JOURNEY</span>
                        <span className="text-[10px] font-black text-slate-800 mt-0.5">
                          {selectedHubId === 'custom' ? currentHub.timeFoot : currentHub.timeFoot}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step by Step Navigation Instructions list */}
                  <div className="space-y-2.5">
                    <span className="text-[9px] font-extrabold text-slate-450 uppercase block tracking-wider">{isBangla ? 'রুট নির্দেশাবলী (স্টেপ বাই স্টেপ)' : 'STEP BY STEP EN-ROUTE GUIDELINES'}</span>
                    <div className="border border-slate-200/60 rounded-2xl bg-white p-3.5 divide-y divide-slate-100 text-xs text-on-surface-variant max-h-[160px] overflow-y-auto">
                      {selectedHubId === 'custom' ? (
                        <div className="py-2 flex gap-2.5 items-start">
                          <span className="bg-primary/10 text-primary w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold text-[9px] leading-none shrink-0 mt-0.5">1</span>
                          <p className="leading-relaxed">
                            {isBangla 
                              ? `কাস্টম পয়েন্ট (${customLat}, ${customLng}) থেকে ২৫.০ কিমি/ঘণ্টা গতিতে সরাসরি সরলরেখা রুট অনুসরণ করে বিদ্যালয়ের অ্যাডমিন ব্লকে পৌঁছান।`
                              : `Head from custom coordinates point (${customLat}, ${customLng}) directly towards the high school premises via the local rural arterial roads.`
                            }
                          </p>
                        </div>
                      ) : (
                        currentHub.routes.map((route: string, ind: number) => (
                          <div key={ind} className="py-2.5 first:pt-0 last:pb-0 flex gap-2.5 items-start">
                            <span className="bg-[#0d631b]/10 text-[#0d631b] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black text-[9px] leading-none shrink-0 mt-0.5">{ind + 1}</span>
                            <p className="leading-relaxed font-medium">{route}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRIMARY SCHOOL FOCUS */}
              {activeMapTab === 'school_focus' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="rounded-2xl border border-[#bbf7d0]/70 bg-[#f0fbdc] p-4 shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0d631b] text-white shadow-md">
                        <School className="h-5.5 w-5.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#2e5e04]">
                          {isBangla ? 'প্রধান লোকেশন পয়েন্ট' : 'Primary Location Point'}
                        </span>
                        <h4 className="mt-1 text-sm font-black leading-tight text-slate-900">
                          Damagara Syed Meena Dimukhe High School
                        </h4>
                        <p className="mt-1.5 text-[11px] font-semibold leading-relaxed text-slate-600">
                          {isBangla 
                            ? 'টারাতগাড়ী, শিবগঞ্জ, বগুড়া | প্রতিষ্ঠিত ১৯৬৪ খ্রি.' 
                            : 'Tarat Gari, Shibganj, Bogra | Established 1964'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/70 bg-white/80 p-3">
                        <span className="block text-[8px] font-black uppercase tracking-wider text-slate-400">{isBangla ? 'অক্ষাংশ' : 'Latitude'}</span>
                        <span className="mt-1 block font-mono text-xs font-black text-slate-850">24.94528° N</span>
                      </div>
                      <div className="rounded-xl border border-white/70 bg-white/80 p-3">
                        <span className="block text-[8px] font-black uppercase tracking-wider text-slate-400">{isBangla ? 'দ্রাঘিমাংশ' : 'Longitude'}</span>
                        <span className="mt-1 block font-mono text-xs font-black text-slate-850">89.24670° E</span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveMapTab('directions')}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0d631b] px-3 py-2 text-[11px] font-black text-white shadow-sm transition hover:bg-[#1b6d24] focus:outline-none focus:ring-2 focus:ring-[#0d631b]/25"
                      >
                        <Navigation className="h-4 w-4" />
                        <span>{isBangla ? 'রুট দেখুন' : 'Plan Route'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#0d631b]/15 bg-white px-3 py-2 text-[11px] font-black text-[#0d631b] shadow-sm transition hover:bg-[#f8fff0] focus:outline-none focus:ring-2 focus:ring-[#0d631b]/25"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span>{copied ? (isBangla ? 'কপি হয়েছে' : 'Copied') : (isBangla ? 'কপি' : 'Copy')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#0d631b]">
                        {isBangla ? 'ক্যাম্পাস পরিচিতি' : 'Campus Highlights'}
                      </h4>
                      <span className="rounded-full bg-white px-2 py-1 text-[9px] font-black text-slate-500 ring-1 ring-slate-200">
                        {CAMPUS_LANDMARKS.length} {isBangla ? 'পয়েন্ট' : 'points'}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {CAMPUS_LANDMARKS.map((land, ind) => (
                        <div key={ind} className="bg-white border border-slate-200/60 p-3 rounded-2xl transition-all shadow-xs space-y-1.5">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <span className="font-bold text-xs text-slate-800 leading-tight block">{land.name}</span>
                            <span className="w-max text-[9px] font-mono font-bold text-primary bg-slate-50 px-1.5 py-1 rounded leading-none">{land.coords}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-sans">{land.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SEARCH NEARBY */}
              {activeMapTab === 'search_nearby' && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#0d631b]">
                    {isBangla ? 'নিকটবর্তী স্থানীয় সংস্থানসমূহ' : 'Search Local Facilities'}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isBangla 
                      ? 'অধ্যয়ন প্রাঙ্গণের আশেপাশে ৫০০ মিটারের মধ্যে মানুষের প্রয়োজনীয় গন্তব্যসমূহ।' 
                      : 'Essential transit points, community mosques, and public dispensaries framing the academic perimeter.'
                    }
                  </p>

                  <div className="space-y-2.5">
                    {NEARBY_PLACES.map((place, ind) => (
                      <div key={ind} className="bg-white border border-slate-100 p-3 rounded-2xl flex justify-between items-center gap-3 shadow-xs">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-slate-800 truncate">{place.name}</span>
                            <span className="text-[9px] text-[#2e5e04] bg-[#f0fbdc] border border-[#d2ecb4] px-1.5 py-0.2 rounded-full font-black leading-none">{place.cat}</span>
                          </div>
                          <p className="text-[10px] text-slate-450 truncate font-medium">{place.desc}</p>
                        </div>
                        <span className="text-[10px] font-black text-slate-750 font-mono shrink-0 bg-slate-50 p-2 rounded-xl">{place.dist}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: MEASURE DISTANCE */}
              {activeMapTab === 'measure_distance' && (
                <div className="space-y-5 animate-fadeIn">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#0d631b]">
                    {isBangla ? 'রিয়েল-টাইম জিওডেসিক দূরত্ব ক্যালকুলেটর' : 'Geodesic Distance Measurement'}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Calculate the exact spherical point-to-point geodesic distance from the school center (<span className="font-bold font-mono">24.94528, 89.24670</span>) to any landmark!
                  </p>

                  {/* Preset Spot measure */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase block leading-none">{isBangla ? 'দূরত্ব মাপার স্পট নির্বাচন করুন:' : 'Target Geographical Landmark Point:'}</label>
                    <select
                      value={measuredSpot}
                      onChange={(e) => setMeasuredSpot(e.target.value as any)}
                      className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/25"
                    >
                      <option value="mahasthangarh">🏺 {MEASURE_PRESETS.mahasthangarh.name}</option>
                      <option value="cantonment">🛡️ {MEASURE_PRESETS.cantonment.name}</option>
                      <option value="tari_masjid">🕌 {MEASURE_PRESETS.tari_masjid.name}</option>
                      <option value="jamuna">🌊 {MEASURE_PRESETS.jamuna.name}</option>
                      <option value="custom">⚙️ {isBangla ? 'ম্যানুয়াল কো-অর্ডিনেট টাইপ করুন' : 'Provide Custom Geo Coordinates'}</option>
                    </select>
                  </div>

                  {measuredSpot === 'custom' && (
                    <div className="bg-white p-3 border border-slate-200 rounded-xl grid grid-cols-2 gap-3 animate-slideDown">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 block">Target Latitude:</label>
                        <input
                          type="text"
                          value={customMeasureLat}
                          onChange={(e) => setCustomMeasureLat(e.target.value)}
                          className="w-full text-xs font-bold font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 block font-sans">Target Longitude:</label>
                        <input
                          type="text"
                          value={customMeasureLng}
                          onChange={(e) => setCustomMeasureLng(e.target.value)}
                          className="w-full text-xs font-bold font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                        />
                      </div>
                    </div>
                  )}

                  {/* Geodesic Calculation Card output */}
                  <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 font-mono">
                    <div className="space-y-1 leading-none text-center border-b border-white/10 pb-3">
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase">{isBangla ? 'হ্যামিলটন/হাভারসাইন সরলরেখার দূরত্ব' : 'HAVERSINE SHPERICAL DISTANCE'}</span>
                      <p className="text-xl font-black text-[#5df358] mt-1">
                        {(rawMeasureMeters / 1000).toFixed(4)} km
                      </p>
                      <p className="text-[10px] text-slate-350 font-bold mt-0.5">
                        {Math.round(rawMeasureMeters).toLocaleString()} meters
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[9px] text-slate-300 font-semibold leading-relaxed">
                      <div>
                        <span className="text-[8px] text-slate-500 block">ORIGIN SCHOOL:</span>
                        <span>24.94528° N, 89.24670° E</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-slate-500 block">TARGET SPOT:</span>
                        <span className="truncate block">{measureLatVal.toFixed(5)}° N, {measureLngVal.toFixed(5)}° E</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Panel - Large Interactive Maps Canvas (7-cols) */}
          <div className="lg:col-span-7 bg-slate-100 relative min-h-[400px] select-none flex flex-col justify-between">
            
            {/* Visual Indicator of GPS validation */}
            <div className="absolute top-4 left-4 z-10 select-none flex flex-col gap-1.5">
              <span className="bg-[#0f172a] text-white py-1 px-3 rounded-lg text-[10px] font-black border border-white/10 shadow-md flex items-center gap-1.5 w-max">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping inline-block shrink-0" />
                <span>GPS LOCK ACTIVE</span>
              </span>
              <span className="bg-white text-slate-900 py-1 px-2 rounded-lg text-[9px] font-black border border-slate-200 shadow-sm w-max uppercase">
                {isBangla ? 'টারাতগাড়ী, বগুড়া' : 'Tarat gari, Bogra'}
              </span>
            </div>

            <div className="w-full h-full min-h-[440px] relative flex flex-col justify-between flex-1">
              <LeafletMap
                isBangla={isBangla}
                schoolLat={SCHOOL_LAT}
                schoolLng={SCHOOL_LNG}
                activeMapTab={activeMapTab}
                targetDirectionsLat={targetDirectionsLat}
                targetDirectionsLng={targetDirectionsLng}
                measureLatVal={measureLatVal}
                measureLngVal={measureLngVal}
                selectedHubName={currentHub ? currentHub.name : ''}
                measurePresetTargetName={measurePresetTarget ? measurePresetTarget.name : ''}
              />
            </div>

            {/* Leaflet map integration status shown below the map wrapper */}
            <div className="bg-slate-950 p-4 text-white text-[10px] border-t border-white/10 leading-relaxed font-sans shrink-0 basis-auto">
              <span className="font-bold text-emerald-400 block mb-0.5">{isBangla ? 'স্কুল লোকেশন যাচাই করা হয়েছে:' : 'Verified School Location:'}</span>
              <p>
                {isBangla 
                  ? 'বিদ্যালয় পয়েন্টটি মূল ফোকাস হিসেবে রাখা হয়েছে। প্রয়োজন হলে Directions ট্যাব থেকে রুট প্ল্যানার চালু করা যাবে।' 
                  : 'The school remains the primary map focus. The route planner is available only when the Directions tab is selected.'}
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* DIALOG DETAILS MODALS & PRINT PANELS FOR LOCATIONAL USE-CASES             */}
      {/* ========================================================================= */}
      
      {/* MODAL 1: SHARE LOCATION */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl animate-scaleUp space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="font-black text-slate-850 text-sm tracking-tight flex items-center gap-2">
                <Share2 className="h-4.5 w-4.5 text-primary" />
                <span>{isBangla ? 'স্কুল লোকেশন শেয়ার করুন' : 'Share verified coordinates'}</span>
              </h4>
              <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-on-surface-variant leading-relaxed">
              <p>{isBangla ? 'বিদ্যালয়ের গেটের সরাসরি ঠিকানা ও গুগল ম্যাপ সার্চ তথ্য অন্যের সাথে বিনিময় করুন:' : 'Share precise coordinates of Syed Meena High School gate with student families or transport drivers:'}</p>
              
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 font-mono space-y-1.5 text-[11px] text-slate-700">
                <p className="font-sans font-bold text-slate-800">{isBangla ? 'ঠিকানা কোড:' : 'Address Code:'} W6WW+2F9, Tarat gari, Bogra</p>
                <p>Coordinates: {SCHOOL_LAT}, {SCHOOL_LNG}</p>
                <p className="text-[10px] text-slate-400 select-all overflow-hidden truncate">Link: https://www.google.com/maps/search/?api=1&query={SCHOOL_LAT},{SCHOOL_LNG}</p>
              </div>

              <div className="flex justify-between items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full bg-[#f0fbdc] hover:bg-[#e1ffd4] border border-[#d2ecb4] text-[#2e5e04] font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? (isBangla ? 'কপি হয়েছে!' : 'Copied to Clipboard!') : (isBangla ? 'ক্লিপবোর্ডে কপি করুন' : 'Copy coordinates text')}</span>
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${SCHOOL_LAT},${SCHOOL_LNG}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary hover:bg-primary-hover text-on-primary font-bold px-4 py-2.5 rounded-xl transition-all block text-center shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINT ROUTE VOUCHER PREVIEW */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-100 shadow-2xl animate-scaleUp flex flex-col justify-between max-h-[90vh]">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-150 shrink-0">
              <h4 className="font-black text-slate-850 text-sm tracking-tight flex items-center gap-1.5 leading-none">
                <FileText className="h-5 w-5 text-[#0d631b]" />
                <span>{activeMapTab === 'directions' ? 'Route Voucher & Travel Sheet' : 'School Location Sheet'}</span>
              </h4>
              <button onClick={() => setShowPrintPreview(false)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X className="h-5 w-5 text-slate-450" />
              </button>
            </div>

            {/* Printable Frame Area */}
            <div className="my-5 flex-1 overflow-y-auto p-5 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl" id="school-printable-voucher">
              <div className="bg-white border-2 border-slate-950 p-6 space-y-6 rounded-xl font-sans text-xs text-slate-900 shadow-sm leading-relaxed">
                
                {/* School Letterhead */}
                <div className="text-center space-y-1.5 pb-4 border-b-2 border-[#0d631b]">
                  <h3 className="text-base font-black uppercase text-slate-950 letter-spacing-tight">DAMAGARA SYED MEENA DIMUKHE HIGH SCHOOL</h3>
                  <p className="text-[10px] text-slate-600 font-extrabold uppercase font-sans">
                    {activeMapTab === 'directions' ? 'Official Admissions Transportation Guide' : 'Official School Location Record'}
                  </p>
                  <p className="text-[9px] text-[#0d631b] font-mono leading-none">W6WW+2F9, Tarat gari, Plain Land, Bogra, Bangladesh | +880 1711-366659</p>
                </div>

                {/* Grid info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 bg-slate-50 border border-slate-205 p-3 rounded-xl leading-normal">
                    <span className="text-[8px] text-slate-400 font-extrabold block">GPS TARGET DESTINATION</span>
                    <p className="font-bold text-[10px] text-slate-950">Damagara High School Complex</p>
                    <p className="font-mono text-[9px] text-slate-700">Latitude: {SCHOOL_LAT}</p>
                    <p className="font-mono text-[9px] text-slate-700">Longitude: {SCHOOL_LNG}</p>
                  </div>
                  
                  <div className="space-y-1 bg-slate-50 border border-slate-205 p-3 rounded-xl leading-normal">
                    <span className="text-[8px] text-slate-400 font-extrabold block">
                      {activeMapTab === 'directions' ? 'TRANSIT SUMMARY' : 'SCHOOL LOCATION SUMMARY'}
                    </span>
                    {activeMapTab === 'directions' ? (
                      <>
                        <p className="font-bold text-[10px] text-slate-950">
                          {selectedHubId === 'custom' ? 'Custom Origin Point' : TRANSIT_HUBS[selectedHubId].name}
                        </p>
                        <p className="font-sans text-[9px] text-slate-700">Est. Distance: {selectedHubId === 'custom' ? formattedCalculatedDistance : currentHub.distanceText}</p>
                        <p className="font-sans text-[9px] text-slate-700">Est. Time by Car: {selectedHubId === 'custom' ? formattedCalculatedDrivingTime : currentHub.timeCar}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-[10px] text-slate-950">Primary mapped school point</p>
                        <p className="font-sans text-[9px] text-slate-700">Address: Tarat Gari, Shibganj, Bogra</p>
                        <p className="font-sans text-[9px] text-slate-700">Established: 1964</p>
                      </>
                    )}
                  </div>
                </div>

                {activeMapTab === 'directions' ? (
                  <div className="space-y-2">
                    <span className="text-[9px] font-extrabold text-[#0d631b] uppercase block tracking-wider">Step-by-Step Feeder Directions:</span>
                    <div className="space-y-1.5 pl-2 border-l-2 border-slate-400">
                      {selectedHubId === 'custom' ? (
                        <p className="font-semibold text-[9.5px]">Head directly from your specified coordinate origin. Follow secondary roads towards Tarat Gari bazar linkages.</p>
                      ) : (
                        currentHub.routes.map((route: string, ind: number) => (
                          <p key={ind} className="text-[9.5px] font-semibold"><span className="text-[#0d631b] font-black">{ind + 1}.</span> {route}</p>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-[9px] font-extrabold text-[#0d631b] uppercase block tracking-wider">Campus Location Highlights:</span>
                    <div className="space-y-1.5 pl-2 border-l-2 border-slate-400">
                      {CAMPUS_LANDMARKS.map((land, ind) => (
                        <p key={ind} className="text-[9.5px] font-semibold"><span className="text-[#0d631b] font-black">{ind + 1}.</span> {land.name} - {land.coords}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footnotes voucher confirmation barcode visualization */}
                <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-center gap-4">
                  <div className="text-[8.5px] text-slate-450 leading-relaxed">
                    <p className="font-bold">Important Instructions:</p>
                    <p>1. Use this location sheet to identify the school point accurately.</p>
                    <p>2. Report coordinate issues to info@damagarasmdhs.edu.bd.</p>
                  </div>
                  {/* barcode simulation */}
                  <div className="text-right shrink-0 select-none">
                    <div className="bg-slate-950 h-5 w-24 inline-block opacity-80" style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, #fff, #fff 1px, #000 1px, #000 3px, #fff 3px, #fff 5px, #000 5px, #000 6px)'
                    }} />
                    <span className="text-[7.5px] text-slate-400 font-mono block text-center uppercase">GEO-{SCHOOL_LAT.toString().replace('.','')}-VCH</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Print Confirmation triggers */}
            <div className="flex gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full bg-[#0d631b] hover:bg-[#15803d] text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4.5 w-4.5" />
                <span>Confirm Print / Save PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPrintPreview(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-755 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

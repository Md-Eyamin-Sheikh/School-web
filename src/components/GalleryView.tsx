/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Calendar,
  Heart,
  Trash2,
  Play
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query 
} from 'firebase/firestore';
import { db } from '../firebase';
import { SCHOOL_EVENTS } from '../data';

interface GalleryViewProps {
  isBangla: boolean;
}

interface GalleryItem {
  id: string;
  url: string;
  title: string;
  banglaTitle: string;
  category: 'classroom' | 'sports' | 'campus' | 'events';
  banglaCategory: string;
  description: string;
  banglaDescription: string;
  date: string;
  banglaDate: string;
}

// Map the core school events dynamically to match standard gallery items
const MAPPED_EVENTS: GalleryItem[] = SCHOOL_EVENTS.map(event => {
  let cat: 'classroom' | 'sports' | 'campus' | 'events' = 'events';
  let banglaCat = 'অনুষ্ঠান';

  if (event.category === 'Sports') {
    cat = 'sports';
    banglaCat = 'খেলার মাঠ';
  } else if (event.category === 'Culture' || event.category === 'Event') {
    cat = 'events';
    banglaCat = 'অনুষ্ঠান';
  }

  // Exact translation descriptions for Bangla fallback
  let banglaDesc = event.description;
  if (event.id === 'e1') {
    banglaDesc = 'আমাদের শিক্ষার্থীরা আঞ্চলিক বিজ্ঞান মেলায় প্রথম স্থান অধিকার করে অত্যন্ত চমৎকার উদ্ভাবনী প্রকল্প প্রদর্শন করেছে।';
  } else if (event.id === 'e2') {
    banglaDesc = 'আসন্ন বার্ষিক ক্রীড়া প্রতিযোগিতার জন্য শিক্ষার্থীরা প্রস্তুতি গ্রহণ করছে। হাউস নির্বাচন ও প্যারেড ড্রিল চলছে।';
  } else if (event.id === 'e3') {
    banglaDesc = 'মহান বিজয় দিবস উপলক্ষে ছাত্র-ছাত্রীদের দেশাত্মবোধক গান, নাটক ও মনোজ্ঞ নৃত্যের সমন্বয়ে সাংস্কৃতিক অনুষ্ঠান আয়োজন করা হয়েছিল।';
  }

  let banglaDate = event.date;
  if (event.id === 'e1') banglaDate = '১৮ ফেব্রুয়ারি, ২০২৬';
  else if (event.id === 'e2') banglaDate = '০৮ ফেব্রুয়ারি, ২০২৬';
  else if (event.id === 'e3') banglaDate = '১৬ ডিসেম্বর, ২০২৫';

  return {
    id: `ev-${event.id}`,
    url: event.imageUrl,
    title: event.title,
    banglaTitle: event.banglaTitle || event.title,
    category: cat,
    banglaCategory: banglaCat,
    description: event.description,
    banglaDescription: banglaDesc,
    date: event.date,
    banglaDate: banglaDate
  };
});

const BASE_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal1',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-U6uTKoYfIltNVn6ddItdV978XxCO0ayI3uzh3DpPtXMMbLnfPf6tpQfayF9fg3m5MobiqnjuB9_i5lqIxDixZugbvGqFIWpTvlpjXspCTrzeS3u6uNsA4spHWSy94ylbRYtYWMHpqrnNc_fjAc6Wm7w5aTA2FNtbsiF0Lt_6Cpb95vU4WS5qVo8fDcelKaVVU1Fr317JgBjbbBdQlhv26AZAIzphFv9my3-n42Vjt-AAXiTL9SPKcET2JLiZ_4kHZd1nNAsZFUQ',
    title: 'Quiet Study Time',
    banglaTitle: 'লাইব্রেরি ও পড়াশোনা',
    category: 'campus',
    banglaCategory: 'ক্যাম্পাস',
    description: 'Students focusing in our high-resourced academic school library during self-study slots.',
    banglaDescription: 'আমাদের উন্নত স্কুল লাইব্রেরিতে শিক্ষার্থীরা সেলফ-স্টডি স্লটের সময়ে নিবিষ্ট হয়ে পড়াশোনা করছে।',
    date: 'April 14, 2026',
    banglaDate: '১৪ এপ্রিল, ২০২৬'
  },
  {
    id: 'gal2',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqYEdR-Opi4kQEoqO7GMxAMntTKsH4f8_SkUHfgmXrGWxxrFh34Yh6BZWd9TnCfH1fIW0n38efLjnsuHoW8Saz2_Ef94Y7gjjvLpGjfr7pVwb81kh1MF2g0MqmJW0PdlR4PuZgByg09AWS_blBQUj4pfQwpamYLt7EBFi90NLFBLGoUft_o9opcgauF69vxHBRnOS74R3T7JdEI5lpHv8W6HD2IxbqrSCQu9oT01LDUR9w7wQ95m-C4gIY0y3uSLYGBmvOQyJdA18',
    title: 'Chemistry Practical Experiment',
    banglaTitle: 'রসায়ন ব্যবহারিক ল্যাব পরীক্ষা',
    category: 'classroom',
    banglaCategory: 'শ্রেণীকক্ষ',
    description: 'High school students performing complex solution reaction testing in the chemistry division.',
    banglaDescription: 'উচ্চ মাধ্যমিকের শিক্ষার্থীরা রসায়ন ল্যাবের ব্যবহারিক ক্লাসে দ্রবণ বিক্রিয়া পরীক্ষা সম্পন্ন করছে।',
    date: 'March 08, 2026',
    banglaDate: '০৮ মার্চ, ২০২৬'
  },
  {
    id: 'gal5',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkURx5dhWURlJTHual6yS0-5jg8JGkTbavkdYIYrXJWgfM_qSPEJ-1zmYuvhX5QS6vuOjiS2f_pep1p43_Erd6LbMMFLn7q3SDVIrwEBay_M1Cbbj_bleEVu3qd24Y1cE5OTVrvcqhx4T_QXN30eeVBgNoLaNZzOjv1g8F8cIHrfLQ886zc48J6W9oMw8n9CokcDgZrjoG2F4XO3uUX1nDBK7PTtnSwdPq2GsbB-7_thH7GxmbnI0wJlB1dKCqjjaeD3hdRX1AyBU',
    title: 'Interactive Smart Board Session',
    banglaTitle: 'ইন্টারেক্টিভ স্মার্ট বোর্ড পাঠদান',
    category: 'classroom',
    banglaCategory: 'শ্রেণীকক্ষ',
    description: 'Teachers utilizing advanced digital smart screens to explain complex geometric layouts and theory.',
    banglaDescription: 'শিক্ষক আধুনিক ডিজিটাল স্মার্ট স্ক্রীনের সাহায্য নিয়ে জটিল জ্যামিতির বিন্যাস ও তত্ত্ব চমৎকারভাবে ব্যাখ্যা করছেন।',
    date: 'May 10, 2026',
    banglaDate: '১০ মে, ২০২৬'
  },
  {
    id: 'gal6',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBNwWh6UtwExsJWMK_er3rTJdDxDJN2x1A4H6mtFbgnlCKIVZwFofHOujNNgturwwhm8sA9PJr_K8FNo1Nk8oXwHWmuZCQTmS6Y5h8OCD88oRQ8AqY9YTv7hMEyXkI3XDEee1hJslzM5NZkdzvairumVjXtqVc52xYi4w5aEiFUVM8j5a36iVjNGxPKAYMPHuk-ZR723GbWPfGUA8hzwPnnAOhclKfk6KHWZtQpUqm33qINW3KNwRWWvijJfln7Im7_bwZKyewUkI',
    title: 'Technology & Programming Lab Collaboration',
    banglaTitle: 'প্রযুক্তি ও কম্পিউটার প্রোগ্রামিং ল্যাব',
    category: 'campus',
    banglaCategory: 'ক্যাম্পাস',
    description: 'Students collaborating on algorithmic coding layouts during computer programming labs.',
    banglaDescription: 'কম্পিউটার সায়েন্স ল্যাবে শিক্ষার্থীরা দলগতভাবে বিভিন্ন এলগরিদম কোডিং বিন্যাস নিয়ে কাজ করছে।',
    date: 'May 22, 2026',
    banglaDate: '২২ মে, ২০২৬'
  }
];

const GALLERY_ITEMS: GalleryItem[] = [...MAPPED_EVENTS, ...BASE_GALLERY_ITEMS];

export default function GalleryView({ isBangla }: GalleryViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'classroom' | 'sports' | 'campus' | 'events'>('all');
  
  // Interactive media lists loaded dynamically from Firestore + falling back to defaults
  const [dbItems, setDbItems] = useState<GalleryItem[]>([]);
  // Lightbox modal index states
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  // Interactive user stats
  const [lovedImages, setLovedImages] = useState<Record<string, boolean>>({});
  
  // Staggered incremental loading pagination
  const [visibleCount, setVisibleCount] = useState(6);

  // Zoom control state for the lightbox
  const [zoomLevel, setZoomLevel] = useState(1);

  // Swipe variables
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Swipe gesture support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      nextImage();
    } else if (diff < -50) {
      prevImage();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Load items from Firestore
  const loadDbItems = async () => {
    try {
      const q = query(collection(db, 'gallery_media'));
      const snapshot = await getDocs(q);
      const itemsList: GalleryItem[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        itemsList.push({
          id: data.id || docSnap.id,
          firestoreId: docSnap.id,
          url: data.url,
          title: data.title,
          banglaTitle: data.banglaTitle,
          category: data.category,
          banglaCategory: data.banglaCategory,
          description: data.description,
          banglaDescription: data.banglaDescription,
          date: data.date,
          banglaDate: data.banglaDate,
          resourceType: data.resourceType || 'image',
          isUploaded: true
        } as any);
      });
      // Sort database uploads primarily first or keep custom timeline order
      setDbItems(itemsList);
    } catch (err) {
      console.error("Failed to fetch gallery media from Firestore: ", err);
    }
  };

  useEffect(() => {
    loadDbItems();
  }, []);

  // Merge custom database uploaded items ahead of the local predefined ones
  const combinedItems = [...dbItems, ...GALLERY_ITEMS];

  // Filter lists based on selection
  const filteredItems = combinedItems.filter(item => {
    if (selectedFilter === 'all') return true;
    return item.category === selectedFilter;
  });

  const displayedItems = filteredItems.slice(0, visibleCount);

  // Keyboard navigation support
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setLightboxIndex(prev => prev !== null ? (prev + 1) % displayedItems.length : null);
        setZoomLevel(1);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex(prev => prev !== null ? (prev - 1 + displayedItems.length) % displayedItems.length : null);
        setZoomLevel(1);
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, displayedItems.length]);

  // Remove media uploaded entry from Firestore
  const handleDeleteMedia = async (firestoreId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(isBangla ? 'আপনি কি নিশ্চিতভাবে এই মিডিয়া আইটেমটি স্থায়ীভাবে ডিলিট করতে চান?' : 'Are you sure you want to delete this media item permanently?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'gallery_media', firestoreId));
      loadDbItems();
      closeLightbox();
    } catch (err) {
      console.error("Failed to delete media item: ", err);
    }
  };

  // Open Lightbox
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setZoomLevel(1);
  };

  // Close Lightbox
  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  // Navigating inside current active filtered list set
  const nextImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % displayedItems.length);
    setZoomLevel(1);
  };

  const prevImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + displayedItems.length) % displayedItems.length);
    setZoomLevel(1);
  };

  // Toggle Love icon
  const toggleLove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLovedImages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const incrementCount = () => {
    setVisibleCount(prev => prev + 3);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-12 animate-fadeIn">
      
      {/* 1. Header Portion with pristine typography */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0d631b] bg-primary/10 px-3 py-1.5 rounded-full select-none">
          {isBangla ? 'ফটো এবং ভিডিও গ্যালারি' : 'Visual Highlights'}
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-primary leading-tight font-sans">
          {isBangla ? 'আমাদের প্রাতিষ্ঠানিক গ্যালারি' : 'School Gallery'}
        </h2>
        <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
          {isBangla 
            ? 'আমাদের শিক্ষার্থীদের প্রাণবন্ত পদচারণা, বার্ষিক ক্রীড়া প্রতিযোগিতা, আধুনিক কম্পিউটার ল্যাব ও প্রাতিষ্ঠানিক অর্জনের ঐতিহাসিক মুহূর্তগুলো দেখে নিন।' 
            : 'Explore high-fidelity moments of our academic journey, vibrant campus interactions, science division, and memorable honors.'
          }
        </p>
      </section>



      {/* 2. Custom Filter Category Control Pills with custom branding colors */}
      <div className="flex flex-wrap justify-center gap-3" id="gallery-filters-panel">
        {[
          { id: 'all', title: 'All Photos', banglaTitle: 'সব ছবি' },
          { id: 'campus', title: 'Campus & Library', banglaTitle: 'ক্যাম্পাস ও লাইব্রেরি' },
          { id: 'classroom', title: 'Classroom & Labs', banglaTitle: 'শ্রেণীকক্ষ ও ল্যাব' },
          { id: 'sports', title: 'Sports & Games', banglaTitle: 'খেলাধুলা' },
          { id: 'events', title: 'Events & Honors', banglaTitle: 'অনুষ্ঠান ও সম্মাননা' }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => {
              setSelectedFilter(btn.id as any);
              setVisibleCount(6); // reset pagination
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
              selectedFilter === btn.id
                ? 'bg-primary text-on-primary shadow-md scale-102'
                : 'bg-white hover:bg-[#dbf1fe] text-on-surface border border-outline-variant hover:border-primary/40'
            }`}
          >
            {isBangla ? btn.banglaTitle : btn.title}
          </button>
        ))}
      </div>

      {/* 3. The Masonry Grid Layout exact matching HTML layout and instructions */}
      {displayedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" id="school-gallery-grid">
          {displayedItems.map((item, idx) => {
            const isLoved = !!lovedImages[item.id];
            return (
              <div
                key={item.id}
                onClick={() => openLightbox(idx)}
                className="group relative bg-[#fafdfa]/70 backdrop-blur-xs border border-emerald-100/60 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(13,99,27,0.1)] hover:border-primary/30 hover:-translate-y-1.5 transition-all duration-400 cursor-pointer flex flex-col justify-between"
              >
                
                {/* Visual Cover Port */}
                <div className="relative h-60 sm:h-64 overflow-hidden bg-slate-100 shadow-inner">
                  {item.resourceType === 'video' ? (
                    <div className="w-full h-full relative">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors duration-400">
                        <div className="p-4 bg-primary text-white rounded-full shadow-lg ring-4 ring-primary/25 group-hover:scale-110 transition-transform duration-300">
                          <Play className="h-5 w-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      alt={item.title}
                      src={item.url}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                  )}
                  
                  {/* Category Pill Overlays */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 bg-white/95 backdrop-blur-md text-primary rounded-full shadow-[0px_4px_10px_rgba(0,0,0,0.06)] border border-emerald-50">
                      {isBangla ? item.banglaCategory : item.category.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Info Deck Section */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-base font-extrabold text-slate-800 tracking-tight group-hover:text-primary transition-colors leading-snug">
                      {isBangla ? item.banglaTitle : item.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">
                      {isBangla ? item.banglaDescription : item.description}
                    </p>
                  </div>

                  {/* Footer segment of card */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 text-[11px] text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5 text-slate-500 font-mono font-semibold">
                      <Calendar className="h-3.5 w-3.5 text-primary/70" />
                      <span>{isBangla ? item.banglaDate : item.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Deletion command overlay for customUploaded media records */}
                      {(item as any).isUploaded && localStorage.getItem('demo_user_role') === 'admin' && (
                        <button
                          onClick={(e) => handleDeleteMedia((item as any).firestoreId, e)}
                          className="p-2 rounded-xl backdrop-blur-md bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 hover:scale-105 transition-all cursor-pointer"
                          title={isBangla ? 'মুছে ফেলুন' : 'Delete media'}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Loved State interaction button */}
                      <button
                        onClick={(e) => toggleLove(item.id, e)}
                        className={`p-2 rounded-xl border transition-all duration-300 ${
                          isLoved 
                            ? 'bg-red-500 text-white border-red-400 hover:bg-red-600 shadow-md scale-105' 
                            : 'bg-slate-50 border-slate-200/60 text-slate-400 hover:text-red-500 hover:bg-red-50/50'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isLoved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty results state */
        <div className="p-16 text-center bg-white rounded-3xl border border-outline-variant flex flex-col items-center justify-center space-y-3">
          <ImageIcon className="h-10 w-10 text-primary/30 animate-pulse" />
          <h4 className="text-sm font-bold text-slate-800">{isBangla ? 'কোনো চিত্র বা ভিডিও খুঁজে পাওয়া যায়নি' : 'No Gallery Media Available'}</h4>
          <p className="text-xs text-on-surface-variant">{isBangla ? 'অনুগ্রহ করে অন্য কোনো বিভাগ বা ক্যাটাগরি বাছাই করুন।' : 'Try selecting another visual design filter.'}</p>
        </div>
      )}

      {/* 4. Load More Buttons if pagination matches limit */}
      {filteredItems.length > visibleCount && (
        <div className="text-center pt-2">
          <button
            onClick={incrementCount}
            className="px-8 py-3 rounded-full border-2 border-primary text-primary text-xs font-bold hover:bg-primary hover:text-on-primary transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>{isBangla ? 'আরো মিডিয়া লোড করুন' : 'Load More Media'}</span>
            <ChevronRight className="h-4 w-4 rotate-90" />
          </button>
        </div>
      )}

      {/* 5. Isolated High-Fidelity Lightbox Carousel Modal Component */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6"
            id="gallery-lightbox-modal"
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            
            {/* Top Control Bar of the Modal overlay */}
            <div 
              className="w-full flex justify-between items-center bg-slate-900/40 backdrop-blur-md px-5 py-4 rounded-3xl border border-white/10 shrink-0 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-0.5 max-w-[60%] sm:max-w-md">
                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/15">
                  {isBangla ? displayedItems[lightboxIndex].banglaCategory : displayedItems[lightboxIndex].category.toUpperCase()}
                </span>
                <h4 className="text-xs sm:text-base font-black text-white/95 truncate">
                  {isBangla ? displayedItems[lightboxIndex].banglaTitle : displayedItems[lightboxIndex].title}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom buttons - disable zoom for video player */}
                {displayedItems[lightboxIndex].resourceType !== 'video' && (
                  <div className="hidden sm:flex items-center gap-2">
                    <button 
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
                      className="p-2 text-white/80 hover:text-white bg-white/5 hover:bg-white/15 rounded-xl transition-all cursor-pointer border border-white/5"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-4.5 w-4.5" />
                    </button>
                    <button 
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                      className="p-2 text-white/80 hover:text-white bg-white/5 hover:bg-white/15 rounded-xl transition-all cursor-pointer border border-white/5"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-4.5 w-4.5" />
                    </button>
                    {zoomLevel !== 1 && (
                      <button 
                        onClick={() => setZoomLevel(1)}
                        className="px-3 py-1.5 text-[10px] text-white/90 bg-emerald-500/20 rounded-xl hover:bg-emerald-500/30 transition-all cursor-pointer border border-emerald-500/20 font-bold"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                )}
                
                {/* Close Button */}
                <button 
                  onClick={closeLightbox}
                  className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all cursor-pointer shadow-lg hover:rotate-90 duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Core Display area with navigation buttons */}
            <div className="flex-1 relative flex items-center justify-center gap-4 my-4 max-h-[64vh]">
              
              {/* Left Nav Arrow Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-2 sm:left-4 z-10 p-3 sm:p-4 bg-black/40 hover:bg-emerald-600/50 backdrop-blur-md rounded-full text-white/90 cursor-pointer transition-all hover:scale-110 active:scale-95 border border-white/10 hover:border-emerald-400/30 shrink-0"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* Expansive Image center wrapper with modern glow */}
              <div 
                className="relative max-h-full max-w-full overflow-hidden flex items-center justify-center pointer-events-auto select-none rounded-3xl bg-black/30 border border-white/10 p-2 sm:p-4 shadow-[0_0_80px_rgba(16,185,129,0.12)]"
                onClick={(e) => e.stopPropagation()}
              >
                {displayedItems[lightboxIndex].resourceType === 'video' ? (
                  <video 
                    src={displayedItems[lightboxIndex].url}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[55vh] max-w-full rounded-2xl pointer-events-auto shadow-2xl border border-white/10"
                    style={{ 
                      transform: `scale(${zoomLevel})`,
                      transition: 'transform 0.15s ease-out'
                    }}
                  />
                ) : (
                  <motion.img 
                    key={displayedItems[lightboxIndex].id}
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    alt="Active Enlarged View"
                    referrerPolicy="no-referrer"
                    src={displayedItems[lightboxIndex].url}
                    style={{ 
                      transform: `scale(${zoomLevel})`,
                      transition: 'transform 0.15s ease-out'
                    }}
                    className="max-h-[55vh] max-w-full object-contain rounded-2xl select-none pointer-events-auto shadow-2xl border border-white/5"
                  />
                )}
              </div>

              {/* Right Nav Arrow Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-2 sm:right-4 z-10 p-3 sm:p-4 bg-black/40 hover:bg-emerald-600/50 backdrop-blur-md rounded-full text-white/90 cursor-pointer transition-all hover:scale-110 active:scale-95 border border-white/10 hover:border-emerald-400/30 shrink-0"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

            </div>

            {/* Bottom Metainfo Segment of Lightbox info bar */}
            <div 
              className="w-full bg-slate-900/50 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-white/10 text-center space-y-3 shrink-0 max-w-3xl mx-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl mx-auto font-medium">
                {isBangla ? displayedItems[lightboxIndex].banglaDescription : displayedItems[lightboxIndex].description}
              </p>
              
              <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[11px] sm:text-xs text-white/60 font-semibold pt-1 border-t border-white/5">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Calendar className="h-4 w-4" />
                  <span>{isBangla ? displayedItems[lightboxIndex].banglaDate : displayedItems[lightboxIndex].date}</span>
                </span>
                <span className="hidden sm:inline text-white/20">•</span>
                <span className="bg-white/10 px-3 py-1 rounded-full text-white">
                  {isBangla ? `মিডিয়া ${lightboxIndex + 1} এর ${displayedItems.length}` : `Media ${lightboxIndex + 1} of ${displayedItems.length}`}
                </span>
                <span className="hidden sm:inline text-white/20">•</span>
                <span className="text-white/40 font-normal italic">
                  {isBangla ? 'টিপস: কিবোর্ড অ্যারো কী ব্যবহার করুন' : 'Tip: Use Left/Right Arrow keys'}
                </span>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

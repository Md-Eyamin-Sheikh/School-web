/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, School } from 'lucide-react';

interface LeafletMapProps {
  isBangla: boolean;
  schoolLat: number;
  schoolLng: number;
  activeMapTab: 'directions' | 'whats_here' | 'search_nearby' | 'measure_distance';
  targetDirectionsLat: number;
  targetDirectionsLng: number;
  measureLatVal: number;
  measureLngVal: number;
  selectedHubName: string;
  measurePresetTargetName: string;
}

export default function LeafletMap({
  isBangla,
  schoolLat,
  schoolLng,
  activeMapTab,
  targetDirectionsLat,
  targetDirectionsLng,
  measureLatVal,
  measureLngVal,
  selectedHubName,
  measurePresetTargetName
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const pathRef = useRef<L.Polyline | null>(null);
  const schoolMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    let resizeObserver: ResizeObserver | null = null;
    let orientationTimer: ReturnType<typeof setTimeout> | null = null;
    let handleOrientationChange: (() => void) | null = null;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      const map = L.map(container, {
        center: [schoolLat, schoolLng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
        zoomSnap: 0.5
      });
      mapRef.current = map;

      // Add a clean, beautiful OpenStreetMap map tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Initialize layer group for markers
      markersRef.current = L.layerGroup().addTo(map);

      map.whenReady(() => {
        setTimeout(() => map.invalidateSize(), 250);
      });

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          map.invalidateSize();
        });
        resizeObserver.observe(container);
      }

      handleOrientationChange = () => {
        if (orientationTimer) clearTimeout(orientationTimer);
        orientationTimer = setTimeout(() => map.invalidateSize(), 180);
      };

      window.addEventListener('orientationchange', handleOrientationChange);
    }

    // Cleanup function
    return () => {
      resizeObserver?.disconnect();
      if (orientationTimer) clearTimeout(orientationTimer);
      if (handleOrientationChange) {
        window.removeEventListener('orientationchange', handleOrientationChange);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
        pathRef.current = null;
        schoolMarkerRef.current = null;
      }
    };
  }, [schoolLat, schoolLng]);

  // Update map markers/polylines when inputs or tab changes
  useEffect(() => {
    const map = mapRef.current;
    const markersGroup = markersRef.current;
    if (!map || !markersGroup) return;

    // Invalidate size immediately and after a short delay to adapt to dynamic wrapper scaling
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // Clear previous markers & paths
    markersGroup.clearLayers();
    schoolMarkerRef.current = null;
    if (pathRef.current) {
      pathRef.current.remove();
      pathRef.current = null;
    }

    const isCompactViewport = window.innerWidth < 640;
    const mapPadding: L.PointTuple = isCompactViewport ? [30, 30] : [64, 64];
    const focusZoom = isCompactViewport ? 16 : 17;
    const campusZoom = isCompactViewport ? 17 : 18;

    // Custom SVG styled markers inside DivIcons to prevent asset path/loading errors
    const schoolIcon = L.divIcon({
      html: `
        <div class="school-focus-marker">
          <div class="school-focus-marker__ring"></div>
          <div class="school-focus-marker__ring school-focus-marker__ring--delay"></div>
          <div class="school-focus-marker__badge">${isBangla ? 'প্রধান স্কুল পয়েন্ট' : 'Primary school point'}</div>
          <div class="school-focus-marker__pin">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
          </div>
        </div>
      `,
      className: 'custom-leaflet-marker bg-transparent',
      iconSize: [150, 96],
      iconAnchor: [75, 62],
      popupAnchor: [0, -52],
      tooltipAnchor: [0, -60]
    });

    const targetIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-[#0284c7]/30 animate-pulse"></div>
          <div class="relative w-6 h-6 rounded-full bg-[#0284c7] border-2 border-white flex items-center justify-center shadow-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          </div>
        </div>
      `,
      className: 'custom-leaflet-marker bg-transparent',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const measureIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-[#ba1a1a]/30 animate-pulse"></div>
          <div class="relative w-6 h-6 rounded-full bg-[#ba1a1a] border-2 border-white flex items-center justify-center shadow-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3a1 1 0 0 1 0 1.4L16.7 21.3a1 1 0 0 1-1.4 0L2.7 8.7a1 1 0 0 1 0-1.4L7.3 2.7a1 1 0 0 1 1.4 0Z"/><path d="m5.5 10.5 1 1"/><path d="m7 9 1 1"/><path d="m8.5 7.5 1 1"/><path d="m10 6 1 1"/><path d="m11.5 4.5 1 1"/></svg>
          </div>
        </div>
      `,
      className: 'custom-leaflet-marker bg-transparent',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const purpleDotIcon = (titleText: string) => L.divIcon({
      html: `
        <div class="relative flex items-center justify-center group">
          <div class="relative w-5 h-5 rounded-full bg-purple-600 border border-white flex items-center justify-center shadow-md text-white font-bold text-[9px] animate-scaleUp">
            •
          </div>
        </div>
      `,
      className: 'custom-leaflet-marker bg-transparent',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const goldDotIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="relative w-5.5 h-5.5 rounded-full bg-[#6e5100] border-2 border-white flex items-center justify-center shadow-md text-[#ffdfa0] font-black text-[9px] animate-scaleUp">
            ★
          </div>
        </div>
      `,
      className: 'custom-leaflet-marker bg-transparent',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    // Central School Marker is always shown and visually prioritized.
    const campusFocusCircle = L.circle([schoolLat, schoolLng], {
      radius: activeMapTab === 'whats_here' ? 90 : 125,
      color: '#0d631b',
      weight: 2,
      opacity: 0.75,
      fillColor: '#88d982',
      fillOpacity: 0.16,
      dashArray: '8, 8'
    });
    markersGroup.addLayer(campusFocusCircle);

    const schoolMarker = L.marker([schoolLat, schoolLng], {
      icon: schoolIcon,
      zIndexOffset: 1000
    });
    schoolMarker.bindPopup(`
      <div class="school-focus-popup-content">
        <div class="school-focus-popup-content__label">${isBangla ? 'প্রধান গন্তব্য' : 'Main destination'}</div>
        <h4>Damagara Syed Meena Dimukhe High School</h4>
        <p>${isBangla ? 'প্রতিষ্ঠিত: ১৯৬৪ খ্রি. | তারাতগাড়ী, শিবগঞ্জ, বগুড়া' : 'Est. 1964 | Tarat Gari, Shibganj, Bogra'}</p>
        <p class="school-focus-popup-content__coords">24.94528° N, 89.24670° E</p>
      </div>
    `, {
      className: 'school-focus-popup',
      closeButton: false,
      maxWidth: 280
    });
    schoolMarker.bindTooltip(isBangla ? 'বিদ্যালয় কেন্দ্র' : 'School center', {
      permanent: true,
      direction: 'top',
      className: 'school-map-tooltip',
      offset: [0, -50]
    });
    markersGroup.addLayer(schoolMarker);
    schoolMarkerRef.current = schoolMarker;

    if (activeMapTab === 'directions') {
      // Directions Mode: Add secondary marker & draw routing polyline
      const targetMarker = L.marker([targetDirectionsLat, targetDirectionsLng], { icon: targetIcon });
      targetMarker.bindPopup(`
        <div class="p-2 font-sans">
          <h4 class="font-black text-sky-700 text-xs m-0">${selectedHubName}</h4>
          <p class="text-slate-500 text-[10px] m-0 mt-1">${isBangla ? 'ভ্রমণ শুরুর অবস্থান বা সংযোগ স্টেশন।' : 'Transit or designated coordinate travel point.'}</p>
        </div>
      `);
      markersGroup.addLayer(targetMarker);

      // Draw route connecting line
      const positions: [number, number][] = [
        [targetDirectionsLat, targetDirectionsLng],
        [schoolLat, schoolLng]
      ];
      const polyline = L.polyline(positions, {
        color: '#0d631b',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8'
      }).addTo(map);

      pathRef.current = polyline;

      // Adjust views to contain both positions nicely
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: mapPadding });

    } else if (activeMapTab === 'measure_distance') {
      // Geodesic Measurement Beam Mode: Add target point & draw measurement line
      const measureMarker = L.marker([measureLatVal, measureLngVal], { icon: measureIcon });
      measureMarker.bindPopup(`
        <div class="p-2 font-sans">
          <h4 class="font-black text-red-650 text-xs m-0">${measurePresetTargetName}</h4>
          <p class="text-[10px] text-slate-500 m-0 mt-1">Lat: ${measureLatVal.toFixed(5)}, Lng: ${measureLngVal.toFixed(5)}</p>
        </div>
      `);
      markersGroup.addLayer(measureMarker);

      const positions: [number, number][] = [
        [schoolLat, schoolLng],
        [measureLatVal, measureLngVal]
      ];
      const polyline = L.polyline(positions, {
        color: '#ba1a1a',
        weight: 3,
        opacity: 0.9,
        dashArray: '4, 6'
      }).addTo(map);

      pathRef.current = polyline;

      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: mapPadding });

    } else if (activeMapTab === 'whats_here') {
      // Campus Landmarks Mode: Plot 3 major campus features on the map
      const landmarks = [
        { name: isBangla ? 'মূল প্রশাসনিক ও শিক্ষা ভবন' : 'Syed Meena High Academic Block', lat: 24.94528, lng: 89.24670, desc: isBangla ? 'তিন তলা বিশিষ্ট ক্লাসরুম কমপ্লেক্স ও ল্যাব' : 'Three-story academic block & labs' },
        { name: isBangla ? 'প্রধান ফুটবল ও ক্রীড়া ময়দান' : 'DSMD Sports Arena & Athletics Field', lat: 24.94560, lng: 89.24620, desc: isBangla ? 'ক্রীড়া প্রতিযোগিতা ও অ্যাসেম্বলি গ্রাউন্ড' : 'Athletics & assembly greens' },
        { name: isBangla ? 'বোটানিক্যাল গার্ডেন' : 'Botanical Sylvan Park', lat: 24.94490, lng: 89.24710, desc: isBangla ? 'মনোরম বসার জায়গা ও বিরল উদ্ভিদ' : 'Botanical study garden and rest zones' }
      ];

      landmarks.forEach((l) => {
        // Skip adding duplicate at central coordinate if it exactly matches schoolLat
        if (l.lat === schoolLat && l.lng === schoolLng) return;

        const lmMarker = L.marker([l.lat, l.lng], { icon: goldDotIcon });
        lmMarker.bindPopup(`
          <div class="p-2 font-sans">
            <h4 class="font-bold text-[#6e5100] text-xs m-0">${l.name}</h4>
            <p class="text-slate-500 text-[10px] m-0 mt-0.5">${l.desc}</p>
          </div>
        `);
        markersGroup.addLayer(lmMarker);
      });

      // Fly to a closer view containing the campus boundaries
      map.flyTo([schoolLat, schoolLng], campusZoom, { animate: true, duration: 0.8 });
      schoolMarker.openPopup();

    } else if (activeMapTab === 'search_nearby') {
      // Nearby Places Mode: Plot points around Tarat gari
      const nearby = [
        { name: 'Syed Meena Jame Mosque', lat: 24.9454, lng: 89.2462, cat: 'Religious Spot', dist: '51 m' },
        { name: 'Tarat Gari Village Bazaar', lat: 24.9412, lng: 89.2410, cat: 'Daily Market', dist: '800 m' },
        { name: 'Primary Healthcare Center', lat: 24.9481, lng: 89.2550, cat: 'Clinic', dist: '1.4 km' },
        { name: 'Shibganj Rural Link Station', lat: 24.9421, lng: 89.2520, cat: 'Transit', dist: '650 m' }
      ];

      nearby.forEach((p) => {
        const nbMarker = L.marker([p.lat, p.lng], { icon: purpleDotIcon(p.name) });
        nbMarker.bindPopup(`
          <div class="p-2 font-sans">
            <h4 class="font-bold text-purple-700 text-xs m-0">${p.name}</h4>
            <p class="text-[10px] text-slate-500 m-0 mt-0.5">${p.cat} &bull; Dist: ${p.dist}</p>
          </div>
        `);
        markersGroup.addLayer(nbMarker);
      });

      // Show nearby area zoom
      map.flyTo([schoolLat, schoolLng], isCompactViewport ? 14.5 : 15, { animate: true, duration: 0.8 });
    } else {
      // Focus school directly
      map.flyTo([schoolLat, schoolLng], focusZoom, { animate: true, duration: 0.8 });
      schoolMarker.openPopup();
    }

    return () => {
      clearTimeout(timer);
    };

  }, [
    schoolLat,
    schoolLng,
    activeMapTab,
    targetDirectionsLat,
    targetDirectionsLng,
    measureLatVal,
    measureLngVal,
    selectedHubName,
    measurePresetTargetName,
    isBangla
  ]);

  const focusSchool = () => {
    const map = mapRef.current;
    if (!map) return;

    const zoom = window.innerWidth < 640 ? 16 : 17;
    map.flyTo([schoolLat, schoolLng], zoom, { animate: true, duration: 0.8 });
    schoolMarkerRef.current?.openPopup();
  };

  return (
    <div className="w-full h-[clamp(360px,58vh,640px)] lg:h-full min-h-[360px] sm:min-h-[440px] lg:min-h-[520px] relative rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none border-t lg:border-t-0 lg:border-l border-outline-variant overflow-hidden shadow-inner bg-slate-100">
      <div 
        ref={mapContainerRef} 
        aria-label={isBangla ? 'বিদ্যালয়ের ইন্টারেক্টিভ লোকেশন ম্যাপ' : 'Interactive school location map'}
        className="absolute inset-0 z-0"
      />

      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[400] flex justify-center sm:justify-end">
        <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/70 bg-white/95 p-3 shadow-xl backdrop-blur-md sm:w-auto">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0d631b] text-white shadow-md">
              <School className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[9px] font-black uppercase tracking-wider text-[#0d631b]">
                {isBangla ? 'প্রাথমিক ম্যাপ পয়েন্ট' : 'Primary map point'}
              </span>
              <strong className="block truncate text-xs font-black leading-tight text-slate-900">
                Damagara Syed Meena Dimukhe High School
              </strong>
              <span className="mt-1 block font-mono text-[10px] font-bold text-slate-500">
                24.94528, 89.24670
              </span>
            </div>
            <button
              type="button"
              onClick={focusSchool}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#0d631b]/15 bg-[#f0fbdc] text-[#0d631b] transition hover:bg-[#dff4bf] focus:outline-none focus:ring-2 focus:ring-[#0d631b]/25"
              aria-label={isBangla ? 'বিদ্যালয় পয়েন্টে ফিরুন' : 'Center map on the school'}
              title={isBangla ? 'বিদ্যালয় পয়েন্টে ফিরুন' : 'Center on school'}
            >
              <Crosshair className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

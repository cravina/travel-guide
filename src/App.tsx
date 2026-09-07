import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Edit3,
  AlertTriangle,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  X,
  Car,
  Footprints,
  Bike,
  Plane,
  Camera,
  Coffee,
  Lock,
  Layers,
  List,
  BarChart2,
  Sparkles,
  Settings,
  RotateCcw,
  Check,
  RefreshCw,
  Trash2,
  FileSpreadsheet,
  LucideIcon
} from 'lucide-react';

// Types & Interfaces
export type TransitMode = 'drive' | 'hike' | 'bike' | 'fly';
export type ActivityType = 'lodging' | 'sightseeing' | 'hiking' | 'food' | 'driving';
export type HardTimeOption = 'none' | 'arrival' | 'departure';

export interface ItineraryItem {
  id: string;
  date: string;
  destination: string;
  address: string;
  arrivalTime: string;
  departTime: string;
  travelMinutes: number;
  travelMode: TransitMode;
  activityType: ActivityType;
  notes: string;
  insights: string[];
  tags: string[];
  image: string;
  hardTime: HardTimeOption;
  timeSpentMinutes?: number;
  timeError?: string | null;
  lat?: number;
  lng?: number;
}

export interface TransitMeta {
  id: TransitMode;
  label: string;
  title: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  badgeBg: string;
}

export interface ActivityMeta {
  label: string;
  icon: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  bgSoft: string;
  iconColor: string;
  stayBarColor: string;
  travelBarColor: string;
}

export interface SunData {
  label: string;
  sunrise: string;
  sunset: string;
  sunriseMin: number;
  sunsetMin: number;
}

export interface ScheduleConflict {
  itemA: ItineraryItem;
  itemB: ItineraryItem;
  overlapMinutes: number;
}

export interface AppSettings {
  preferImagesInCards: boolean;
  cascadeDownstream: boolean;
  showSunriseSunset: boolean;
  showLiveTimeline: boolean;
}

export interface SyncFeedback {
  type: 'success' | 'error' | 'info';
  message: string;
}

// Storage Keys
const ITINERARY_STORAGE_KEY = 'trailsync_itinerary_data_v2';
const SETTINGS_STORAGE_KEY = 'trailsync_settings_data_v2';
const SHEET_URL_STORAGE_KEY = 'trailsync_sheet_url_v2';

// Bed SVG Icon for lodging
const BedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </svg>
);

// Transit Mode Helper
const getTransitMeta = (mode: TransitMode = 'drive'): TransitMeta => {
  switch (mode) {
    case 'hike':
      return {
        id: 'hike',
        label: 'hike',
        title: 'Hike / Walk',
        icon: Footprints,
        color: 'text-emerald-700',
        bg: 'bg-emerald-50 border-emerald-200',
        badgeBg: 'bg-emerald-100 text-emerald-800',
      };
    case 'bike':
      return {
        id: 'bike',
        label: 'bike',
        title: 'Bike / Cycle',
        icon: Bike,
        color: 'text-sky-700',
        bg: 'bg-sky-50 border-sky-200',
        badgeBg: 'bg-sky-100 text-sky-800',
      };
    case 'fly':
      return {
        id: 'fly',
        label: 'flight',
        title: 'Flight',
        icon: Plane,
        color: 'text-indigo-700',
        bg: 'bg-indigo-50 border-indigo-200',
        badgeBg: 'bg-indigo-100 text-indigo-800',
      };
    case 'drive':
    default:
      return {
        id: 'drive',
        label: 'drive',
        title: 'Drive',
        icon: Car,
        color: 'text-[#234E42]',
        bg: 'bg-[#EBF4EE] border-[#234E42]/20',
        badgeBg: 'bg-slate-100 text-slate-800',
      };
  }
};

const INITIAL_DATA: ItineraryItem[] = [
  // Day 1: Fri Sep 18 (Flight & Arrival)
  {
    id: 'stop-day1-1',
    date: '2026-09-18',
    destination: 'Home',
    address: 'Palm Bay, FL',
    arrivalTime: '07:00',
    departTime: '09:00',
    travelMinutes: 0,
    travelMode: 'drive',
    activityType: 'sightseeing',
    notes: 'Depart home in Palm Bay; drive to Park N Go Orlando.',
    insights: ['Allow buffer for morning highway traffic'],
    tags: ['Departure', 'Prep'],
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80',
    hardTime: 'departure',
    timeSpentMinutes: 120,
  },
  {
    id: 'stop-day1-2',
    date: '2026-09-18',
    destination: 'Park N Go Orlando',
    address: '6100 S Semoran Blvd, Orlando, FL 32822',
    arrivalTime: '10:10',
    departTime: '10:30',
    travelMinutes: 70, // 1:10
    travelMode: 'drive',
    activityType: 'sightseeing',
    notes: 'Drop off car at Park N Go Orlando & take shuttle to MCO.',
    insights: ['Shuttle runs every 5–7 minutes to Terminal A'],
    tags: ['Parking', 'Shuttle'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    hardTime: 'arrival',
    timeSpentMinutes: 20,
  },
  {
    id: 'stop-day1-3',
    date: '2026-09-18',
    destination: 'MCO Terminal A',
    address: 'Orlando International Airport (MCO)',
    arrivalTime: '10:45',
    departTime: '11:45',
    travelMinutes: 15,
    travelMode: 'drive',
    activityType: 'sightseeing',
    notes: 'Terminal Check-in & TSA Security Screening.',
    insights: ['TSA PreCheck line available at West Checkpoint'],
    tags: ['Airport', 'TSA'],
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80',
    hardTime: 'none',
    timeSpentMinutes: 60,
  },
  {
    id: 'stop-day1-4',
    date: '2026-09-18',
    destination: 'Frontier Gate',
    address: 'MCO Concourse Gate',
    arrivalTime: '12:00',
    departTime: '13:28',
    travelMinutes: 15,
    travelMode: 'driving',
    activityType: 'driving',
    notes: 'Frontier flight boarding area.',
    insights: ['Gate closes 15 minutes prior to departure'],
    tags: ['Boarding', 'Gate'],
    image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=400&q=80',
    hardTime: 'none',
    timeSpentMinutes: 88,
  },
  {
    id: 'stop-day1-5',
    date: '2026-09-18',
    destination: 'Denver International Airport',
    address: '8500 Peña Blvd, Denver, CO 80249',
    arrivalTime: '15:52',
    departTime: '16:12',
    travelMinutes: 144, // 2:24 (4hr flight minus 2hr EDT->MDT offset)
    travelMode: 'fly',
    activityType: 'driving',
    notes: 'Flight is 4+hours. Now in MDT. Pick up rental vehicle at concourse shuttle.',
    insights: ['Pick up rental vehicle at concourse shuttle', 'Elevation 5,430 ft'],
    tags: ['Arrival', 'MDT'],
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    hardTime: 'arrival',
    timeSpentMinutes: 20,
  },
  // Day 2: Wed Sep 23 (Mountain Highlights)
  {
    id: 'stop-1',
    date: '2026-09-23',
    destination: 'The Bivvi Hostel Telluride',
    address: 'Telluride, CO',
    arrivalTime: '07:00',
    departTime: '07:05',
    travelMinutes: 0,
    travelMode: 'drive',
    activityType: 'lodging',
    notes: 'Sunrise 6:23 AM. Check out, load vehicle, depart east via CO-62.',
    insights: [
      'Expedited self-checkout available at front kiosk',
      'Fill up water bottles with filtered mountain spring tap',
      'CO-62 can have morning black ice on north-facing curves'
    ],
    tags: ['Lodging', 'Check Out', 'Prep'],
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80',
    hardTime: 'departure',
    timeSpentMinutes: 5,
  },
  {
    id: 'stop-2',
    date: '2026-09-23',
    destination: 'Dallas Divide Summit Overlook',
    address: 'CO-62, Telluride, CO',
    arrivalTime: '07:23',
    departTime: '07:33',
    travelMinutes: 18,
    travelMode: 'drive',
    activityType: 'sightseeing',
    notes: 'Classic panoramic photo stop; view Mount Sneffels range and golden fall aspens.',
    insights: [
      'Prime golden morning light hits Mount Sneffels (7:00–9:00 AM)',
      'Designated paved pullout with room for 15 vehicles',
      'Overlook is 0.2 miles from parking area on level path'
    ],
    tags: ['Scenic View', 'Photo Stop', 'Roadside'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    hardTime: 'arrival',
    timeSpentMinutes: 10,
  },
  {
    id: 'stop-3',
    date: '2026-09-23',
    destination: 'Historic Main Street (Ouray)',
    address: 'Main St, Ouray, CO',
    arrivalTime: '08:01',
    departTime: '08:40',
    travelMinutes: 28,
    travelMode: 'drive',
    activityType: 'food',
    notes: 'Stroll Victorian district; grab morning coffee and artisan pastries.',
    insights: [
      'Artisan Bakery & Roaster opens early at 7:00 AM',
      'Public restrooms behind the Historic Wright Opera House',
      'Free 2-hour diagonal parking along Main Street'
    ],
    tags: ['Breakfast', 'Victorian Town', 'Coffee'],
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80',
    hardTime: 'none',
    timeSpentMinutes: 39,
  },
  {
    id: 'stop-4',
    date: '2026-09-23',
    destination: 'Box Cañon Falls Park',
    address: 'Box Canyon Rd, Ouray, CO',
    arrivalTime: '08:45',
    departTime: '09:45',
    travelMinutes: 5,
    travelMode: 'drive',
    activityType: 'hiking',
    notes: 'Walk suspended metal walkway into 285-ft canyon waterfall; High Bridge overlook.',
    insights: [
      'Suspended metal walkway can be wet and slippery near spray',
      'Park admission is $7/adult (card accepted at visitor center)',
      'High Bridge trail gains 200ft in 0.5 miles for panoramic gorge view'
    ],
    tags: ['Waterfall', 'Suspended Walkway', 'Gorge'],
    image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=400&q=80',
    hardTime: 'arrival',
    timeSpentMinutes: 60,
  },
  {
    id: 'stop-5',
    date: '2026-09-23',
    destination: 'Cascade Falls Park',
    address: '8th Ave & 5th St, Ouray, CO',
    arrivalTime: '09:50',
    departTime: '10:30',
    travelMinutes: 5,
    travelMode: 'hike',
    activityType: 'hiking',
    notes: 'Short 0.2-mile trail to base of 200-ft falls plunging down red rock amphitheater.',
    insights: [
      'Short 10-minute incline scramble to reach the lower pool',
      'Free neighborhood parking with 12 shaded spots',
      'Vibrant red rock canyon walls contrast brilliantly with fall foliage'
    ],
    tags: ['Waterfall', 'Short Trail', 'Red Rocks'],
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80',
    hardTime: 'none',
    timeSpentMinutes: 40,
  }
];

const DEFAULT_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRnbvJS7yfpExgR8hWefk4FJWaeRyh52q03uZs7hopOvFnsJoveg8O_FUYPABojI9Fn0bjRSySwdoyY/pub?gid=1559519314&single=true&output=csv';

const KNOWN_SUN_DATA: Record<string, SunData> = {
  '2026-09-07': { label: 'Mon, Sep 7', sunrise: '7:03 AM', sunset: '7:36 PM', sunriseMin: 380, sunsetMin: 1153 },
  '2026-09-18': { label: 'Fri, Sep 18', sunrise: '6:20 AM', sunset: '7:13 PM', sunriseMin: 380, sunsetMin: 1153 },
  '2026-09-19': { label: 'Sat, Sep 19', sunrise: '6:21 AM', sunset: '7:11 PM', sunriseMin: 381, sunsetMin: 1151 },
  '2026-09-20': { label: 'Sun, Sep 20', sunrise: '6:22 AM', sunset: '7:10 PM', sunriseMin: 382, sunsetMin: 1150 },
  '2026-09-21': { label: 'Mon, Sep 21', sunrise: '6:22 AM', sunset: '7:08 PM', sunriseMin: 382, sunsetMin: 1148 },
  '2026-09-22': { label: 'Tue, Sep 22', sunrise: '6:23 AM', sunset: '7:07 PM', sunriseMin: 383, sunsetMin: 1147 },
  '2026-09-23': { label: 'Wed, Sep 23', sunrise: '6:23 AM', sunset: '7:08 PM', sunriseMin: 383, sunsetMin: 1148 },
  '2026-09-24': { label: 'Thu, Sep 24', sunrise: '6:24 AM', sunset: '7:06 PM', sunriseMin: 384, sunsetMin: 1146 },
  '2026-09-25': { label: 'Fri, Sep 25', sunrise: '6:25 AM', sunset: '7:05 PM', sunriseMin: 385, sunsetMin: 1145 },
};

// Safe time-to-minutes converter supporting both "10:10 AM" and "10:10"
const toMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const s = String(timeStr).trim();
  const ampmMatch = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (ampmMatch) {
    const [, hourRaw = '0', minRaw = '0', ampmRaw = ''] = ampmMatch;
    let h = parseInt(hourRaw, 10) || 0;
    const m = parseInt(minRaw, 10) || 0;
    const ampm = typeof ampmRaw === 'string' ? ampmRaw.toUpperCase() : '';
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }
  const parts = s.split(':');
  if (parts.length >= 2) {
    const h = parseInt(parts.slice(0, 1).join('').replace(/\D/g, ''), 10) || 0;
    const m = parseInt(parts.slice(1, 2).join('').replace(/\D/g, ''), 10) || 0;
    return h * 60 + m;
  }
  return 0;
};

const toTimeString = (min: number): string => {
  const norm = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const formatTime12h = (min: number): string => {
  if (isNaN(min)) return '8:00 AM';
  const norm = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
};

const formatDurationColon = (min: number): string => {
  if (!min || isNaN(min) || min <= 0) return '0:00';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
};

const formatDurationWords = (min: number): string => {
  const mVal = typeof min === 'number' && !isNaN(min) ? Math.round(min) : 0;
  if (mVal <= 0) return '0 min';
  const h = Math.floor(mVal / 60);
  const m = mVal % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m > 0 ? `${m}m` : ''}`.trim();
};

const formatDateLabel = (dateStr: string): string => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
  } catch {
    return dateStr;
  }
};

const getSunDataForDate = (dateStr: string): SunData => {
  if (KNOWN_SUN_DATA[dateStr]) return KNOWN_SUN_DATA[dateStr];
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const startOfYear = new Date(Date.UTC(year, 0, 0));
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1);
    const eqtime =
      229.18 *
      (0.000075 +
        0.001868 * Math.cos(gamma) -
        0.032077 * Math.sin(gamma) -
        0.014615 * Math.cos(2 * gamma) -
        0.040849 * Math.sin(2 * gamma));
    const decl =
      0.006918 -
      0.399912 * Math.cos(gamma) +
      0.070257 * Math.sin(gamma) -
      0.006758 * Math.cos(2 * gamma) +
      0.000907 * Math.sin(2 * gamma);
    const radLat = 38.0 * (Math.PI / 180);
    const cosHA = Math.cos(90.833 * (Math.PI / 180)) / (Math.cos(radLat) * Math.cos(decl)) - Math.tan(radLat) * Math.tan(decl);
    const ha = Math.acos(Math.max(-1, Math.min(1, cosHA))) * (180 / Math.PI);
    const sunriseUtc = 720 - 4 * (-107.7 + ha) - eqtime;
    const sunsetUtc = 720 - 4 * (-107.7 - ha) - eqtime;
    const sunriseMin = Math.round(sunriseUtc - 6 * 60); // MDT is UTC-6
    const sunsetMin = Math.round(sunsetUtc - 6 * 60);
    return {
      label: formatDateLabel(dateStr),
      sunrise: formatTime12h(sunriseMin),
      sunset: formatTime12h(sunsetMin),
      sunriseMin,
      sunsetMin,
    };
  } catch {
    return {
      label: formatDateLabel(dateStr),
      sunrise: '6:30 AM',
      sunset: '7:00 PM',
      sunriseMin: 390,
      sunsetMin: 1140,
    };
  }
};

const normalizeTimeTo24h = (raw: string | undefined, fallback = '08:00'): string => {
  if (!raw || typeof raw !== 'string') return fallback;
  const s = raw.trim();
  const ampmMatch = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (ampmMatch) {
    const [, hourRaw = '8', minRaw = '00', ampmRaw = ''] = ampmMatch;
    let h = parseInt(hourRaw, 10) || 0;
    const m = minRaw.padStart(2, '0');
    const ampm = typeof ampmRaw === 'string' ? ampmRaw.toUpperCase() : '';
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  }
  const standardMatch = s.match(/^(\d{1,2}):(\d{2})/);
  if (standardMatch) {
    const [, hourRaw = '8', minRaw = '00'] = standardMatch;
    const h = parseInt(hourRaw, 10) || 0;
    return `${String(h).padStart(2, '0')}:${minRaw}`;
  }
  return fallback;
};

// Flexible duration parsing handling "1:10" -> 70, "0:20" -> 20, "1 hr 10 min" -> 70, etc.
const parseMinutesFlexible = (raw: string | number | undefined | null): number => {
  if (raw === undefined || raw === null) return 0;
  if (typeof raw === 'number') return isNaN(raw) ? 0 : raw;
  const str = String(raw).trim();
  if (!str) return 0;

  if (str.includes(':')) {
    const parts = str.split(':');
    const h = parseInt(parts.slice(0, 1).join('').replace(/\D/g, ''), 10) || 0;
    const m = parseInt(parts.slice(1, 2).join('').replace(/\D/g, ''), 10) || 0;
    return h * 60 + m;
  }

  if (/\d+\s*(?:hr|hour|h)/i.test(str)) {
    const hrMatch = str.match(/(\d+)\s*(?:hr|hour|h)/i);
    const minMatch = str.match(/(\d+)\s*(?:min|m)/i);
    const hours = hrMatch ? (parseInt(hrMatch.slice(1, 2).join(''), 10) || 0) : 0;
    const mins = minMatch ? (parseInt(minMatch.slice(1, 2).join(''), 10) || 0) : 0;
    return hours * 60 + mins;
  }

  const cleanDigits = str.replace(/\D/g, '');
  const parsedNum = parseInt(cleanDigits, 10);
  return isNaN(parsedNum) ? 0 : parsedNum;
};

// Flexible date parsing supporting "Fri 9/18", "9/18", "9/18/2026", and "2026-09-18"
const normalizeDateToISO = (raw: string, fallbackYear = 2026): string => {
  if (!raw) return `${fallbackYear}-09-18`;
  const str = String(raw).trim();
  const isoMatch = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch.slice(0, 1).join('');

  const slashMatch = str.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (slashMatch) {
    const [, monthRaw = '9', dayRaw = '18', yearRaw] = slashMatch;
    const month = String(parseInt(monthRaw, 10)).padStart(2, '0');
    const day = String(parseInt(dayRaw, 10)).padStart(2, '0');
    let year = yearRaw ? parseInt(yearRaw, 10) : fallbackYear;
    if (year < 100) year += 2000;
    return `${year}-${month}-${day}`;
  }
  return str;
};

// RFC-compliant CSV & TSV Parser with automated delimiter detection
function parseCSV(text: string): Record<string, string>[] {
  const cleaned = text.trim();
  if (!cleaned) return [];

  // Detect delimiter (\t or ,)
  const firstLine = cleaned.split(/\r?\n/).slice(0, 1).join('');
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned.charAt(i);
    const nextChar = cleaned.charAt(i + 1);

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentField.trim().replace(/^["']|["']$/g, ''));
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim().replace(/^["']|["']$/g, ''));
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim().replace(/^["']|["']$/g, ''));
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const rawHeaders = rows.slice(0, 1).pop() || [];
  const headers = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const results: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows.slice(r, r + 1).pop() || [];
    const obj: Record<string, string> = {};
    headers.forEach((hdr, idx) => {
      const cellVal = row.slice(idx, idx + 1).pop();
      obj[hdr] = cellVal !== undefined ? cellVal : '';
    });
    results.push(obj);
  }
  return results;
}

export default function App() {
  // 1. Persisted Itinerary State with standard localStorage lazy initialization
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(() => {
    try {
      const saved = localStorage.getItem(ITINERARY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading itinerary from localStorage', e);
    }
    return INITIAL_DATA;
  });

  // 2. Persisted Sheet URL State
  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SHEET_URL_STORAGE_KEY);
      if (saved) return saved;
    } catch (e) {
      console.error('Error loading sheet URL from localStorage', e);
    }
    return DEFAULT_SHEET_CSV_URL;
  });

  // 3. Persisted Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading settings from localStorage', e);
    }
    return {
      preferImagesInCards: true,
      cascadeDownstream: true,
      showSunriseSunset: true,
      showLiveTimeline: true,
    };
  });

  // Automatically keep localStorage in sync when state updates
  useEffect(() => {
    try {
      localStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(itinerary));
    } catch (err) {
      console.error('Failed to save itinerary to localStorage', err);
    }
  }, [itinerary]);

  useEffect(() => {
    try {
      localStorage.setItem(SHEET_URL_STORAGE_KEY, sheetUrl);
    } catch (err) {
      console.error('Failed to save sheet URL to localStorage', err);
    }
  }, [sheetUrl]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save settings to localStorage', err);
    }
  }, [settings]);

  const [selectedDate, setSelectedDate] = useState<string>('2026-09-18');
  const [activeTab, setActiveTab] = useState<'itinerary' | 'gantt' | 'summary'>('itinerary');
  const [selectedItem, setSelectedItem] = useState<ItineraryItem | null>(null);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [isAddMode, setIsAddMode] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState<boolean>(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<SyncFeedback | null>(null);

  const tripDates = useMemo(() => {
    const unique = Array.from(new Set(itinerary.map((it) => it.date))).sort();
    return unique.length > 0 ? unique : ['2026-09-18'];
  }, [itinerary]);

  // Auto-sync selectedDate to available dates
  const activeDate = useMemo(() => {
    return tripDates.includes(selectedDate) ? selectedDate : (tripDates.slice(0, 1).pop() || '2026-09-18');
  }, [tripDates, selectedDate]);

  const currentSun = useMemo(() => {
    return getSunDataForDate(activeDate);
  }, [activeDate]);

  const timelineStartMin = 6 * 60;
  const timelineEndMin = 18 * 60;
  const totalTimelineMinutes = timelineEndMin - timelineStartMin;
  const timelinePixelHeight = 720;
  const minToPx = (m: number) => ((m - timelineStartMin) / totalTimelineMinutes) * timelinePixelHeight;

  // Filter items for selected day
  const currentDayItems = useMemo(() => {
    return itinerary
      .filter((item) => item.date === activeDate)
      .sort((a, b) => toMinutes(a.arrivalTime) - toMinutes(b.arrivalTime));
  }, [itinerary, activeDate]);

  const overlaps = useMemo<ScheduleConflict[]>(() => {
    const conflicts: ScheduleConflict[] = [];
    for (let i = 0; i < currentDayItems.length; i++) {
      for (let j = i + 1; j < currentDayItems.length; j++) {
        const a = currentDayItems.slice(i, i + 1).pop();
        const b = currentDayItems.slice(j, j + 1).pop();
        if (!a || !b) continue;
        const aStart = toMinutes(a.arrivalTime);
        const aEnd = toMinutes(a.departTime);
        const bStart = toMinutes(b.arrivalTime);
        const bEnd = toMinutes(b.departTime);

        if (aStart < bEnd && bStart < aEnd) {
          conflicts.push({
            itemA: a,
            itemB: b,
            overlapMinutes: Math.min(aEnd, bEnd) - Math.max(aStart, bStart),
          });
        }
      }
    }
    return conflicts;
  }, [currentDayItems]);

  const conflictingItemIds = useMemo(() => {
    const set = new Set<string>();
    overlaps.forEach((c) => {
      set.add(c.itemA.id);
      set.add(c.itemB.id);
    });
    return set;
  }, [overlaps]);

  // Summary Metrics (guaranteed NaN-free)
  const summaryStats = useMemo(() => {
    let totalDriveMin = 0;
    let totalHikeTransitMin = 0;
    let totalBikeTransitMin = 0;
    let totalFlyTransitMin = 0;
    let totalWalkHikingActivityMin = 0;
    let totalTimeSpentMin = 0;

    const activityMinutes: Record<string, number> = {
      driving: 0,
      hiking: 0,
      sightseeing: 0,
      food: 0,
      lodging: 0,
    };

    currentDayItems.forEach((item, idx) => {
      const mode = item.travelMode || 'drive';
      let travelM = parseMinutesFlexible(item.travelMinutes);

      // If travelMinutes was left blank, check schedule gap from previous waypoint
      if (travelM <= 0 && idx > 0) {
        const prev = currentDayItems.slice(idx - 1, idx).pop();
        if (prev) {
          const gap = toMinutes(item.arrivalTime) - toMinutes(prev.departTime);
          if (gap > 0) travelM = gap;
        }
      }

      if (mode === 'drive') totalDriveMin += travelM;
      else if (mode === 'hike') totalHikeTransitMin += travelM;
      else if (mode === 'bike') totalBikeTransitMin += travelM;
      else if (mode === 'fly') totalFlyTransitMin += travelM;

      activityMinutes.driving += travelM;

      const arrM = toMinutes(item.arrivalTime);
      const depM = toMinutes(item.departTime);
      const spent = Math.max(0, depM - arrM);
      totalTimeSpentMin += spent;

      if (item.activityType === 'hiking') {
        totalWalkHikingActivityMin += spent;
      }
      if (activityMinutes[item.activityType] !== undefined) {
        activityMinutes[item.activityType] += spent;
      } else {
        activityMinutes[item.activityType] = spent;
      }
    });

    const totalTransit = totalDriveMin + totalHikeTransitMin + totalBikeTransitMin + totalFlyTransitMin;
    const totalActiveTime = totalTransit + totalTimeSpentMin;

    return {
      totalDriveMin,
      totalHikeTransitMin,
      totalBikeTransitMin,
      totalFlyTransitMin,
      totalWalkHikingMin: totalWalkHikingActivityMin + totalHikeTransitMin,
      totalTimeSpentMin,
      activityMinutes,
      totalActiveTime: isNaN(totalActiveTime) || totalActiveTime <= 0 ? 1 : totalActiveTime,
    };
  }, [currentDayItems]);

  const getActivityMeta = (type: ActivityType): ActivityMeta => {
    switch (type) {
      case 'lodging':
        return {
          label: 'Lodging',
          icon: BedIcon,
          bgSoft: 'bg-[#F2EDF9]',
          iconColor: 'text-[#6C47A8]',
          stayBarColor: 'bg-[#6C47A8]',
          travelBarColor: 'bg-[#DDD3ED]',
        };
      case 'sightseeing':
        return {
          label: 'Sightseeing',
          icon: Camera,
          bgSoft: 'bg-[#FDF2E2]',
          iconColor: 'text-[#C97B20]',
          stayBarColor: 'bg-[#D97706]',
          travelBarColor: 'bg-[#E4C397]',
        };
      case 'hiking':
        return {
          label: 'Hiking',
          icon: Footprints,
          bgSoft: 'bg-[#EBF4EE]',
          iconColor: 'text-[#234E42]',
          stayBarColor: 'bg-[#234E42]',
          travelBarColor: 'bg-[#A3D2B8]',
        };
      case 'food':
        return {
          label: 'Food / Coffee',
          icon: Coffee,
          bgSoft: 'bg-[#FEF3C7]',
          iconColor: 'text-[#B45309]',
          stayBarColor: 'bg-[#D97706]',
          travelBarColor: 'bg-[#FDE68A]',
        };
      default:
        return {
          label: 'Scenic Drive',
          icon: Car,
          bgSoft: 'bg-emerald-50',
          iconColor: 'text-[#234E42]',
          stayBarColor: 'bg-[#234E42]',
          travelBarColor: 'bg-emerald-200',
        };
    }
  };

  const handlePrevDay = () => {
    const idx = tripDates.indexOf(activeDate);
    if (idx > 0) {
      const prevDate = tripDates.slice(idx - 1, idx).pop();
      if (prevDate) setSelectedDate(prevDate);
    }
  };
  const handleNextDay = () => {
    const idx = tripDates.indexOf(activeDate);
    if (idx < tripDates.length - 1) {
      const nextDate = tripDates.slice(idx + 1, idx + 2).pop();
      if (nextDate) setSelectedDate(nextDate);
    }
  };

  const cascadeSchedule = (updatedItem: ItineraryItem, fullList: ItineraryItem[]): ItineraryItem[] => {
    if (!settings.cascadeDownstream) {
      return fullList.map((it) => (it.id === updatedItem.id ? updatedItem : it));
    }

    const dayItems = fullList
      .filter((it) => it.date === updatedItem.date)
      .sort((a, b) => toMinutes(a.arrivalTime) - toMinutes(b.arrivalTime));

    const updatedDayItems = [...dayItems];
    const targetIdx = updatedDayItems.findIndex((it) => it.id === updatedItem.id);

    if (targetIdx !== -1) {
      updatedDayItems[targetIdx] = updatedItem;

      for (let i = targetIdx + 1; i < updatedDayItems.length; i++) {
        const prev = updatedDayItems.slice(i - 1, i).pop();
        const curr = updatedDayItems.slice(i, i + 1).pop();
        if (!prev || !curr) continue;

        const prevDepartMin = toMinutes(prev.departTime);
        const travelMin = parseMinutesFlexible(curr.travelMinutes);
        const projectedArrivalMin = prevDepartMin + travelMin;

        const currentDuration = Math.max(
          5,
          toMinutes(curr.departTime) - toMinutes(curr.arrivalTime)
        );

        if (curr.hardTime === 'arrival') {
          const fixedArrivalMin = toMinutes(curr.arrivalTime);
          const newDepart = Math.max(fixedArrivalMin + 5, fixedArrivalMin + currentDuration);
          updatedDayItems[i] = {
            ...curr,
            departTime: toTimeString(newDepart),
          };
        } else {
          const newArrivalMin = projectedArrivalMin;
          let newDepartMin = newArrivalMin + currentDuration;

          if (curr.hardTime === 'departure') {
            const fixedDepartMin = toMinutes(curr.departTime);
            newDepartMin = Math.max(newArrivalMin + 5, fixedDepartMin);
          }

          updatedDayItems[i] = {
            ...curr,
            arrivalTime: toTimeString(newArrivalMin),
            departTime: toTimeString(newDepartMin),
          };
        }
      }
    }

    const otherDays = fullList.filter((it) => it.date !== updatedItem.date);
    return [...otherDays, ...updatedDayItems];
  };

  const handleOpenAddModal = () => {
    let defaultArrival = '11:00';
    let defaultDepart = '11:45';
    if (currentDayItems.length > 0) {
      const lastStop = currentDayItems.slice(-1).pop();
      if (lastStop) {
        const nextArrMin = toMinutes(lastStop.departTime) + 15;
        defaultArrival = toTimeString(nextArrMin);
        defaultDepart = toTimeString(nextArrMin + 45);
      }
    }

    setEditingItem({
      id: `stop-${Date.now()}`,
      date: activeDate,
      destination: '',
      address: '',
      arrivalTime: defaultArrival,
      departTime: defaultDepart,
      travelMinutes: 15,
      travelMode: 'drive',
      timeSpentMinutes: toMinutes(defaultDepart) - toMinutes(defaultArrival),
      activityType: 'sightseeing',
      notes: '',
      insights: ['Convenient parking pullover available nearby.'],
      tags: ['Explore'],
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      hardTime: 'none',
      timeError: null,
    });
    setIsAddMode(true);
  };

  const handleAutoResolve = () => {
    if (overlaps.length === 0) return;
    const conflict = overlaps.slice(0, 1).pop();
    if (!conflict) return;

    const prevDepart = toMinutes(conflict.itemA.departTime);
    const itemBDuration = Math.max(10, toMinutes(conflict.itemB.departTime) - toMinutes(conflict.itemB.arrivalTime));
    const newArrival = prevDepart + (parseMinutesFlexible(conflict.itemB.travelMinutes) || 5);
    const newDepart = newArrival + itemBDuration;

    const resolvedItem: ItineraryItem = {
      ...conflict.itemB,
      arrivalTime: toTimeString(newArrival),
      departTime: toTimeString(newDepart),
    };

    setItinerary((prev) => cascadeSchedule(resolvedItem, prev));
  };

  // Google Sheets CSV & TSV Importer
  const handleSyncFromSheet = async () => {
    if (!sheetUrl.trim()) return;
    setIsSyncing(true);
    setSyncFeedback({ type: 'info', message: 'Fetching published CSV from Google Sheets...' });
    try {
      const cacheBustUrl = sheetUrl.includes('?') ? `${sheetUrl}&_t=${Date.now()}` : `${sheetUrl}?_t=${Date.now()}`;
      const res = await fetch(cacheBustUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch sheet.`);
      const csvText = await res.text();
      const rows = parseCSV(csvText);

      if (!rows || rows.length === 0) {
        throw new Error('CSV is empty or could not be parsed.');
      }

      let lastDate = '2026-09-18';
      const parsedStops: ItineraryItem[] = rows
        .filter((r) => r.destination || r.stop || r.location || r.notes || r.destinationnotes)
        .map((r, i) => {
          const getField = (names: string[]) => {
            for (const name of names) {
              const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (r[clean] !== undefined && r[clean] !== '') return r[clean];
            }
            return '';
          };

          const rawDate = getField(['date', 'day']);
          if (rawDate) lastDate = normalizeDateToISO(rawDate, 2026);
          const date = lastDate;

          const destination = (getField(['destination', 'stop', 'location', 'name']) || `Stop ${i + 1}`).trim();
          const rawAddress = getField(['address', 'addr']);
          const address = rawAddress ? rawAddress.trim() : destination;

          const rawArr = getField(['arrivaltime', 'arrival', 'start', 'arr']) || '08:00';
          const rawDep = getField(['departtime', 'depart', 'end', 'dep']) || '';
          const arrive = normalizeTimeTo24h(rawArr, '08:00');

          const travelMinutes = parseMinutesFlexible(getField(['travelminutes', 'traveltime', 'travel', 'drive', 'driving']));
          const timeSpentMinutes = parseMinutesFlexible(getField(['timespent', 'duration', 'timespentminutes', 'spent']));

          let depart = '';
          if (rawDep) {
            depart = normalizeTimeTo24h(rawDep, arrive);
          } else if (timeSpentMinutes > 0) {
            depart = toTimeString(toMinutes(arrive) + timeSpentMinutes);
          } else {
            depart = toTimeString(toMinutes(arrive) + 30);
          }

          // Mode detection
          const rawMode = (getField(['travelmode', 'mode', 'transitmode']) || '').toLowerCase();
          let travelMode: TransitMode = 'drive';
          if (['drive', 'hike', 'bike', 'fly'].includes(rawMode)) {
            travelMode = rawMode as TransitMode;
          } else if (rawMode.includes('flight') || rawMode.includes('plane') || rawMode.includes('air') || rawMode.includes('fly')) {
            travelMode = 'fly';
          } else if (rawMode.includes('walk') || rawMode.includes('trail') || rawMode.includes('hike')) {
            travelMode = 'hike';
          } else if (rawMode.includes('cycle') || rawMode.includes('bike')) {
            travelMode = 'bike';
          } else {
            const combined = `${destination} ${getField(['notes', 'description'])}`.toLowerCase();
            if (combined.includes('flight') || combined.includes('airport') || combined.includes('gate') || combined.includes('denver international')) {
              travelMode = 'fly';
            } else if (combined.includes('trail') || combined.includes('hike')) {
              travelMode = 'hike';
            }
          }

          // Activity detection
          const rawType = (getField(['activitytype', 'type', 'activity']) || '').toLowerCase();
          let activityType: ActivityType = 'sightseeing';
          if (['lodging', 'sightseeing', 'hiking', 'food', 'driving'].includes(rawType)) {
            activityType = rawType as ActivityType;
          } else if (rawType.includes('travel') || rawType.includes('transit') || rawType.includes('flight')) {
            activityType = 'driving';
          } else {
            const combined = `${destination} ${getField(['notes', 'description'])}`.toLowerCase();
            if (combined.includes('hotel') || combined.includes('hostel') || combined.includes('lodging') || combined.includes('bivvi') || combined.includes('inn')) {
              activityType = 'lodging';
            } else if (combined.includes('flight') || combined.includes('airport') || combined.includes('gate') || combined.includes('shuttle') || combined.includes('drive')) {
              activityType = 'driving';
            } else if (combined.includes('coffee') || combined.includes('bakery') || combined.includes('cafe') || combined.includes('restaurant')) {
              activityType = 'food';
            } else if (combined.includes('hike') || combined.includes('trail') || combined.includes('falls')) {
              activityType = 'hiking';
            }
          }

          const notes = (getField(['notes', 'destinationnotes', 'description', 'details']) || '').trim();
          const rawInsights = getField(['insights', 'insight']);
          const insights = rawInsights ? rawInsights.split(/[|;]/).map((s) => s.trim()).filter(Boolean) : [];

          const rawTags = getField(['tags', 'tag']);
          const tags = rawTags ? rawTags.split(/[,|;]/).map((t) => t.trim()).filter(Boolean) : [activityType.toUpperCase()];

          const rawHardTime = (getField(['hardtime', 'hardtimes', 'lock']) || 'none').toLowerCase();
          const hardTime: HardTimeOption = ['none', 'arrival', 'departure'].includes(rawHardTime)
            ? (rawHardTime as HardTimeOption)
            : 'none';

          const image = getField(['image', 'img', 'photo']) || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';

          const rawLat = parseFloat(getField(['lat', 'latitude']));
          const rawLng = parseFloat(getField(['lng', 'lon', 'longitude']));
          const lat = !isNaN(rawLat) ? rawLat : undefined;
          const lng = !isNaN(rawLng) ? rawLng : undefined;

          return {
            id: `stop-${date}-${i}`,
            date,
            destination,
            address,
            arrivalTime: arrive,
            departTime: depart,
            travelMinutes,
            travelMode,
            activityType,
            notes,
            insights,
            tags,
            image,
            hardTime,
            timeSpentMinutes: timeSpentMinutes > 0 ? timeSpentMinutes : Math.max(1, toMinutes(depart) - toMinutes(arrive)),
            lat,
            lng,
          };
        });

      if (parsedStops.length > 0) {
        setItinerary(parsedStops);
        const firstStop = parsedStops.slice(0, 1).pop();
        if (firstStop) setSelectedDate(firstStop.date);
        try {
          localStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(parsedStops));
          localStorage.setItem(SHEET_URL_STORAGE_KEY, sheetUrl.trim());
        } catch (e) {
          console.error('Failed to immediately persist synced itinerary to localStorage', e);
        }
        setSyncFeedback({ type: 'success', message: `Synced ${parsedStops.length} stops from Google Sheet!` });
      } else {
        setSyncFeedback({ type: 'error', message: 'No valid itinerary rows identified in sheet.' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setSyncFeedback({ type: 'error', message: `Sync failed: ${msg}` });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirmClearItinerary = () => {
    setItinerary([]);
    setSelectedItem(null);
    try {
      localStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.error('Failed to clear itinerary from localStorage', e);
    }
    setShowClearConfirmModal(false);
    setShowSettingsModal(false);
  };

  const handleRestoreDefaults = () => {
    setItinerary(INITIAL_DATA);
    setSelectedDate('2026-09-18');
    try {
      localStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    } catch (e) {
      console.error('Failed to restore defaults in localStorage', e);
    }
    setShowSettingsModal(false);
  };

  return (
    <div className="min-h-screen bg-[#E5E9E2] text-slate-900 flex justify-center p-0 sm:p-4 font-sans antialiased selection:bg-[#234E42] selection:text-white">
      {/* Mobile Shell Frame */}
      <div className="w-full max-w-md bg-[#F4F6F0] text-slate-900 shadow-2xl flex flex-col relative overflow-hidden sm:rounded-[42px] border-0 sm:border-8 sm:border-slate-800 h-[100dvh] sm:h-[870px]">
        
        {/* Status Bar */}
        <div className="bg-[#F4F6F0] px-6 pt-3 pb-1 flex items-center justify-between text-xs tracking-tight shrink-0 select-none">
          <span className="font-semibold text-sm text-slate-800">12:14</span>
          <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto hidden sm:block"></div>
          <div className="flex items-center space-x-1.5 text-slate-700">
            <span className="text-[11px] font-bold">5G</span>
            <div className="w-5 h-2.5 border border-slate-700 rounded-xs p-0.5 flex items-center">
              <div className="h-full w-3.5 bg-slate-900 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Top Header */}
        <div className="px-5 pt-2 pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1E4238] flex items-center justify-center text-white shadow-sm shadow-[#1E4238]/30">
                <svg className="w-4 h-4 text-emerald-100 fill-current" viewBox="0 0 24 24">
                  <path d="M4 18l4.5-9 3.5 5 4-7 4 11H4z" />
                </svg>
              </div>
              <span className="font-serif font-bold text-lg text-[#1E4238] tracking-tight">
                TrailSync
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSyncModal(true)}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-[#234E42] transition shadow-2xs cursor-pointer"
                title="Sync from Google Sheets CSV"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-2xs cursor-pointer"
                title="Settings & Display"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-3">
            <h1 className="font-serif text-2xl font-bold text-slate-900 leading-tight">
              Colorado Fall Adventure
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {tripDates.length} days • {itinerary.length} waypoints
            </p>
          </div>

          {/* Date Selector Pill */}
          <div className="flex items-center space-x-2 mt-3.5">
            <button
              onClick={handlePrevDay}
              disabled={activeDate === tripDates.slice(0, 1).pop()}
              className="w-9 h-12 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-slate-700 shadow-2xs transition shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowCalendarPicker(true)}
              className="flex-1 h-12 bg-white rounded-2xl border border-slate-200/80 px-3.5 flex items-center justify-between text-left hover:border-[#234E42]/50 transition shadow-2xs cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {currentSun.label}
                </span>
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-medium mt-0.5">
                  <span className="flex items-center space-x-1 text-amber-700 font-semibold">
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span>{currentSun.sunrise}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-indigo-700 font-semibold">
                    <Moon className="w-3 h-3 text-indigo-500" />
                    <span>{currentSun.sunset}</span>
                  </span>
                </div>
              </div>

              <div className="p-1 rounded-lg text-slate-400">
                <Calendar className="w-4 h-4 text-slate-600" />
              </div>
            </button>

            <button
              onClick={handleNextDay}
              disabled={activeDate === tripDates.slice(-1).pop()}
              className="w-9 h-12 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-slate-700 shadow-2xs transition shrink-0 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Segmented View Mode Tabs */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'itinerary'
                  ? 'bg-[#234E42] text-white shadow-md shadow-[#234E42]/20'
                  : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Itinerary
            </button>
            <button
              onClick={() => setActiveTab('gantt')}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gantt'
                  ? 'bg-[#234E42] text-white shadow-md shadow-[#234E42]/20'
                  : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-[#234E42] text-white shadow-md shadow-[#234E42]/20'
                  : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Summary
            </button>
          </div>
        </div>

        {/* Overlap Warning Banner */}
        {overlaps.length > 0 && (
          <div className="mx-4 mb-2 bg-rose-50 border border-rose-200/90 rounded-2xl p-2.5 flex items-center justify-between text-xs text-rose-800 shadow-xs animate-fade-in">
            <div className="flex items-center space-x-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div className="truncate">
                <span className="font-bold">Schedule Overlap:</span>{' '}
                <span className="text-rose-700">{overlaps.slice(0, 1).pop()?.itemA.destination} & {overlaps.slice(0, 1).pop()?.itemB.destination}</span>
              </div>
            </div>
            <button
              onClick={handleAutoResolve}
              className="ml-2 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] shrink-0 shadow-2xs transition cursor-pointer"
            >
              Auto Shift
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto relative bg-[#F4F6F0] px-4 pb-24">
          
          {/* Empty State */}
          {currentDayItems.length === 0 && (
            <div className="pt-12 text-center space-y-4 px-6">
              <div className="w-16 h-16 bg-white rounded-3xl mx-auto flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm">
                <List className="w-8 h-8 text-[#234E42]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">No Stops in Itinerary</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Your trip schedule is empty. You can sync from Google Sheets, add a new waypoint, or restore the Colorado tour defaults.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setShowSyncModal(true)}
                  className="py-2.5 px-4 bg-[#234E42] text-white rounded-xl font-bold text-xs shadow-md shadow-[#234E42]/20 flex items-center justify-center space-x-2 cursor-pointer hover:bg-[#1B3E34]"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sync from Google Sheets</span>
                </button>
                <button
                  onClick={handleRestoreDefaults}
                  className="py-2.5 px-4 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Restore Colorado Tour Defaults
                </button>
              </div>
            </div>
          )}

          {/* View 1: Itinerary Cards */}
          {activeTab === 'itinerary' && currentDayItems.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs px-1 text-slate-500 font-semibold mb-2">
                <span>{currentDayItems.length} STOPS SCHEDULED</span>
                <span>{formatDurationWords(summaryStats.totalActiveTime)} Total Window</span>
              </div>

              {currentDayItems.map((item, index) => {
                const meta = getActivityMeta(item.activityType);
                const IconComponent = meta.icon;
                const isConflict = conflictingItemIds.has(item.id);
                const durationMin = Math.max(1, toMinutes(item.departTime) - toMinutes(item.arrivalTime));
                
                // Parse travelMinutes cleanly; fall back to scheduled gap between stops if unspecified
                let travelMin = parseMinutesFlexible(item.travelMinutes);
                if (travelMin <= 0 && index > 0) {
                  const prev = currentDayItems.slice(index - 1, index).pop();
                  if (prev) {
                    const gap = toMinutes(item.arrivalTime) - toMinutes(prev.departTime);
                    if (gap > 0) travelMin = gap;
                  }
                }

                const transitMeta = getTransitMeta(item.travelMode);
                const TransitIcon = transitMeta.icon;

                // Proportional bar calculation
                const maxScale = 90;
                const travelPct = Math.min(50, (travelMin / maxScale) * 100);
                const stayPct = Math.min(100 - travelPct, (durationMin / maxScale) * 100);

                return (
                  <React.Fragment key={item.id}>
                    {/* Inter-card travel connector */}
                    {index > 0 && travelMin > 0 && (
                      <div className="flex items-center space-x-2 py-1 pl-7 text-slate-600 text-xs font-medium">
                        <div className="w-0.5 h-6 bg-slate-300 ml-1.5 rounded-full"></div>
                        <div className="flex items-center space-x-1.5 bg-white/95 text-slate-700 px-3 py-1 rounded-full text-[11px] font-semibold border border-slate-200/90 shadow-2xs">
                          <TransitIcon className={`w-3.5 h-3.5 ${transitMeta.color}`} />
                          <span>
                            {formatDurationWords(travelMin)} {transitMeta.label} to {item.destination}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Main Waypoint Card */}
                    <div
                      onClick={() => setSelectedItem(item)}
                      className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs hover:shadow-md group ${
                        isConflict
                          ? 'border-rose-300 ring-2 ring-rose-400 bg-rose-50/40'
                          : 'border-slate-200/85 hover:border-[#234E42]/40'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl shrink-0 overflow-hidden flex items-center justify-center relative ${meta.bgSoft}`}
                        >
                          {settings.preferImagesInCards && item.image ? (
                            <img
                              src={item.image}
                              alt={item.destination}
                              className="w-full h-full object-cover rounded-2xl"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <IconComponent className={`w-6 h-6 ${meta.iconColor}`} />
                          )}
                          {settings.preferImagesInCards && item.image && (
                            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs">
                              <IconComponent className={`w-2.5 h-2.5 ${meta.iconColor}`} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-800 text-sm tracking-tight">
                                {formatTime12h(toMinutes(item.arrivalTime))} – {formatTime12h(toMinutes(item.departTime))}
                              </span>
                              {item.hardTime && item.hardTime !== 'none' && (
                                <span title={`Hard ${item.hardTime} lock`} className="text-amber-600">
                                  <Lock className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition shrink-0" />
                          </div>

                          <h3 className="font-bold text-slate-900 text-base leading-tight mt-0.5 truncate">
                            {item.destination}
                          </h3>

                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {item.address || 'Colorado Byway'}
                          </p>

                          <div className="flex items-center space-x-2.5 text-xs text-slate-600 font-medium mt-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase border border-current/15 ${meta.bgSoft} ${meta.iconColor}`}
                            >
                              {meta.label}
                            </span>

                            <div className="flex items-center space-x-1 text-slate-600 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatDurationColon(durationMin)} here</span>
                            </div>
                          </div>

                          <div className="w-full bg-[#EBEBEB] rounded-full h-1.5 mt-2.5 overflow-hidden flex">
                            {travelMin > 0 && (
                              <div
                                className={`h-full ${meta.travelBarColor}`}
                                style={{ width: `${travelPct}%` }}
                              />
                            )}
                            <div
                              className={`h-full ${meta.stayBarColor}`}
                              style={{ width: `${stayPct}%` }}
                            />
                          </div>

                          {isConflict && (
                            <div className="mt-2 text-[11px] font-bold text-rose-600 flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Schedule conflict with neighboring stop</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* View 2: Timeline Gantt */}
          {activeTab === 'gantt' && currentDayItems.length > 0 && (
            <div className="pt-2 select-none">
              <div
                className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                style={{ height: `${timelinePixelHeight}px` }}
              >
                {/* Sunrise Shading */}
                {settings.showSunriseSunset && currentSun.sunriseMin > timelineStartMin && (
                  <div
                    className="absolute left-0 right-0 top-0 bg-slate-950/10 border-b border-amber-300 pointer-events-none z-1 flex items-end px-3 pb-1"
                    style={{ height: `${minToPx(currentSun.sunriseMin)}px` }}
                  >
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded flex items-center space-x-1">
                      <Sun className="w-3 h-3 text-amber-600" />
                      <span>Sunrise {currentSun.sunrise}</span>
                    </span>
                  </div>
                )}

                {/* Hour Grid Lines */}
                {Array.from({ length: 13 }).map((_, idx) => {
                  const hour = 6 + idx;
                  const minuteVal = hour * 60;
                  const topPos = minToPx(minuteVal);
                  if (minuteVal > timelineEndMin) return null;

                  return (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 border-t border-slate-100 flex items-center pointer-events-none"
                      style={{ top: `${topPos}px` }}
                    >
                      <span className="text-[10px] font-bold text-slate-400 bg-white/95 px-2 py-0.5 ml-2 rounded">
                        {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                      </span>
                      <div className="flex-1 border-t border-dashed border-slate-200"></div>
                    </div>
                  );
                })}

                {/* Gantt Activities */}
                {currentDayItems.map((item, index) => {
                  const itemArrival = toMinutes(item.arrivalTime);
                  const itemDepart = toMinutes(item.departTime);
                  const topPx = minToPx(itemArrival);
                  const duration = Math.max(12, itemDepart - itemArrival);
                  const heightPx = Math.max(40, (duration / totalTimelineMinutes) * timelinePixelHeight);

                  const meta = getActivityMeta(item.activityType);
                  const Icon = meta.icon;
                  const isConflict = conflictingItemIds.has(item.id);
                  const transitMeta = getTransitMeta(item.travelMode);
                  const TransitIcon = transitMeta.icon;

                  let travelM = parseMinutesFlexible(item.travelMinutes);
                  const prevStop = index > 0 ? currentDayItems.slice(index - 1, index).pop() : null;
                  if (travelM <= 0 && prevStop) {
                    const gap = itemArrival - toMinutes(prevStop.departTime);
                    if (gap > 0) travelM = gap;
                  }

                  let travelConn = null;
                  if (prevStop) {
                    const prevDepart = toMinutes(prevStop.departTime);
                    const connTop = minToPx(prevDepart);
                    const connHeight = Math.max(0, topPx - connTop);

                    travelConn = (
                      <div
                        className="absolute left-14 z-5 flex items-center pointer-events-none"
                        style={{ top: `${connTop}px`, height: `${connHeight}px` }}
                      >
                        <div className="w-0.5 h-full bg-[#234E42]/40 border-l border-dashed border-[#234E42]/60 ml-2"></div>
                        {travelM > 0 && connHeight > 18 && (
                          <div className="ml-2 bg-white text-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-300 shadow-2xs flex items-center space-x-1">
                            <TransitIcon className={`w-2.5 h-2.5 ${transitMeta.color}`} />
                            <span>{travelM}m {transitMeta.label}</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <React.Fragment key={item.id}>
                      {travelConn}

                      <div
                        onClick={() => setSelectedItem(item)}
                        className={`absolute left-12 right-2 rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-md border-l-4 ${
                          isConflict
                            ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-400 text-rose-950'
                            : `bg-white border border-slate-200 text-slate-800`
                        }`}
                        style={{ top: `${topPx}px`, height: `${heightPx}px`, zIndex: 10 }}
                      >
                        <div className="p-2 h-full flex items-center justify-between gap-2 overflow-hidden">
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${meta.bgSoft}`}>
                              <Icon className={`w-3.5 h-3.5 ${meta.iconColor}`} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold truncate leading-tight">
                                {item.destination}
                              </h4>
                              <p className="text-[10px] text-slate-500 truncate">
                                {formatTime12h(itemArrival)} – {formatTime12h(itemDepart)} ({formatDurationColon(duration)})
                              </p>
                            </div>
                          </div>

                          {item.hardTime && item.hardTime !== 'none' && (
                            <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* View 3: Summary Metrics */}
          {activeTab === 'summary' && currentDayItems.length > 0 && (
            <div className="pt-2 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <h3 className="font-bold text-slate-900 text-sm">
                  {currentSun.label} Driving & Activity Metrics
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Calculated durations across planned stops</p>

                <div className="grid grid-cols-3 gap-2 mt-3.5">
                  <div className="p-3 bg-[#EBF4EE] rounded-xl text-center border border-[#234E42]/10">
                    <Car className="w-5 h-5 text-[#234E42] mx-auto mb-1" />
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Drive</span>
                    <span className="text-sm font-extrabold text-[#1E4238]">
                      {formatDurationWords(summaryStats.totalDriveMin)}
                    </span>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                    <Footprints className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Trail / Hike</span>
                    <span className="text-sm font-extrabold text-emerald-900">
                      {formatDurationWords(summaryStats.totalWalkHikingMin)}
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl text-center border border-amber-100">
                    <Clock className="w-5 h-5 text-amber-700 mx-auto mb-1" />
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">At Waypoints</span>
                    <span className="text-sm font-extrabold text-amber-900">
                      {formatDurationWords(summaryStats.totalTimeSpentMin)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Time Spent Breakdown
                </h4>
                {[
                  { key: 'driving', label: 'Driving & Transit', icon: Car, color: 'bg-[#234E42]' },
                  { key: 'hiking', label: 'Hiking & Walking', icon: Footprints, color: 'bg-emerald-600' },
                  { key: 'sightseeing', label: 'Sightseeing & Photography', icon: Camera, color: 'bg-[#C97B20]' },
                  { key: 'food', label: 'Artisan Food & Coffee', icon: Coffee, color: 'bg-amber-500' },
                  { key: 'lodging', label: 'Thermal Pool & Rest', icon: BedIcon, color: 'bg-[#6C47A8]' },
                ].map((act) => {
                  const min = summaryStats.activityMinutes[act.key] || 0;
                  const pct = Math.round((min / summaryStats.totalActiveTime) * 100) || 0;
                  const Icon = act.icon;

                  return (
                    <div key={act.key}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center space-x-1.5">
                          <Icon className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-semibold text-slate-800">{act.label}</span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {formatDurationWords(min)} <span className="text-slate-400 font-normal">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full ${act.color}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <button
          onClick={handleOpenAddModal}
          className="absolute right-4 bottom-16 z-30 w-13 h-13 rounded-full bg-[#234E42] text-white shadow-xl shadow-[#234E42]/40 hover:bg-[#1B3E34] active:scale-95 transition-all flex items-center justify-center cursor-pointer border-2 border-white"
          title="Add Stop to Itinerary"
        >
          <Plus className="w-7 h-7" />
        </button>

        {/* Bottom Navigation Dock */}
        <div className="bg-white border-t border-slate-200 px-6 py-2 flex items-center justify-around shrink-0 z-20">
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex flex-col items-center space-y-1 transition cursor-pointer ${
              activeTab === 'itinerary' ? 'text-[#234E42] font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <List className="w-5 h-5" />
            <span className="text-[10px]">Itinerary</span>
          </button>

          <button
            onClick={() => setActiveTab('gantt')}
            className={`flex flex-col items-center space-y-1 transition cursor-pointer ${
              activeTab === 'gantt' ? 'text-[#234E42] font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px]">Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex flex-col items-center space-y-1 transition cursor-pointer ${
              activeTab === 'summary' ? 'text-[#234E42] font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px]">Summary</span>
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex flex-col items-center space-y-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px]">Settings</span>
          </button>
        </div>

        {/* Modal 1: Add/Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
              
              <div className="px-5 py-3.5 bg-[#F4F6F0] border-b border-slate-200 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {isAddMode ? 'Add Itinerary Entry' : 'Edit Itinerary Entry'}
                  </h3>
                  <span className="text-[10px] text-slate-500">{currentSun.label}</span>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-1 rounded-xl hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Destination Name *
                  </label>
                  <input
                    type="text"
                    value={editingItem.destination}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, destination: e.target.value })
                    }
                    placeholder="e.g. Park N Go Orlando"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#234E42] text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Address / Highway *
                  </label>
                  <input
                    type="text"
                    value={editingItem.address}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, address: e.target.value })
                    }
                    placeholder="e.g. 8500 Peña Blvd, Denver, CO"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#234E42] text-xs text-slate-900"
                  />
                </div>

                {/* Transit Mode & Travel Time */}
                <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-[#234E42]/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#1E4238] flex items-center space-x-1.5">
                      <span>Travel Mode from Previous Stop</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">Select transit type</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {(
                      [
                        { id: 'drive', label: 'Drive', icon: Car },
                        { id: 'hike', label: 'Hike', icon: Footprints },
                        { id: 'bike', label: 'Bike', icon: Bike },
                        { id: 'fly', label: 'Fly', icon: Plane },
                      ] as const
                    ).map((mode) => {
                      const ModeIcon = mode.icon;
                      const isSelected = (editingItem.travelMode || 'drive') === mode.id;
                      return (
                        <button
                          type="button"
                          key={mode.id}
                          onClick={() =>
                            setEditingItem({ ...editingItem, travelMode: mode.id })
                          }
                          className={`py-2 px-1 rounded-xl font-bold text-xs flex flex-col items-center justify-center space-y-1 transition border cursor-pointer ${
                            isSelected
                              ? 'bg-[#234E42] text-white border-[#234E42] shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <ModeIcon className="w-4 h-4" />
                          <span className="text-[11px]">{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-700 font-bold">
                      {getTransitMeta(editingItem.travelMode).title} Time:
                    </span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="720"
                        value={editingItem.travelMinutes !== undefined ? editingItem.travelMinutes : ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setEditingItem({ ...editingItem, travelMinutes: isNaN(val) ? 0 : Math.max(0, val) });
                        }}
                        className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#234E42] text-xs font-bold text-slate-900 bg-white text-center"
                      />
                      <span className="text-slate-600 font-medium">min</span>
                    </div>
                  </div>
                </div>

                {/* Duration & Time Range */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                      Schedule Window & Duration
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-semibold">
                      Bidirectional Sync
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Arrival Time
                    </label>
                    <input
                      type="time"
                      value={editingItem.arrivalTime}
                      onChange={(e) => {
                        const newArrStr = e.target.value;
                        const newArrMin = toMinutes(newArrStr);
                        const spent = editingItem.timeSpentMinutes || 30;
                        const newDepMin = newArrMin + spent;
                        setEditingItem({
                          ...editingItem,
                          arrivalTime: newArrStr,
                          departTime: toTimeString(newDepMin),
                          timeError: null,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#234E42] text-xs font-bold text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">
                        Time Spent At Stop (Minutes) *
                      </label>
                      <span className="text-slate-500 font-bold">
                        {formatDurationWords(editingItem.timeSpentMinutes || 0)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="720"
                        value={editingItem.timeSpentMinutes !== undefined ? editingItem.timeSpentMinutes : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setEditingItem({
                              ...editingItem,
                              timeSpentMinutes: 0,
                              timeError: 'Time spent must be at least 1 minute.',
                            });
                            return;
                          }

                          const newSpent = parseInt(val, 10);
                          if (isNaN(newSpent) || newSpent < 1) {
                            setEditingItem({
                              ...editingItem,
                              timeSpentMinutes: 0,
                              timeError: 'Time spent must be at least 1 minute.',
                            });
                            return;
                          }

                          const arrMin = toMinutes(editingItem.arrivalTime);
                          const newDepMin = arrMin + newSpent;

                          setEditingItem({
                            ...editingItem,
                            timeSpentMinutes: newSpent,
                            departTime: toTimeString(newDepMin),
                            timeError: null,
                          });
                        }}
                        className="w-28 px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#234E42] text-xs font-bold text-slate-900 bg-white"
                      />

                      <div className="flex items-center space-x-1 flex-1">
                        {[15, 30, 45, 60].map((mins) => (
                          <button
                            type="button"
                            key={mins}
                            onClick={() => {
                              const arrMin = toMinutes(editingItem.arrivalTime);
                              const newDepMin = arrMin + mins;
                              setEditingItem({
                                ...editingItem,
                                timeSpentMinutes: mins,
                                departTime: toTimeString(newDepMin),
                                timeError: null,
                              });
                            }}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                              editingItem.timeSpentMinutes === mins
                                ? 'bg-[#234E42] text-white border-[#234E42]'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Depart Time
                    </label>
                    <input
                      type="time"
                      value={editingItem.departTime}
                      onChange={(e) => {
                        const newDepStr = e.target.value;
                        const newDepMin = toMinutes(newDepStr);
                        const arrMin = toMinutes(editingItem.arrivalTime);

                        if (newDepMin <= arrMin) {
                          setEditingItem({
                            ...editingItem,
                            departTime: newDepStr,
                            timeSpentMinutes: 0,
                            timeError: 'Departure cannot be earlier than or equal to arrival time!',
                          });
                        } else {
                          const updatedSpent = newDepMin - arrMin;
                          setEditingItem({
                            ...editingItem,
                            departTime: newDepStr,
                            timeSpentMinutes: updatedSpent,
                            timeError: null,
                          });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-bold bg-white focus:ring-2 focus:ring-[#234E42] ${
                        editingItem.timeError
                          ? 'border-rose-400 text-rose-700 ring-1 ring-rose-300'
                          : 'border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {editingItem.timeError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{editingItem.timeError}</span>
                    </div>
                  )}
                </div>

                {/* Hard Times Lock */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Set as Hard Time Stop</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Protects slot from cascading</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(['none', 'arrival', 'departure'] as const).map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setEditingItem({ ...editingItem, hardTime: opt })}
                        className={`py-1.5 rounded-xl font-bold text-[11px] capitalize border transition cursor-pointer ${
                          editingItem.hardTime === opt
                            ? 'bg-[#234E42] text-white border-[#234E42] shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Activity Type
                  </label>
                  <select
                    value={editingItem.activityType}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, activityType: e.target.value as ActivityType })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#234E42] text-xs font-medium bg-white"
                  >
                    <option value="sightseeing">Sightseeing / Viewpoint</option>
                    <option value="lodging">Hot Springs / Rest / Lodging</option>
                    <option value="hiking">Hiking / Walking Trail</option>
                    <option value="food">Food / Coffee / Bakery</option>
                    <option value="driving">Scenic Transit Drive</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={editingItem.notes}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, notes: e.target.value })
                    }
                    placeholder="Add details, tickets, parking instructions..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#234E42] text-xs"
                  ></textarea>
                </div>
              </div>

              <div className="p-4 bg-[#F4F6F0] border-t border-slate-200 flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={Boolean(editingItem.timeError)}
                  onClick={() => {
                    const finalItem: ItineraryItem = {
                      ...editingItem,
                      destination: editingItem.destination || 'Untitled Waypoint',
                      travelMinutes: parseMinutesFlexible(editingItem.travelMinutes),
                    };

                    if (isAddMode) {
                      const updatedList = [...itinerary, finalItem];
                      setItinerary(cascadeSchedule(finalItem, updatedList));
                    } else {
                      setItinerary((prev) => cascadeSchedule(finalItem, prev));
                    }
                    setEditingItem(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#234E42] hover:bg-[#1B3E34] disabled:opacity-50 text-white font-bold transition shadow-md shadow-[#234E42]/20 cursor-pointer"
                >
                  Save & Ripple
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Details Modal with Tags and Insights */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="relative h-44 w-full bg-slate-800">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.destination}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30"></div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center backdrop-blur-md transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase bg-[#234E42] px-2 py-0.5 rounded-md">
                    {selectedItem.activityType}
                  </span>
                  <h2 className="text-lg font-bold mt-1 leading-tight">{selectedItem.destination}</h2>
                </div>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Scheduled Window</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatTime12h(toMinutes(selectedItem.arrivalTime))} – {formatTime12h(toMinutes(selectedItem.departTime))}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Duration & Transit</span>
                    <span className="font-bold text-[#234E42] text-sm flex items-center justify-end space-x-1">
                      <span>{formatDurationWords(toMinutes(selectedItem.departTime) - toMinutes(selectedItem.arrivalTime))}</span>
                      {parseMinutesFlexible(selectedItem.travelMinutes) > 0 && (
                        <span className="text-slate-500 font-medium text-xs flex items-center space-x-1 ml-1">
                          <span>•</span>
                          <span>{parseMinutesFlexible(selectedItem.travelMinutes)}m {getTransitMeta(selectedItem.travelMode).label}</span>
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {selectedItem.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        selectedItem.address
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start space-x-2 text-slate-600 hover:text-[#234E42] group transition-colors cursor-pointer"
                    title="Open in Maps"
                  >
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="underline decoration-slate-300 underline-offset-2 group-hover:decoration-[#234E42]">
                      {selectedItem.address}
                    </span>
                  </a>
                )}

                {/* Display Tags */}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedItem.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold tracking-wide border border-slate-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {selectedItem.notes && (
                  <div>
                    <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-1">Notes</h4>
                    <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
                      {selectedItem.notes}
                    </p>
                  </div>
                )}

                {selectedItem.insights && selectedItem.insights.length > 0 && (
                  <div className="bg-[#EBF4EE] border border-[#234E42]/20 rounded-2xl p-3.5">
                    <div className="flex items-center space-x-1.5 text-[#1E4238] font-bold mb-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Field Insights</span>
                    </div>
                    <ul className="space-y-1 text-[#1E4238]">
                      {selectedItem.insights.map((ins, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#234E42] mt-1.5 shrink-0"></span>
                          <span>{ins}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="p-4 bg-[#F4F6F0] border-t border-slate-200 flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => {
                    const arrM = toMinutes(selectedItem.arrivalTime);
                    const depM = toMinutes(selectedItem.departTime);
                    setEditingItem({
                      ...selectedItem,
                      timeSpentMinutes: Math.max(1, depM - arrM),
                      travelMinutes: parseMinutesFlexible(selectedItem.travelMinutes),
                      travelMode: selectedItem.travelMode || 'drive',
                      timeError: null,
                    });
                    setIsAddMode(false);
                    setSelectedItem(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#234E42] hover:bg-[#1B3E34] text-white font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-[#234E42]/20 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Waypoint</span>
                </button>
                <button
                  onClick={() => {
                    setItinerary((prev) => prev.filter((it) => it.id !== selectedItem.id));
                    setSelectedItem(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-slate-900 text-sm">Display Preferences</h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">Show photo thumbnails in cards</span>
                      <span className="text-[11px] text-slate-500">Uncheck to display clean activity icons instead</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.preferImagesInCards}
                      onChange={(e) =>
                        setSettings({ ...settings, preferImagesInCards: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#234E42]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">Auto-Cascade downstream stops</span>
                      <span className="text-[11px] text-slate-500">Shifting a stop moves subsequent arrivals</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.cascadeDownstream}
                      onChange={(e) =>
                        setSettings({ ...settings, cascadeDownstream: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#234E42]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">Sunrise & sunset timeline blocks</span>
                      <span className="text-[11px] text-slate-500">Show golden dawn & dusk hours</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showSunriseSunset}
                      onChange={(e) =>
                        setSettings({ ...settings, showSunriseSunset: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#234E42]"
                    />
                  </label>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleRestoreDefaults}
                    className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset to Colorado Tour Defaults</span>
                  </button>

                  <button
                    onClick={() => setShowClearConfirmModal(true)}
                    className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Itinerary List</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#F4F6F0] border-t border-slate-200 shrink-0">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full py-2.5 bg-[#234E42] text-white rounded-xl font-bold shadow-md shadow-[#234E42]/20 hover:bg-[#1B3E34] transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 4: Sheet Sync Modal */}
        {showSyncModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#234E42]" />
                  <h3 className="font-bold text-slate-900 text-sm">Sync Google Sheet CSV</h3>
                </div>
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs overflow-y-auto">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Google Sheets Published CSV URL
                  </label>
                  <input
                    type="url"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#234E42] text-xs font-medium text-slate-900 bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Columns supported: date, arrivalTime, departTime, destination, address, travelMinutes, timeSpent, notes, travelMode, activityType, lat, lng, insights, tags, image, hardTime.
                  </span>
                </div>

                <button
                  onClick={handleSyncFromSheet}
                  disabled={isSyncing || !sheetUrl.trim()}
                  className="w-full py-2.5 bg-[#234E42] hover:bg-[#1B3E34] disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md shadow-[#234E42]/20 transition cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Downloading Sheet Data...' : 'Sync Itinerary Now'}</span>
                </button>

                {syncFeedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                      syncFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : syncFeedback.type === 'error'
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {syncFeedback.type === 'success' ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span className="font-medium leading-relaxed">{syncFeedback.message}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-[#F4F6F0] border-t border-slate-200 flex items-center justify-between shrink-0">
                <button
                  onClick={() => setSheetUrl(DEFAULT_SHEET_CSV_URL)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline"
                >
                  Reset Default URL
                </button>
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 5: Clear Confirm */}
        {showClearConfirmModal && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-5 space-y-4 border border-rose-100">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h3 className="font-bold text-slate-900 text-base">Clear Entire Itinerary?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to remove all {itinerary.length} waypoints? You can re-sync from your Google Sheet or reload the Colorado defaults anytime.
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => setShowClearConfirmModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClearItinerary}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 6: Calendar Day Picker */}
        {showCalendarPicker && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Select Trip Day</h3>
                <button
                  onClick={() => setShowCalendarPicker(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {tripDates.map((d) => {
                  const s = getSunDataForDate(d);
                  const isSelected = d === activeDate;
                  return (
                    <button
                      key={d}
                      onClick={() => {
                        setSelectedDate(d);
                        setShowCalendarPicker(false);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#234E42] text-white border-[#234E42] shadow-sm'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-sm block">{s.label}</span>
                        <span className={`text-[11px] ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          Sunrise {s.sunrise} • Sunset {s.sunset}
                        </span>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

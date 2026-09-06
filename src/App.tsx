import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Upload,
  Download,
  FileSpreadsheet,
  Trash2,
  Globe
} from 'lucide-react';

// Bed SVG Icon for lodging
const BedIcon = (props) => (
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
const getTransitMeta = (mode = 'drive') => {
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

const INITIAL_DATA = [
  // Day 1: Travel Day - Florida Departure to Denver Arrival
  {
    id: 'stop-1',
    date: '2026-09-18',
    destination: 'Palm Bay Home',
    address: 'Palm Bay, FL',
    arrivalTime: '08:30',
    departTime: '08:45',
    travelMinutes: 0,
    travelMode: 'drive',
    activityType: 'lodging',
    notes: 'Depart home, pack vehicle, proceed north on I-95 towards Orlando airport.',
    insights: ['Double-check boarding passes and travel IDs'],
    tags: ['Departure', 'FL'],
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80',
    hardTime: 'departure',
    lat: 28.0345,
    lng: -80.5887,
  },
  {
    id: 'stop-2',
    date: '2026-09-18',
    destination: 'Park N Go Orlando (MCO)',
    address: '6101 Cargo Rd, Orlando, FL',
    arrivalTime: '10:00',
    departTime: '10:30',
    travelMinutes: 75,
    travelMode: 'drive',
    activityType: 'driving',
    notes: 'Check-in vehicle, board terminal shuttle to Gate 3.',
    insights: ['Shuttle departs every 5 minutes to Terminal B'],
    tags: ['Airport', 'Transit'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    hardTime: 'arrival',
    lat: 28.4312,
    lng: -81.3081,
  },
  {
    id: 'stop-3',
    date: '2026-09-18',
    destination: 'Denver International Airport (DEN)',
    address: '8500 Peña Blvd, Denver, CO',
    arrivalTime: '14:50',
    departTime: '15:45',
    travelMinutes: 260,
    travelMode: 'fly',
    activityType: 'sightseeing',
    notes: 'Flight crosses into Mountain Time Zone (MDT). Collect baggage & rental car.',
    insights: ['MDT is 2 hours behind Eastern Time', 'Car rental shuttle is located on Level 5'],
    tags: ['Arrival', 'MDT', 'Flight'],
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    hardTime: 'arrival',
    lat: 39.8561,
    lng: -104.6737,
  },
  // Day 2: Wed Sep 23 - The San Juan Skyway & Telluride
  {
    id: 'stop-4',
    date: '2026-09-23',
    destination: 'The Bivvi Hostel Telluride',
    address: 'CO-145, Placerville, CO',
    arrivalTime: '07:00',
    departTime: '07:05',
    travelMinutes: 0,
    travelMode: 'drive',
    activityType: 'lodging',
    notes: 'Sunrise 6:23 AM MDT. Check out, load vehicle, depart east via CO-62.',
    insights: [
      'Expedited self-checkout available at front kiosk',
      'CO-62 can have morning black ice on north-facing curves'
    ],
    tags: ['Lodging', 'Check Out', 'MDT'],
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80',
    hardTime: 'departure',
    lat: 37.9711,
    lng: -108.0514,
  },
  {
    id: 'stop-5',
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
      'Designated paved pullout with room for 15 vehicles'
    ],
    tags: ['Scenic View', 'Photo Stop', 'MDT'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    hardTime: 'arrival',
    lat: 38.0964,
    lng: -107.8864,
  },
  {
    id: 'stop-6',
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
      'Free 2-hour diagonal parking along Main Street'
    ],
    tags: ['Breakfast', 'Victorian Town', 'Coffee'],
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80',
    hardTime: 'none',
    lat: 38.0228,
    lng: -107.6714,
  },
  {
    id: 'stop-7',
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
      'Suspended walkway can be wet near spray',
      'Park admission is $7/adult at visitor center'
    ],
    tags: ['Waterfall', 'Walkway', 'Gorge'],
    image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=400&q=80',
    hardTime: 'arrival',
    lat: 38.0189,
    lng: -107.6756,
  },
  {
    id: 'stop-8',
    date: '2026-09-23',
    destination: 'Cascade Falls Park',
    address: '8th Ave & 5th St, Ouray, CO',
    arrivalTime: '09:50',
    departTime: '10:30',
    travelMinutes: 5,
    travelMode: 'hike',
    activityType: 'hiking',
    notes: 'Short trail to base of 200-ft falls plunging down red rock amphitheater.',
    insights: ['Short 10-minute scramble to reach lower pool'],
    tags: ['Waterfall', 'Short Trail', 'MDT'],
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80',
    hardTime: 'none',
    lat: 38.0261,
    lng: -107.6656,
  },
  // Day 3: Thu Sep 24 - Million Dollar Highway
  {
    id: 'stop-9',
    date: '2026-09-24',
    destination: 'Ouray Hot Springs Pool',
    address: 'Ouray, CO',
    arrivalTime: '07:30',
    departTime: '08:15',
    travelMinutes: 0,
    travelMode: 'drive',
    activityType: 'lodging',
    notes: 'Thermal mineral pool soak with views of Mount Abrams.',
    insights: ['Lockers available with admission wristband'],
    tags: ['Hot Springs', 'Thermal'],
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=400&q=80',
    hardTime: 'departure',
    lat: 38.0294,
    lng: -107.6725,
  },
  {
    id: 'stop-10',
    date: '2026-09-24',
    destination: 'Million Dollar Highway Overlook',
    address: 'US-550, Red Mountain Pass, CO',
    arrivalTime: '08:45',
    departTime: '09:00',
    travelMinutes: 30,
    travelMode: 'drive',
    activityType: 'sightseeing',
    notes: 'Breathtaking alpine switchbacks, Idarado mine ruins, and red rock peaks.',
    insights: ['Elevation 11,018 ft; pullout accommodates 8 cars'],
    tags: ['Scenic Pass', 'US-550', 'MDT'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    hardTime: 'none',
    lat: 37.8986,
    lng: -107.7125,
  },
  {
    id: 'stop-11',
    date: '2026-09-24',
    destination: 'Silverton Historic Mining Town',
    address: 'Blair St, Silverton, CO',
    arrivalTime: '09:40',
    departTime: '10:35',
    travelMinutes: 40,
    travelMode: 'drive',
    activityType: 'food',
    notes: 'Historic mining settlement stroll; grab espresso and pastries.',
    insights: ['Narrow gauge steam train stops in town at 10:15 AM'],
    tags: ['Historic Town', 'Mining'],
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80',
    hardTime: 'none',
    lat: 37.8119,
    lng: -107.6645,
  },
];

// Checks if waypoint or address is located in Mountain Time (MDT)
const isLocationInMDT = (stopOrAddress) => {
  if (!stopOrAddress) return false;
  const str = typeof stopOrAddress === 'string'
    ? stopOrAddress.toLowerCase()
    : `${stopOrAddress.destination || ''} ${stopOrAddress.address || ''} ${stopOrAddress.notes || ''} ${(stopOrAddress.tags || []).join(' ')}`.toLowerCase();

  // Keyword markers for Colorado/Mountain time
  const mdtKeywords = [' co', ', co', 'colorado', 'denver', 'telluride', 'ouray', 'silverton', 'placerville', 'durango', 'sneffels', 'mdt', 'mountain time'];
  if (mdtKeywords.some((k) => str.includes(k))) return true;

  // Coordinate check (Colorado approx: Lat 37N-41N, Lng 102W-109W)
  if (typeof stopOrAddress === 'object' && stopOrAddress.lng) {
    if (stopOrAddress.lng <= -102 && stopOrAddress.lng >= -114) {
      return true;
    }
  }
  return false;
};

// Gets browser's native timezone offset in hours (e.g. -4 for EDT, -5 for EST)
const getBrowserUtcOffsetHours = () => {
  return -(new Date().getTimezoneOffset() / 60);
};

// Returns user's short browser timezone name (e.g. 'EDT', 'EST', 'CDT', 'PDT')
const getBrowserTimezoneAbbr = () => {
  try {
    const dString = new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' });
    const parts = dString.split(' ');
    return parts[parts.length - 1] || 'Local';
  } catch {
    return 'Local';
  }
};

// Detects timezone for a stop or collection of stops on a day
const resolveDayTimezone = (dayStops) => {
  if (!dayStops || dayStops.length === 0) {
    return {
      name: 'MDT',
      offsetHours: -6,
      isMDT: true,
      label: 'MDT (UTC-6)',
      defaultLat: 38.0285,
      defaultLng: -107.6714,
    };
  }

  // If any stop on this day is in MDT, prioritize MDT
  const hasMDTStop = dayStops.some((s) => isLocationInMDT(s));
  if (hasMDTStop) {
    const mdtStop = dayStops.find((s) => isLocationInMDT(s));
    return {
      name: 'MDT',
      offsetHours: -6,
      isMDT: true,
      label: 'MDT (UTC-6)',
      defaultLat: mdtStop?.lat || 38.0285,
      defaultLng: mdtStop?.lng || -107.6714,
    };
  }

  // Fallback to local browser location & offset
  const firstStop = dayStops[0];
  const browserOffset = getBrowserUtcOffsetHours();
  const browserAbbr = getBrowserTimezoneAbbr();
  return {
    name: browserAbbr,
    offsetHours: browserOffset,
    isMDT: false,
    label: `${browserAbbr} (Browser)`,
    defaultLat: firstStop?.lat || 28.5383,
    defaultLng: firstStop?.lng || -81.3792,
  };
};

// Solar Calculation (sunrise and sunset) for any coordinate & timezone offset
function calculateSolarTimes(
  dateStr,
  lat = 39.7392,
  lng = -104.9903,
  targetTimezoneOffsetHours = -6
) {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const startOfYear = new Date(Date.UTC(year, 0, 0));
    const diff = date.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

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

    const radLat = lat * (Math.PI / 180);
    const zenith = 90.833 * (Math.PI / 180);
    const cosHA =
      Math.cos(zenith) / (Math.cos(radLat) * Math.cos(decl)) -
      Math.tan(radLat) * Math.tan(decl);

    if (cosHA > 1 || cosHA < -1) {
      return { sunrise: '06:45 AM', sunset: '07:05 PM', sunriseMin: 405, sunsetMin: 1145 };
    }

    const ha = Math.acos(cosHA) * (180 / Math.PI);
    const sunriseUtcMinutes = 720 - 4 * (lng + ha) - eqtime;
    const sunsetUtcMinutes = 720 - 4 * (lng - ha) - eqtime;

    const sunriseLocal = Math.round(sunriseUtcMinutes + targetTimezoneOffsetHours * 60);
    const sunsetLocal = Math.round(sunsetUtcMinutes + targetTimezoneOffsetHours * 60);

    return {
      sunrise: formatTime12h(sunriseLocal),
      sunset: formatTime12h(sunsetLocal),
      sunriseMin: sunriseLocal,
      sunsetMin: sunsetLocal,
    };
  } catch {
    return { sunrise: '06:30 AM', sunset: '07:05 PM', sunriseMin: 390, sunsetMin: 1145 };
  }
}

const toMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const toTimeString = (min) => {
  const norm = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const formatTime12h = (min) => {
  const norm = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
};

const formatDurationColon = (min) => {
  if (min < 0) return '0:00';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
};

const formatDurationWords = (min) => {
  if (min <= 0) return '0 min';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m > 0 ? `${m}m` : ''}`.trim();
};

const formatDateDisplay = (dateStr) => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return dateStr;
  }
};

const normalizeTimeTo24h = (raw, fallback = '08:00') => {
  if (!raw || typeof raw !== 'string') return fallback;
  const str = raw.trim().toUpperCase();

  const ampmMatch = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2];
    const isPM = ampmMatch[3].toUpperCase() === 'PM';
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  const standardMatch = str.match(/^(\d{1,2}):(\d{2})/);
  if (standardMatch) {
    const hours = parseInt(standardMatch[1], 10);
    const minutes = standardMatch[2];
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  return fallback;
};

const parseFlexibleMinutes = (raw) => {
  if (!raw) return 0;
  const str = raw.toString().trim();
  if (str.includes(':')) {
    const parts = str.split(':').map(Number);
    if (parts.length >= 2) {
      return (parts[0] || 0) * 60 + (parts[1] || 0);
    }
  }
  const num = parseInt(str.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

const normalizeDateToISO = (raw, fallbackYear = 2026) => {
  if (!raw) return `${fallbackYear}-09-18`;
  const str = raw.trim();

  const isoMatch = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];

  const slashMatch = str.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (slashMatch) {
    const month = parseInt(slashMatch[1], 10).toString().padStart(2, '0');
    const day = parseInt(slashMatch[2], 10).toString().padStart(2, '0');
    let year = slashMatch[3] ? parseInt(slashMatch[3], 10) : fallbackYear;
    if (year < 100) year += 2000;
    return `${year}-${month}-${day}`;
  }

  return `${fallbackYear}-09-18`;
};

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0]
    .split(',')
    .map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase().replace(/[\s_-]/g, ''));
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;

    const row = [];
    let insideQuote = false;
    let entry = '';

    for (let charIdx = 0; charIdx < rawLine.length; charIdx++) {
      const c = rawLine[charIdx];
      if (c === '"') {
        insideQuote = !insideQuote;
      } else if (c === ',' && !insideQuote) {
        row.push(entry.trim().replace(/^["']|["']$/g, ''));
        entry = '';
      } else {
        entry += c;
      }
    }
    row.push(entry.trim().replace(/^["']|["']$/g, ''));

    const obj = {};
    headers.forEach((hdr, idx) => {
      obj[hdr] = row[idx] || '';
    });
    results.push(obj);
  }
  return results;
}

export default function App() {
  // Persistence with LocalStorage
  const [itinerary, setItinerary] = useState(() => {
    try {
      const cached = localStorage.getItem('trailsync_itinerary_data');
      return cached ? JSON.parse(cached) : INITIAL_DATA;
    } catch {
      return INITIAL_DATA;
    }
  });

  const [sheetUrl, setSheetUrl] = useState(() => {
    return (
      localStorage.getItem('trailsync_sheet_url') ||
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vRnbvJS7yfpExgR8hWefk4FJWaeRyh52q03uZs7hopOvFnsJoveg8O_FUYPABojI9Fn0bjRSySwdoyY/pub?gid=1559519314&single=true&output=csv'
    );
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('trailsync_settings');
      return saved
        ? JSON.parse(saved)
        : {
            preferImagesInCards: true,
            cascadeDownstream: true,
            showSunriseSunset: true,
            showLiveTimeline: true,
          };
    } catch {
      return {
        preferImagesInCards: true,
        cascadeDownstream: true,
        showSunriseSunset: true,
        showLiveTimeline: true,
      };
    }
  });

  const fileInputRef = useRef(null);

  // Derive unique trip dates
  const tripDates = useMemo(() => {
    const dates = Array.from(new Set(itinerary.map((it) => it.date))).sort();
    return dates.length > 0 ? dates : ['2026-09-23'];
  }, [itinerary]);

  // Default to Wed Sep 23 (or first available date)
  const [selectedDate, setSelectedDate] = useState(() => {
    return tripDates.includes('2026-09-23') ? '2026-09-23' : tripDates[0] || '2026-09-18';
  });

  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('trailsync_itinerary_data', JSON.stringify(itinerary));
  }, [itinerary]);

  useEffect(() => {
    localStorage.setItem('trailsync_sheet_url', sheetUrl);
  }, [sheetUrl]);

  useEffect(() => {
    localStorage.setItem('trailsync_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!tripDates.includes(selectedDate)) {
      setSelectedDate(tripDates[0] || '2026-09-18');
    }
  }, [tripDates, selectedDate]);

  const currentDayItems = useMemo(() => {
    return itinerary
      .filter((item) => item.date === selectedDate)
      .sort((a, b) => toMinutes(a.arrivalTime) - toMinutes(b.arrivalTime));
  }, [itinerary, selectedDate]);

  // Dynamic Day Timezone: MDT (UTC-6) if location is in MDT/Colorado, otherwise fallback to local browser location
  const currentDayTz = useMemo(() => {
    return resolveDayTimezone(currentDayItems);
  }, [currentDayItems]);

  // Day Solar Times computed specifically for the waypoint's actual location & detected timezone
  const currentSun = useMemo(() => {
    const calc = calculateSolarTimes(
      selectedDate,
      currentDayTz.defaultLat,
      currentDayTz.defaultLng,
      currentDayTz.offsetHours
    );
    return {
      label: formatDateDisplay(selectedDate),
      sunrise: calc.sunrise,
      sunset: calc.sunset,
      sunriseMin: calc.sunriseMin,
      sunsetMin: calc.sunsetMin,
      tzName: currentDayTz.name,
      isMDT: currentDayTz.isMDT,
    };
  }, [selectedDate, currentDayTz]);

  const timelineStartMin = 6 * 60;
  const timelineEndMin = 21 * 60; // 9:00 PM
  const totalTimelineMinutes = timelineEndMin - timelineStartMin;
  const timelinePixelHeight = 720;
  const minToPx = (m) => ((m - timelineStartMin) / totalTimelineMinutes) * timelinePixelHeight;

  const overlaps = useMemo(() => {
    const conflicts = [];
    for (let i = 0; i < currentDayItems.length; i++) {
      for (let j = i + 1; j < currentDayItems.length; j++) {
        const a = currentDayItems[i];
        const b = currentDayItems[j];
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
    const set = new Set();
    overlaps.forEach((c) => {
      set.add(c.itemA.id);
      set.add(c.itemB.id);
    });
    return set;
  }, [overlaps]);

  const summaryStats = useMemo(() => {
    let totalDriveMin = 0;
    let totalHikeTransitMin = 0;
    let totalBikeTransitMin = 0;
    let totalFlyTransitMin = 0;
    let totalWalkHikingActivityMin = 0;
    let totalTimeSpentMin = 0;

    const activityMinutes = {
      driving: 0,
      hiking: 0,
      sightseeing: 0,
      food: 0,
      lodging: 0,
    };

    currentDayItems.forEach((item) => {
      const mode = item.travelMode || 'drive';
      const travelM = item.travelMinutes || 0;

      if (mode === 'drive') totalDriveMin += travelM;
      else if (mode === 'hike') totalHikeTransitMin += travelM;
      else if (mode === 'bike') totalBikeTransitMin += travelM;
      else if (mode === 'fly') totalFlyTransitMin += travelM;

      activityMinutes.driving += travelM;

      const spent = Math.max(0, toMinutes(item.departTime) - toMinutes(item.arrivalTime));
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
      totalActiveTime: totalActiveTime || 1,
    };
  }, [currentDayItems]);

  // Visual Activity Metadata
  const getActivityMeta = (type) => {
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
    const idx = tripDates.indexOf(selectedDate);
    if (idx > 0) setSelectedDate(tripDates[idx - 1]);
  };

  const handleNextDay = () => {
    const idx = tripDates.indexOf(selectedDate);
    if (idx < tripDates.length - 1) setSelectedDate(tripDates[idx + 1]);
  };

  const cascadeSchedule = (updatedItem, fullList) => {
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
        const prev = updatedDayItems[i - 1];
        const curr = updatedDayItems[i];

        const prevDepartMin = toMinutes(prev.departTime);
        const travelMin = curr.travelMinutes || 0;
        const projectedArrivalMin = prevDepartMin + travelMin;

        const currentDuration = Math.max(
          0,
          toMinutes(curr.departTime) - toMinutes(curr.arrivalTime)
        );

        if (curr.hardTime === 'arrival') {
          const fixedArrivalMin = toMinutes(curr.arrivalTime);
          const newDepart = fixedArrivalMin + currentDuration;
          updatedDayItems[i] = {
            ...curr,
            departTime: toTimeString(newDepart),
          };
        } else {
          const newArrivalMin = projectedArrivalMin;
          let newDepartMin = newArrivalMin + currentDuration;

          if (curr.hardTime === 'departure') {
            const fixedDepartMin = toMinutes(curr.departTime);
            newDepartMin = Math.max(newArrivalMin, fixedDepartMin);
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

  const handleIngestRows = (rows) => {
    let lastValidDate = '2026-09-18';

    const formatted = rows
      .filter((r) => r.destination || r.location || r.stop)
      .map((r, idx) => {
        const destination = (r.destination || r.location || r.stop || `Stop ${idx + 1}`).trim();
        const address = (r.address || r.location || destination).trim();

        const rawDate = r.date || r.day || '';
        if (rawDate) {
          lastValidDate = normalizeDateToISO(rawDate);
        }
        const date = lastValidDate;

        const rawArr = r.arrivaltime || r.arrive || r.arrival || r.start || '08:00';
        const rawDep = r.departtime || r.depart || r.departure || r.end || '';
        const arrive = normalizeTimeTo24h(rawArr, '08:00');

        const hasExplicitTimeSpent = r.timespent !== undefined || r.duration !== undefined;
        const timeSpentMin = parseFlexibleMinutes(r.timespent || r.duration);

        let depart = '';
        if (rawDep) {
          depart = normalizeTimeTo24h(rawDep, arrive);
        } else if (hasExplicitTimeSpent) {
          const arrMin = toMinutes(arrive);
          depart = toTimeString(arrMin + timeSpentMin);
        } else {
          const arrMin = toMinutes(arrive);
          depart = toTimeString(arrMin + 15);
        }

        const travelMinutes = parseFlexibleMinutes(r.travelminutes || r.drive || r.traveltime);

        const modeVal = (r.travelmode || r.mode || '').toLowerCase();
        let travelMode = 'drive';
        if (['drive', 'hike', 'bike', 'fly'].includes(modeVal)) {
          travelMode = modeVal;
        } else if (
          destination.toLowerCase().includes('flight') ||
          destination.toLowerCase().includes('gate') ||
          destination.toLowerCase().includes('airport') ||
          (r.notes || '').toLowerCase().includes('flight')
        ) {
          travelMode = 'fly';
        }

        const rawType = (r.activitytype || r.type || '').toLowerCase();
        let activityType = 'sightseeing';
        const combined = (destination + ' ' + (r.notes || '')).toLowerCase();

        if (['lodging', 'sightseeing', 'hiking', 'food', 'driving'].includes(rawType)) {
          activityType = rawType;
        } else if (
          combined.includes('hostel') ||
          combined.includes('hotel') ||
          combined.includes('lodge') ||
          combined.includes('inn')
        ) {
          activityType = 'lodging';
        } else if (
          combined.includes('hike') ||
          combined.includes('trail') ||
          combined.includes('falls') ||
          combined.includes('gorge')
        ) {
          activityType = 'hiking';
        } else if (
          combined.includes('food') ||
          combined.includes('coffee') ||
          combined.includes('cafe') ||
          combined.includes('bakery') ||
          combined.includes('restaurant')
        ) {
          activityType = 'food';
        }

        const notes = r.notes || r.description || '';
        const insights = r.insights ? r.insights.split(/[|;]/).map((s) => s.trim()) : [];

        // Check if destination is in MDT
        const stopIsMDT = isLocationInMDT({ destination, address, notes });

        return {
          id: `stop-${date}-${idx}`,
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
          tags: [activityType.toUpperCase(), stopIsMDT ? 'MDT' : 'LOCAL'],
          image:
            r.image ||
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
          hardTime: r.hardtime || 'none',
          lat: parseFloat(r.lat || r.latitude || '0') || undefined,
          lng: parseFloat(r.lng || r.longitude || '0') || undefined,
        };
      });

    if (formatted.length > 0) {
      setItinerary(formatted);
      setSelectedDate(formatted[0].date);
      setSyncStatus(`Successfully loaded ${formatted.length} stops! Itinerary updated.`);
    } else {
      setSyncStatus('No valid stops found in the provided data.');
    }
  };

  const handleSyncUrl = async () => {
    if (!sheetUrl) return;
    setIsSyncing(true);
    setSyncStatus('Connecting to Google Sheets CSV...');
    try {
      const fetchUrl = sheetUrl.includes('?')
        ? `${sheetUrl}&_t=${Date.now()}`
        : `${sheetUrl}?_t=${Date.now()}`;
      const response = await fetch(fetchUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      const text = await response.text();
      const parsed = parseCSV(text);
      if (parsed.length === 0) throw new Error('CSV is empty or malformed.');
      handleIngestRows(parsed);
    } catch (err) {
      setSyncStatus(`Sync Failed: ${err.message}. Ensure sheet is published as CSV.`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (file.name.endsWith('.json')) {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            setItinerary(json);
            if (json[0]?.date) setSelectedDate(json[0].date);
            setSyncStatus(`Restored ${json.length} stops from JSON backup.`);
          } else if (json.itinerary) {
            setItinerary(json.itinerary);
            if (json.itinerary[0]?.date) setSelectedDate(json.itinerary[0].date);
            setSyncStatus('Restored complete itinerary workspace from backup.');
          }
        } else {
          const parsed = parseCSV(text);
          handleIngestRows(parsed);
        }
      } catch (err) {
        setSyncStatus(`Upload failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      itinerary,
      settings,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrailSync_Trip_${selectedDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenAddModal = () => {
    let defaultArrival = '11:00';
    let defaultDepart = '11:45';
    if (currentDayItems.length > 0) {
      const lastStop = currentDayItems[currentDayItems.length - 1];
      const nextArrMin = toMinutes(lastStop.departTime) + 15;
      defaultArrival = toTimeString(nextArrMin);
      defaultDepart = toTimeString(nextArrMin + 45);
    }

    setEditingItem({
      id: `stop-${Date.now()}`,
      date: selectedDate,
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
    const conflict = overlaps[0];
    const prevDepart = toMinutes(conflict.itemA.departTime);
    const itemBDuration = Math.max(0, toMinutes(conflict.itemB.departTime) - toMinutes(conflict.itemB.arrivalTime));
    const newArrival = prevDepart + (conflict.itemB.travelMinutes || 5);
    const newDepart = newArrival + itemBDuration;

    const resolvedItem = {
      ...conflict.itemB,
      arrivalTime: toTimeString(newArrival),
      departTime: toTimeString(newDepart),
    };

    setItinerary((prev) => cascadeSchedule(resolvedItem, prev));
  };

  return (
    <div className="min-h-screen bg-[#E5E9E2] text-slate-900 flex justify-center p-0 sm:p-4 font-sans antialiased selection:bg-[#234E42] selection:text-white">
      {/* Hidden File Input for CSV / JSON Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.json,text/csv,application/json"
        className="hidden"
      />

      {/* Mobile Shell Frame */}
      <div className="w-full max-w-md bg-[#F4F6F0] text-slate-900 shadow-2xl flex flex-col relative overflow-hidden sm:rounded-[42px] border-0 sm:border-8 sm:border-slate-800 h-[100dvh] sm:h-[870px]">
        
        {/* Status Bar */}
        <div className="bg-[#F4F6F0] px-6 pt-3 pb-1 flex items-center justify-between text-xs tracking-tight shrink-0 select-none">
          <span className="font-semibold text-sm text-slate-800">12:14</span>
          <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto hidden sm:block"></div>
          <div className="flex items-center space-x-1.5 text-slate-700">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
              {currentDayTz.name}
            </span>
            <div className="w-5 h-2.5 border border-slate-700 rounded-xs p-0.5 flex items-center">
              <div className="h-full w-3.5 bg-slate-900 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* STREAMLINED TOP HEADER */}
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
                title="Google Sheets & File Sync"
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
              {tripDates.length} Days • {itinerary.length} Total Waypoints
            </p>
          </div>

          {/* Date Selector Pill with Waypoint-Aware Sunrise & Sunset */}
          <div className="flex items-center space-x-2 mt-3.5">
            <button
              onClick={handlePrevDay}
              disabled={selectedDate === tripDates[0]}
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
                  <span className="flex items-center space-x-1 text-amber-700 font-semibold" title={`Sunrise in ${currentSun.tzName}`}>
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span>{currentSun.sunrise} {currentSun.tzName}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-indigo-700 font-semibold" title={`Sunset in ${currentSun.tzName}`}>
                    <Moon className="w-3 h-3 text-indigo-500" />
                    <span>{currentSun.sunset} {currentSun.tzName}</span>
                  </span>
                </div>
              </div>

              <div className="p-1 rounded-lg text-slate-400">
                <Calendar className="w-4 h-4 text-slate-600" />
              </div>
            </button>

            <button
              onClick={handleNextDay}
              disabled={selectedDate === tripDates[tripDates.length - 1]}
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

        {/* OVERLAP BANNER */}
        {overlaps.length > 0 && (
          <div className="mx-4 mb-2 bg-rose-50 border border-rose-200/90 rounded-2xl p-2.5 flex items-center justify-between text-xs text-rose-800 shadow-xs">
            <div className="flex items-center space-x-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div className="truncate">
                <span className="font-bold">Schedule Overlap:</span>{' '}
                <span className="text-rose-700">{overlaps[0].itemA.destination} & {overlaps[0].itemB.destination}</span>
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

        {/* ======================================================== */}
        {/* MAIN SCROLLABLE CONTENT                                  */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto relative bg-[#F4F6F0] px-4 pb-24">
          
          {/* VIEW 1: ITINERARY CARDS */}
          {activeTab === 'itinerary' && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs px-1 text-slate-500 font-semibold mb-2">
                <span>{currentDayItems.length} STOPS SCHEDULED</span>
                <span>{formatDurationWords(summaryStats.totalActiveTime)} Total Window</span>
              </div>

              {currentDayItems.map((item, index) => {
                const meta = getActivityMeta(item.activityType);
                const IconComponent = meta.icon;
                const isConflict = conflictingItemIds.has(item.id);
                const durationMin = Math.max(0, toMinutes(item.departTime) - toMinutes(item.arrivalTime));
                const travelMin = item.travelMinutes || 0;
                const transitMeta = getTransitMeta(item.travelMode);
                const TransitIcon = transitMeta.icon;
                const isItemMDT = isLocationInMDT(item);

                // Proportional bar calculation
                const maxScale = 90;
                const travelPct = Math.min(50, (travelMin / maxScale) * 100);
                const stayPct = Math.min(100 - travelPct, (Math.max(1, durationMin) / maxScale) * 100);

                return (
                  <React.Fragment key={item.id}>
                    {/* INTER-CARD TRAVEL CONNECTOR (Only display if > 0 minutes) */}
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

                    {/* MAIN WAYPOINT CARD */}
                    <div
                      onClick={() => setSelectedItem(item)}
                      className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs hover:shadow-md group ${
                        isConflict
                          ? 'border-rose-300 ring-2 ring-rose-400 bg-rose-50/40'
                          : 'border-slate-200/85 hover:border-[#234E42]/40'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Left Thumbnail / Activity Icon */}
                        <div
                          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl shrink-0 overflow-hidden flex items-center justify-center relative ${meta.bgSoft}`}
                        >
                          {settings.preferImagesInCards && item.image ? (
                            <img
                              src={item.image}
                              alt={item.destination}
                              className="w-full h-full object-cover rounded-2xl"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
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

                        {/* Middle & Right Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-800 text-sm tracking-tight">
                                {formatTime12h(toMinutes(item.arrivalTime))} – {formatTime12h(toMinutes(item.departTime))}
                              </span>
                              {isItemMDT ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200">
                                  MDT
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  {currentDayTz.name}
                                </span>
                              )}
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
                            {item.address || 'Waypoint Location'}
                          </p>

                          {/* Activity Type Badge + Duration Here */}
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

                          {/* Dual-colored Mini Gantt Bar */}
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

                          {/* Overlap notice */}
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

          {/* VIEW 2: GANTT TIMELINE VIEW */}
          {activeTab === 'gantt' && (
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
                      <span>Sunrise {currentSun.sunrise} {currentSun.tzName}</span>
                    </span>
                  </div>
                )}

                {/* Sunset Shading */}
                {settings.showSunriseSunset && currentSun.sunsetMin < timelineEndMin && (
                  <div
                    className="absolute left-0 right-0 bottom-0 bg-indigo-950/10 border-t border-indigo-300 pointer-events-none z-1 flex items-start px-3 pt-1"
                    style={{
                      top: `${minToPx(currentSun.sunsetMin)}px`,
                      height: `${minToPx(timelineEndMin) - minToPx(currentSun.sunsetMin)}px`,
                    }}
                  >
                    <span className="text-[10px] font-semibold text-indigo-800 bg-indigo-100 px-1.5 py-0.5 rounded flex items-center space-x-1">
                      <Moon className="w-3 h-3 text-indigo-600" />
                      <span>Sunset {currentSun.sunset} {currentSun.tzName}</span>
                    </span>
                  </div>
                )}

                {/* Hour Grid Lines */}
                {Array.from({ length: 16 }).map((_, idx) => {
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

                {/* Gantt Activity Blocks with transit-aware connectors */}
                {currentDayItems.map((item, index) => {
                  const itemArrival = toMinutes(item.arrivalTime);
                  const itemDepart = toMinutes(item.departTime);
                  const topPx = minToPx(itemArrival);
                  const duration = Math.max(12, itemDepart - itemArrival);
                  const heightPx = Math.max(38, (duration / totalTimelineMinutes) * timelinePixelHeight);

                  const meta = getActivityMeta(item.activityType);
                  const Icon = meta.icon;
                  const isConflict = conflictingItemIds.has(item.id);
                  const transitMeta = getTransitMeta(item.travelMode);
                  const TransitIcon = transitMeta.icon;

                  const prevStop = index > 0 ? currentDayItems[index - 1] : null;
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
                        {item.travelMinutes > 0 && connHeight > 18 && (
                          <div className="ml-2 bg-white text-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-300 shadow-2xs flex items-center space-x-1">
                            <TransitIcon className={`w-2.5 h-2.5 ${transitMeta.color}`} />
                            <span>{item.travelMinutes}m {transitMeta.label}</span>
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
                            : 'bg-white border border-slate-200 text-slate-800'
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

          {/* VIEW 3: SUMMARY VIEW */}
          {activeTab === 'summary' && (
            <div className="pt-2 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {currentSun.label} Driving & Activity Metrics
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EBF4EE] text-[#1E4238]">
                    {currentDayTz.label}
                  </span>
                </div>
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

        {/* FLOATING ACTION BUTTON (+) */}
        <button
          onClick={handleOpenAddModal}
          className="absolute right-4 bottom-16 z-30 w-13 h-13 rounded-full bg-[#234E42] text-white shadow-xl shadow-[#234E42]/40 hover:bg-[#1B3E34] active:scale-95 transition-all flex items-center justify-center cursor-pointer border-2 border-white"
          title="Add Stop to Itinerary"
        >
          <Plus className="w-7 h-7" />
        </button>

        {/* BOTTOM NAVIGATION DOCK */}
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
            onClick={() => setShowSyncModal(true)}
            className="flex flex-col items-center space-y-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="text-[10px]">Sync</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* MODAL 1: ADD / EDIT WITH TRANSIT SELECTOR & SYNC         */}
        {/* ======================================================== */}
        {editingItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
              
              <div className="px-5 py-3.5 bg-[#F4F6F0] border-b border-slate-200 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {isAddMode ? 'Add Itinerary Entry' : 'Edit Itinerary Entry'}
                  </h3>
                  <span className="text-[10px] text-slate-500">{currentSun.label} • {currentDayTz.name}</span>
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
                    placeholder="e.g. Denver International Airport"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#234E42] text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Address / Highway
                  </label>
                  <input
                    type="text"
                    value={editingItem.address}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, address: e.target.value })
                    }
                    placeholder="e.g. Denver, CO"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#234E42] text-xs text-slate-900"
                  />
                </div>

                {/* TRANSIT MODE & TRAVEL TIME SECTION */}
                <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-[#234E42]/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#1E4238] flex items-center space-x-1.5">
                      <span>Travel Mode from Previous Stop</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">Select transit type</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'drive', label: 'Drive', icon: Car },
                      { id: 'hike', label: 'Hike', icon: Footprints },
                      { id: 'bike', label: 'Bike', icon: Bike },
                      { id: 'fly', label: 'Fly', icon: Plane },
                    ].map((mode) => {
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
                        value={editingItem.travelMinutes}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          setEditingItem({ ...editingItem, travelMinutes: Math.max(0, val) });
                        }}
                        className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#234E42] text-xs font-bold text-slate-900 bg-white text-center"
                      />
                      <span className="text-slate-600 font-medium">min</span>
                    </div>
                  </div>
                </div>

                {/* BIDIRECTIONAL TIME SECTION */}
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
                        const spent = editingItem.timeSpentMinutes ?? 30;
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
                        Time Spent At Stop (Minutes)
                      </label>
                      <span className="text-slate-500 font-bold">
                        {formatDurationWords(editingItem.timeSpentMinutes ?? 0)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="720"
                        value={editingItem.timeSpentMinutes ?? ''}
                        onChange={(e) => {
                          const newSpent = parseInt(e.target.value, 10);
                          if (isNaN(newSpent) || newSpent < 0) {
                            setEditingItem({
                              ...editingItem,
                              timeSpentMinutes: 0,
                              timeError: null,
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
                        {[0, 15, 30, 60].map((mins) => (
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

                        if (newDepMin < arrMin) {
                          setEditingItem({
                            ...editingItem,
                            departTime: newDepStr,
                            timeSpentMinutes: 0,
                            timeError: 'Departure cannot be earlier than arrival time!',
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
                    {['none', 'arrival', 'departure'].map((opt) => (
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
                      setEditingItem({ ...editingItem, activityType: e.target.value })
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
                    const finalItem = {
                      ...editingItem,
                      destination: editingItem.destination || 'Untitled Waypoint',
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

        {/* ======================================================== */}
        {/* MODAL 2: CARD DETAIL INSPECTION (Bottom Sheet)           */}
        {/* ======================================================== */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
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
                {/* Time, Duration & Transit Mode */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Scheduled Window</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatTime12h(toMinutes(selectedItem.arrivalTime))} – {formatTime12h(toMinutes(selectedItem.departTime))}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                      {isLocationInMDT(selectedItem) ? 'Mountain Time (MDT)' : `Local (${currentDayTz.name})`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Duration & Transit</span>
                    <span className="font-bold text-[#234E42] text-sm flex items-center justify-end space-x-1">
                      <span>{formatDurationWords(Math.max(0, toMinutes(selectedItem.departTime) - toMinutes(selectedItem.arrivalTime)))}</span>
                      {selectedItem.travelMinutes > 0 && (
                        <span className="text-slate-500 font-medium text-xs flex items-center space-x-1 ml-1">
                          <span>•</span>
                          <span>{selectedItem.travelMinutes}m {getTransitMeta(selectedItem.travelMode).label}</span>
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {selectedItem.address && (
                  <div className="flex items-start space-x-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{selectedItem.address}</span>
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
                      timeSpentMinutes: Math.max(0, depM - arrM),
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
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 3: SETTINGS & PREFERENCES                          */}
        {/* ======================================================== */}
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
                      <span className="text-[11px] text-slate-500">Waypoint-aware golden dawn & dusk shading</span>
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
                    onClick={handleExportBackup}
                    className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>Download JSON Backup</span>
                  </button>

                  <button
                    onClick={() => {
                      setItinerary(INITIAL_DATA);
                      setSelectedDate('2026-09-23');
                      setShowSettingsModal(false);
                    }}
                    className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset to Colorado Tour Defaults</span>
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

        {/* ======================================================== */}
        {/* MODAL 4: SYNC & CLOUD SPREADSHEET MANAGER                */}
        {/* ======================================================== */}
        {showSyncModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#234E42]" />
                  <h3 className="font-bold text-slate-900 text-sm">Sync Google Sheets & Files</h3>
                </div>
                <button onClick={() => setShowSyncModal(false)} className="p-1 text-slate-500 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Google Sheets Published CSV URL</label>
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/...output=csv"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#234E42]"
                />
                <button
                  onClick={handleSyncUrl}
                  disabled={isSyncing}
                  className="w-full mt-2 py-2.5 bg-[#234E42] text-white rounded-xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-sm hover:bg-[#1B3E34] transition"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Downloading Sheet...' : 'Sync From Published Sheet'}</span>
                </button>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <span className="font-bold text-slate-700 block mb-2">Upload or Download Itinerary</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-3 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#234E42]" />
                    <span>Upload File</span>
                  </button>
                  <button
                    onClick={handleExportBackup}
                    className="py-2.5 px-3 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>

              {syncStatus && (
                <div className="p-3 bg-[#EBF4EE] border border-[#234E42]/20 rounded-xl text-slate-800 leading-relaxed font-medium">
                  {syncStatus}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 5: DATE PICKER DRAWER                              */}
        {/* ======================================================== */}
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
                  const dayStops = itinerary.filter((it) => it.date === d);
                  const dayTz = resolveDayTimezone(dayStops);
                  const s = calculateSolarTimes(d, dayTz.defaultLat, dayTz.defaultLng, dayTz.offsetHours);
                  const isSelected = d === selectedDate;

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
                        <span className="font-bold text-sm block">{formatDateDisplay(d)}</span>
                        <span className={`text-[11px] ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          Sunrise {s.sunrise} {dayTz.name} • Sunset {s.sunset} {dayTz.name}
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

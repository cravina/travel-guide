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
  Download,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';

const BedIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </svg>
);

export interface ItineraryStop {
  id: string;
  date: string;
  destination: string;
  address: string;
  arrivalTime: string;
  departTime: string;
  travelMinutes: number;
  travelMode: 'drive' | 'hike' | 'bike' | 'fly';
  activityType: 'lodging' | 'sightseeing' | 'hiking' | 'food' | 'driving';
  notes: string;
  insights: string[];
  tags: string[];
  image: string;
  hardTime: 'none' | 'arrival' | 'departure';
  lat?: number;
  lng?: number;
}

export interface DaySunData {
  label: string;
  sunrise: string;
  sunset: string;
  sunriseMin: number;
  sunsetMin: number;
  isManual?: boolean;
}

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
        label: 'fly',
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

const INITIAL_DATA: ItineraryStop[] = [
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
    insights: ['Expedited self-checkout available at front kiosk'],
    tags: ['Lodging'],
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80',
    hardTime: 'departure',
    lat: 37.9375,
    lng: -107.8123,
  },
  {
    id: 'stop-2',
    date: '2026-09-23',
    destination: 'Dallas Divide Summit Overlook (CO-62)',
    address: 'CO-62, Telluride, CO',
    arrivalTime: '07:23',
    departTime: '07:33',
    travelMinutes: 18,
    travelMode: 'drive',
    activityType: 'sightseeing',
    notes: 'Classic panoramic photo stop; view Mount Sneffels range and golden fall aspens.',
    insights: ['Prime golden morning light hits Mount Sneffels (7:00–9:00 AM)'],
    tags: ['Scenic View'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    hardTime: 'arrival',
    lat: 38.0833,
    lng: -107.8833,
  },
  {
    id: 'stop-3',
    date: '2026-09-23',
    destination: 'Ouray, CO - Historic Main Street',
    address: 'Main St, Ouray, CO',
    arrivalTime: '08:01',
    departTime: '08:40',
    travelMinutes: 28,
    travelMode: 'drive',
    activityType: 'food',
    notes: 'Stroll Victorian district; grab morning coffee and artisan pastries.',
    insights: ['Artisan Bakery opens early at 7:00 AM'],
    tags: ['Food', 'Coffee'],
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80',
    hardTime: 'none',
    lat: 38.0228,
    lng: -107.6715,
  },
  {
    id: 'stop-4',
    date: '2026-09-23',
    destination: 'Box Cañon Falls Park (Ouray)',
    address: 'Ouray, CO',
    arrivalTime: '08:45',
    departTime: '09:45',
    travelMinutes: 5,
    travelMode: 'drive',
    activityType: 'hiking',
    notes: 'Walk suspended metal walkway into 285-ft canyon waterfall; High Bridge overlook.',
    insights: ['Admission accepted at visitor center'],
    tags: ['Waterfall', 'Hike'],
    image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=400&q=80',
    hardTime: 'none',
    lat: 38.0195,
    lng: -107.6784,
  }
];

const toMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const toTimeString = (min: number): string => {
  const norm = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const formatTime12h = (min: number): string => {
  const norm = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
};

const formatDurationWords = (min: number): string => {
  if (min <= 0) return '0 min';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m > 0 ? `${m}m` : ''}`.trim();
};

const formatDateDisplay = (dateStr: string): string => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

// Flexible Time normalizer: Converts "7:00 AM", "07:23 AM", "14:30", "7:00" -> "07:00" (24h)
const normalizeTimeTo24h = (raw: string, fallback = '08:00'): string => {
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

// Flexible duration parser: Handles "0:18", "1:00", "18", "18m", "18 min" -> returns minutes
const parseFlexibleMinutes = (raw: string): number => {
  if (!raw) return 0;
  const str = raw.toString().trim();
  if (str.includes(':')) {
    const [h, m] = str.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }
  const num = parseInt(str.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

// Converts "Wed 9/23", "9/23", or "2026-09-23" -> ISO "2026-09-23"
const normalizeDateToISO = (raw: string, fallbackYear = 2026): string => {
  if (!raw) return `${fallbackYear}-09-23`;
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

  return `${fallbackYear}-09-23`;
};

// NOAA Solar Calculation
function calculateSolarTimes(dateStr: string, lat = 38.0, lng = -107.7): { sunrise: string; sunset: string; sunriseMin: number; sunsetMin: number } {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const startOfYear = new Date(year, 0, 0);
    const diff = date.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);
    const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma);

    const radLat = lat * (Math.PI / 180);
    const zenith = 90.833 * (Math.PI / 180);
    const cosHA = (Math.cos(zenith) / (Math.cos(radLat) * Math.cos(decl))) - (Math.tan(radLat) * Math.tan(decl));

    if (cosHA > 1 || cosHA < -1) {
      return { sunrise: '06:30 AM', sunset: '07:00 PM', sunriseMin: 390, sunsetMin: 1140 };
    }

    const ha = Math.acos(cosHA) * (180 / Math.PI);
    const timezoneOffsetHours = -date.getTimezoneOffset() / 60;

    const sunriseUtcMinutes = 720 - 4 * (lng + ha) - eqtime;
    const sunsetUtcMinutes = 720 - 4 * (lng - ha) - eqtime;

    const sunriseLocal = Math.round(sunriseUtcMinutes + timezoneOffsetHours * 60);
    const sunsetLocal = Math.round(sunsetUtcMinutes + timezoneOffsetHours * 60);

    return {
      sunrise: formatTime12h(sunriseLocal),
      sunset: formatTime12h(sunsetLocal),
      sunriseMin: sunriseLocal,
      sunsetMin: sunsetLocal,
    };
  } catch {
    return { sunrise: '06:30 AM', sunset: '07:00 PM', sunriseMin: 390, sunsetMin: 1140 };
  }
}

// Robust CSV Line Parser
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;

    const row: string[] = [];
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

    const obj: Record<string, string> = {};
    headers.forEach((hdr, idx) => {
      obj[hdr] = row[idx] || '';
    });
    results.push(obj);
  }
  return results;
}

export default function App() {
  const [itinerary, setItinerary] = useState<ItineraryStop[]>(() => {
    try {
      const cached = localStorage.getItem('trailsync_itinerary_data');
      return cached ? JSON.parse(cached) : INITIAL_DATA;
    } catch {
      return INITIAL_DATA;
    }
  });

  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    return (
      localStorage.getItem('trailsync_sheet_url') ||
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vRnbvJS7yfpExgR8hWefk4FJWaeRyh52q03uZs7hopOvFnsJoveg8O_FUYPABojI9Fn0bjRSySwdoyY/pub?gid=1559519314&single=true&output=csv'
    );
  });

  const [customSun, setCustomSun] = useState<Record<string, DaySunData>>(() => {
    try {
      const cached = localStorage.getItem('trailsync_solar_overrides');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('trailsync_settings');
      return saved ? JSON.parse(saved) : {
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

  const [activeTab, setActiveTab] = useState<'itinerary' | 'gantt' | 'summary'>('itinerary');
  const [selectedItem, setSelectedItem] = useState<ItineraryStop | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [showSunEditModal, setShowSunEditModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const tripDates = useMemo(() => {
    const dates = Array.from(new Set(itinerary.map((it) => it.date))).sort();
    return dates.length > 0 ? dates : ['2026-09-23'];
  }, [itinerary]);

  const [selectedDate, setSelectedDate] = useState<string>(() => tripDates[0]);

  useEffect(() => {
    if (!tripDates.includes(selectedDate)) {
      setSelectedDate(tripDates[0] || '2026-09-23');
    }
  }, [tripDates, selectedDate]);

  useEffect(() => {
    localStorage.setItem('trailsync_itinerary_data', JSON.stringify(itinerary));
  }, [itinerary]);

  useEffect(() => {
    localStorage.setItem('trailsync_sheet_url', sheetUrl);
  }, [sheetUrl]);

  useEffect(() => {
    localStorage.setItem('trailsync_solar_overrides', JSON.stringify(customSun));
  }, [customSun]);

  useEffect(() => {
    localStorage.setItem('trailsync_settings', JSON.stringify(settings));
  }, [settings]);

  const currentSun: DaySunData = useMemo(() => {
    if (customSun[selectedDate]) {
      return customSun[selectedDate];
    }
    const dayStops = itinerary.filter((it) => it.date === selectedDate);
    const avgLat = dayStops.find((s) => s.lat)?.lat || 38.0;
    const avgLng = dayStops.find((s) => s.lng)?.lng || -107.7;
    const calc = calculateSolarTimes(selectedDate, avgLat, avgLng);
    return {
      label: formatDateDisplay(selectedDate),
      sunrise: calc.sunrise,
      sunset: calc.sunset,
      sunriseMin: calc.sunriseMin,
      sunsetMin: calc.sunsetMin,
      isManual: false,
    };
  }, [selectedDate, itinerary, customSun]);

  const timelineStartMin = 6 * 60;
  const timelineEndMin = 18 * 60;
  const totalTimelineMinutes = timelineEndMin - timelineStartMin;
  const timelinePixelHeight = 760;
  const minToPx = (m: number) => ((m - timelineStartMin) / totalTimelineMinutes) * timelinePixelHeight;

  const currentDayItems = useMemo(() => {
    return itinerary
      .filter((item) => item.date === selectedDate)
      .sort((a, b) => toMinutes(a.arrivalTime) - toMinutes(b.arrivalTime));
  }, [itinerary, selectedDate]);

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
    const set = new Set<string>();
    overlaps.forEach((c) => {
      set.add(c.itemA.id);
      set.add(c.itemB.id);
    });
    return set;
  }, [overlaps]);

  const summaryStats = useMemo(() => {
    let totalDriveMin = 0;
    let totalHikeTransitMin = 0;
    let totalTimeSpentMin = 0;
    const activityMinutes: Record<string, number> = {
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
      if (mode === 'hike') totalHikeTransitMin += travelM;

      activityMinutes.driving += travelM;

      const spent = Math.max(0, toMinutes(item.departTime) - toMinutes(item.arrivalTime));
      totalTimeSpentMin += spent;

      if (activityMinutes[item.activityType] !== undefined) {
        activityMinutes[item.activityType] += spent;
      } else {
        activityMinutes[item.activityType] = spent;
      }
    });

    const totalActiveTime = totalDriveMin + totalHikeTransitMin + totalTimeSpentMin;
    return {
      totalDriveMin,
      totalHikeTransitMin,
      totalTimeSpentMin,
      activityMinutes,
      totalActiveTime: totalActiveTime || 1,
    };
  }, [currentDayItems]);

  const getActivityMeta = (type: string) => {
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
          label: 'Transit',
          icon: Car,
          bgSoft: 'bg-emerald-50',
          iconColor: 'text-[#234E42]',
          stayBarColor: 'bg-[#234E42]',
          travelBarColor: 'bg-emerald-200',
        };
    }
  };

  const cascadeSchedule = (updatedItem: ItineraryStop, fullList: ItineraryStop[]) => {
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
        const currentDuration = Math.max(5, toMinutes(curr.departTime) - toMinutes(curr.arrivalTime));

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

  // Explicit Google Sheets Parsing
  const handleIngestRows = (rows: Record<string, string>[]) => {
    let lastValidDate = '2026-09-23';

    const formatted: ItineraryStop[] = rows
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
        let depart = normalizeTimeTo24h(rawDep, '');

        const timeSpentMin = parseFlexibleMinutes(r.timespent || r.duration);
        if (!depart || depart === arrive) {
          const arrMin = toMinutes(arrive);
          depart = toTimeString(arrMin + (timeSpentMin > 0 ? timeSpentMin : 30));
        }

        const travelMinutes = parseFlexibleMinutes(r.travelminutes || r.drive || r.traveltime);

        const modeVal = (r.travelmode || r.mode || 'drive').toLowerCase();
        const travelMode = ['drive', 'hike', 'bike', 'fly'].includes(modeVal) ? (modeVal as any) : 'drive';

        const rawType = (r.activitytype || r.type || '').toLowerCase();
        let activityType: 'lodging' | 'sightseeing' | 'hiking' | 'food' | 'driving' = 'sightseeing';
        const combinedContext = (destination + ' ' + (r.notes || '')).toLowerCase();

        if (['lodging', 'sightseeing', 'hiking', 'food', 'driving'].includes(rawType)) {
          activityType = rawType as any;
        } else if (combinedContext.includes('hostel') || combinedContext.includes('hotel') || combinedContext.includes('pool') || combinedContext.includes('hot springs')) {
          activityType = 'lodging';
        } else if (combinedContext.includes('falls') || combinedContext.includes('park') || combinedContext.includes('trail') || combinedContext.includes('hike')) {
          activityType = 'hiking';
        } else if (combinedContext.includes('street') || combinedContext.includes('coffee') || combinedContext.includes('pastries') || combinedContext.includes('bakery') || combinedContext.includes('food')) {
          activityType = 'food';
        }

        const notes = r.notes || r.description || '';
        const rawInsights = r.insights || r.highlights || '';
        const insights = rawInsights ? rawInsights.split(/[|;]/).map((s) => s.trim()) : [];

        return {
          id: r.id || `sheet-${idx}-${Date.now()}`,
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
          tags: [activityType.toUpperCase()],
          image: r.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
          hardTime: (r.hardtime || 'none') as any,
          lat: parseFloat(r.lat || r.latitude || '0') || undefined,
          lng: parseFloat(r.lng || r.longitude || '0') || undefined,
        };
      });

    if (formatted.length > 0) {
      setItinerary(formatted);
      setSelectedDate(formatted[0].date);
      setSyncStatus(`Successfully loaded ${formatted.length} stops!`);
    } else {
      setSyncStatus('No valid stops found in the provided sheet data.');
    }
  };

  const handleSyncUrl = async () => {
    if (!sheetUrl) return;
    setIsSyncing(true);
    setSyncStatus('Connecting to Google Sheets CSV...');
    try {
      const response = await fetch(sheetUrl);
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      const text = await response.text();
      const parsed = parseCSV(text);
      if (parsed.length === 0) throw new Error('CSV is empty or malformed.');
      handleIngestRows(parsed);
    } catch (err: any) {
      setSyncStatus(`Sync Failed: ${err.message}. Ensure sheet is published as CSV.`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            setItinerary(json);
            if (json[0]?.date) setSelectedDate(json[0].date);
            setSyncStatus(`Restored ${json.length} stops from JSON backup.`);
          } else if (json.itinerary) {
            setItinerary(json.itinerary);
            if (json.customSun) setCustomSun(json.customSun);
            setSyncStatus('Restored complete itinerary workspace from backup.');
          }
        } else {
          const parsed = parseCSV(text);
          handleIngestRows(parsed);
        }
      } catch (err: any) {
        setSyncStatus(`Upload failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      itinerary,
      customSun,
      settings,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrailSync_Backup_${selectedDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#E5E9E2] text-slate-900 flex justify-center p-0 sm:p-4 font-sans antialiased selection:bg-[#234E42] selection:text-white">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.json,text/csv,application/json"
        className="hidden"
      />

      <div className="w-full max-w-md bg-[#F4F6F0] text-slate-900 shadow-2xl flex flex-col relative overflow-hidden sm:rounded-[42px] border-0 sm:border-8 sm:border-slate-800 h-[100dvh] sm:h-[870px]">
        {/* Status Bar */}
        <div className="bg-[#F4F6F0] px-6 pt-3 pb-1 flex items-center justify-between text-xs tracking-tight shrink-0 select-none">
          <span className="font-semibold text-sm text-slate-800">12:14</span>
          <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto hidden sm:block"></div>
          <div className="flex items-center space-x-1.5 text-slate-700">
            <span className="text-[11px] font-bold">Offline Ready</span>
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
              <span className="font-serif font-bold text-lg text-[#1E4238] tracking-tight">TrailSync</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSyncModal(true)}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition shadow-2xs cursor-pointer"
                title="Sync Google Sheets / Upload"
              >
                <RefreshCw className="w-4 h-4 text-[#234E42]" />
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-2xs cursor-pointer"
                title="Settings & Export"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-3">
            <h1 className="font-serif text-2xl font-bold text-slate-900 leading-tight">Travel Guide & Gantt</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {tripDates.length} Days • {itinerary.length} Total Waypoints
            </p>
          </div>

          {/* Date Selector Pill */}
          <div className="flex items-center space-x-2 mt-3.5">
            <button
              onClick={() => {
                const idx = tripDates.indexOf(selectedDate);
                if (idx > 0) setSelectedDate(tripDates[idx - 1]);
              }}
              disabled={selectedDate === tripDates[0]}
              className="w-9 h-12 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center text-slate-700 shadow-2xs transition shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowCalendarPicker(true)}
              className="flex-1 h-12 bg-white rounded-2xl border border-slate-200 px-3.5 flex items-center justify-between text-left hover:border-[#234E42]/50 transition shadow-2xs cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">{currentSun.label}</span>
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-medium mt-0.5">
                  <span className="flex items-center space-x-1 text-amber-700 font-semibold">
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span>{currentSun.sunrise}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-indigo-700 font-semibold">
                    <Moon className="w-3 h-3 text-indigo-500" />
                    <span>{currentSun.sunset}</span>
                  </span>
                  {currentSun.isManual && (
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded">Manual</span>
                  )}
                </div>
              </div>
              <div className="p-1 rounded-lg text-slate-400">
                <Calendar className="w-4 h-4 text-slate-600" />
              </div>
            </button>

            <button
              onClick={() => {
                const idx = tripDates.indexOf(selectedDate);
                if (idx < tripDates.length - 1) setSelectedDate(tripDates[idx + 1]);
              }}
              disabled={selectedDate === tripDates[tripDates.length - 1]}
              className="w-9 h-12 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center text-slate-700 shadow-2xs transition shrink-0 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Segmented Tabs */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {(['itinerary', 'gantt', 'summary'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#234E42] text-white shadow-md shadow-[#234E42]/20'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab === 'gantt' ? 'Timeline' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Overlap Banner */}
        {overlaps.length > 0 && (
          <div className="mx-4 mb-2 bg-rose-50 border border-rose-200 rounded-2xl p-2.5 flex items-center justify-between text-xs text-rose-800 shadow-xs">
            <div className="flex items-center space-x-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div className="truncate">
                <span className="font-bold">Schedule Overlap:</span>{' '}
                <span className="text-rose-700">
                  {overlaps[0].itemA.destination} & {overlaps[0].itemB.destination}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const c = overlaps[0];
                const prevDep = toMinutes(c.itemA.departTime);
                const dur = Math.max(10, toMinutes(c.itemB.departTime) - toMinutes(c.itemB.arrivalTime));
                const newArr = prevDep + (c.itemB.travelMinutes || 5);
                const resolved = { ...c.itemB, arrivalTime: toTimeString(newArr), departTime: toTimeString(newArr + dur) };
                setItinerary((prev) => cascadeSchedule(resolved, prev));
              }}
              className="ml-2 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] shrink-0 transition cursor-pointer"
            >
              Auto Shift
            </button>
          </div>
        )}

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto relative bg-[#F4F6F0] px-4 pb-24">
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
                const durationMin = Math.max(1, toMinutes(item.departTime) - toMinutes(item.arrivalTime));
                const travelMin = item.travelMinutes || 0;
                const transitMeta = getTransitMeta(item.travelMode);
                const TransitIcon = transitMeta.icon;

                return (
                  <React.Fragment key={item.id}>
                    {index > 0 && travelMin > 0 && (
                      <div className="flex items-center space-x-2 py-1 pl-7 text-slate-600 text-xs font-medium">
                        <div className="w-0.5 h-6 bg-slate-300 ml-1.5 rounded-full"></div>
                        <div className="flex items-center space-x-1.5 bg-white text-slate-700 px-3 py-1 rounded-full text-[11px] font-semibold border border-slate-200 shadow-2xs">
                          <TransitIcon className={`w-3.5 h-3.5 ${transitMeta.color}`} />
                          <span>
                            {formatDurationWords(travelMin)} {transitMeta.label} to {item.destination}
                          </span>
                        </div>
                      </div>
                    )}

                    <div
                      onClick={() => setSelectedItem(item)}
                      className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                        isConflict ? 'border-rose-300 ring-2 ring-rose-400 bg-rose-50/40' : 'border-slate-200 hover:border-[#234E42]/40'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-14 h-14 rounded-2xl shrink-0 overflow-hidden flex items-center justify-center relative ${meta.bgSoft}`}>
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
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-sm">
                              {formatTime12h(toMinutes(item.arrivalTime))} – {formatTime12h(toMinutes(item.departTime))}
                            </span>
                            <ChevronRight className="w-5 h-5 text-slate-300" />
                          </div>

                          <h3 className="font-bold text-slate-900 text-base leading-tight mt-0.5 truncate">
                            {item.destination}
                          </h3>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{item.address || 'Local Waypoint'}</p>

                          <div className="flex items-center space-x-2.5 text-xs text-slate-600 font-medium mt-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border border-current/15 ${meta.bgSoft} ${meta.iconColor}`}>
                              {meta.label}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatDurationWords(durationMin)} here</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Timeline View */}
          {activeTab === 'gantt' && (
            <div className="pt-2 select-none">
              <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" style={{ height: `${timelinePixelHeight}px` }}>
                {settings.showSunriseSunset && currentSun.sunriseMin > timelineStartMin && (
                  <div
                    className="absolute left-0 right-0 top-0 bg-amber-500/10 border-b border-amber-300 pointer-events-none z-1 flex items-end px-3 pb-1"
                    style={{ height: `${minToPx(currentSun.sunriseMin)}px` }}
                  >
                    <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded flex items-center space-x-1">
                      <Sun className="w-3 h-3 text-amber-600" />
                      <span>Sunrise {currentSun.sunrise}</span>
                    </span>
                  </div>
                )}

                {Array.from({ length: 13 }).map((_, idx) => {
                  const hour = 6 + idx;
                  const minuteVal = hour * 60;
                  const topPos = minToPx(minuteVal);
                  return (
                    <div key={hour} className="absolute left-0 right-0 border-t border-slate-100 flex items-center pointer-events-none" style={{ top: `${topPos}px` }}>
                      <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 ml-2 rounded">
                        {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                      </span>
                      <div className="flex-1 border-t border-dashed border-slate-200"></div>
                    </div>
                  );
                })}

                {currentDayItems.map((item) => {
                  const arr = toMinutes(item.arrivalTime);
                  const dep = toMinutes(item.departTime);
                  const topPx = minToPx(arr);
                  const duration = Math.max(12, dep - arr);
                  const heightPx = Math.max(38, (duration / totalTimelineMinutes) * timelinePixelHeight);
                  const meta = getActivityMeta(item.activityType);
                  const Icon = meta.icon;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`absolute left-14 right-2 rounded-xl cursor-pointer shadow-2xs border-l-4 transition-all ${
                        conflictingItemIds.has(item.id) ? 'bg-rose-50 border-rose-500' : 'bg-white border-slate-200'
                      }`}
                      style={{ top: `${topPx}px`, height: `${heightPx}px`, zIndex: 10 }}
                    >
                      <div className="p-2 h-full flex items-center space-x-2">
                        <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${meta.bgSoft}`}>
                          <Icon className={`w-3.5 h-3.5 ${meta.iconColor}`} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold truncate leading-tight">{item.destination}</h4>
                          <p className="text-[10px] text-slate-500 truncate">
                            {formatTime12h(arr)} – {formatTime12h(dep)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="pt-2 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{currentSun.label} Driving & Activity Metrics</h3>
                  <button
                    onClick={() => setShowSunEditModal(true)}
                    className="text-[11px] font-bold text-[#234E42] hover:underline cursor-pointer"
                  >
                    Adjust Sun Times
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3.5">
                  <div className="p-3 bg-[#EBF4EE] rounded-xl text-center border border-[#234E42]/10">
                    <Car className="w-5 h-5 text-[#234E42] mx-auto mb-1" />
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Drive</span>
                    <span className="text-sm font-extrabold text-[#1E4238]">{formatDurationWords(summaryStats.totalDriveMin)}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                    <Footprints className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Hike / Walk</span>
                    <span className="text-sm font-extrabold text-emerald-900">{formatDurationWords(summaryStats.totalHikeTransitMin)}</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl text-center border border-amber-100">
                    <Clock className="w-5 h-5 text-amber-700 mx-auto mb-1" />
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">At Stops</span>
                    <span className="text-sm font-extrabold text-amber-900">{formatDurationWords(summaryStats.totalTimeSpentMin)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Plus Button */}
        <button
          onClick={() => {
            const nextArr = currentDayItems.length > 0 ? toMinutes(currentDayItems[currentDayItems.length - 1].departTime) + 15 : 9 * 60;
            setEditingItem({
              id: `stop-${Date.now()}`,
              date: selectedDate,
              destination: '',
              address: '',
              arrivalTime: toTimeString(nextArr),
              departTime: toTimeString(nextArr + 45),
              travelMinutes: 15,
              travelMode: 'drive',
              activityType: 'sightseeing',
              notes: '',
              insights: [],
              tags: [],
              image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
              hardTime: 'none',
            });
            setIsAddMode(true);
          }}
          className="absolute right-4 bottom-16 z-30 w-12 h-12 rounded-full bg-[#234E42] text-white shadow-xl hover:bg-[#1B3E34] active:scale-95 transition-all flex items-center justify-center border-2 border-white cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Bottom Nav */}
        <div className="bg-white border-t border-slate-200 px-6 py-2 flex items-center justify-around shrink-0 z-20">
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex flex-col items-center space-y-1 cursor-pointer ${activeTab === 'itinerary' ? 'text-[#234E42] font-bold' : 'text-slate-400'}`}
          >
            <List className="w-5 h-5" />
            <span className="text-[10px]">Itinerary</span>
          </button>
          <button
            onClick={() => setActiveTab('gantt')}
            className={`flex flex-col items-center space-y-1 cursor-pointer ${activeTab === 'gantt' ? 'text-[#234E42] font-bold' : 'text-slate-400'}`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px]">Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex flex-col items-center space-y-1 cursor-pointer ${activeTab === 'summary' ? 'text-[#234E42] font-bold' : 'text-slate-400'}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px]">Summary</span>
          </button>
          <button
            onClick={() => setShowSyncModal(true)}
            className="flex flex-col items-center space-y-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="text-[10px]">Sync</span>
          </button>
        </div>

        {/* Sync Modal */}
        {showSyncModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#234E42]" />
                  <h3 className="font-bold text-slate-900 text-sm">Ingest & Sync Data</h3>
                </div>
                <button onClick={() => setShowSyncModal(false)} className="p-1 text-slate-500 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">Google Sheets Published CSV URL</label>
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/...output=csv"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
                <button
                  onClick={handleSyncUrl}
                  disabled={isSyncing}
                  className="w-full mt-2 py-2.5 bg-[#234E42] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Downloading Sheet...' : 'Sync From Published Sheet'}</span>
                </button>
              </div>

              <div className="relative border-t border-slate-200 pt-3">
                <span className="text-xs font-bold text-slate-700 block mb-2">Or Upload Offline File</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#234E42]" />
                    <span>Import File</span>
                  </button>
                  <button
                    onClick={handleExportBackup}
                    className="py-2.5 px-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>

              {syncStatus && (
                <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-800 leading-relaxed font-medium">
                  {syncStatus}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Solar Times Modal */}
        {showSunEditModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xs rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-slate-900 text-xs">Set Sun Times for {selectedDate}</h3>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Sunrise Time</label>
                <input
                  type="time"
                  defaultValue={toTimeString(currentSun.sunriseMin)}
                  id="sunrise-input"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Sunset Time</label>
                <input
                  type="time"
                  defaultValue={toTimeString(currentSun.sunsetMin)}
                  id="sunset-input"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setShowSunEditModal(false)}
                  className="flex-1 py-1.5 border border-slate-300 text-xs rounded-lg font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const rInput = (document.getElementById('sunrise-input') as HTMLInputElement).value;
                    const sInput = (document.getElementById('sunset-input') as HTMLInputElement).value;
                    const rMin = toMinutes(rInput);
                    const sMin = toMinutes(sInput);
                    setCustomSun((prev) => ({
                      ...prev,
                      [selectedDate]: {
                        label: formatDateDisplay(selectedDate),
                        sunrise: formatTime12h(rMin),
                        sunset: formatTime12h(sMin),
                        sunriseMin: rMin,
                        sunsetMin: sMin,
                        isManual: true,
                      },
                    }));
                    setShowSunEditModal(false);
                  }}
                  className="flex-1 py-1.5 bg-[#234E42] text-white text-xs rounded-lg font-bold cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h3 className="font-bold text-sm text-slate-900">{isAddMode ? 'Add Stop' : 'Edit Stop'}</h3>
                <button onClick={() => setEditingItem(null)} className="cursor-pointer"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Destination Name</label>
                <input
                  type="text"
                  value={editingItem.destination}
                  onChange={(e) => setEditingItem({ ...editingItem, destination: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  placeholder="Waypoint name"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Arrival Time</label>
                  <input
                    type="time"
                    value={editingItem.arrivalTime}
                    onChange={(e) => setEditingItem({ ...editingItem, arrivalTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Depart Time</label>
                  <input
                    type="time"
                    value={editingItem.departTime}
                    onChange={(e) => setEditingItem({ ...editingItem, departTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const finalItem = { ...editingItem, destination: editingItem.destination || 'Waypoint' };
                    if (isAddMode) {
                      setItinerary((prev) => cascadeSchedule(finalItem, [...prev, finalItem]));
                    } else {
                      setItinerary((prev) => cascadeSchedule(finalItem, prev));
                    }
                    setEditingItem(null);
                  }}
                  className="flex-1 py-2.5 bg-[#234E42] text-white rounded-xl font-bold cursor-pointer"
                >
                  Save & Ripple
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected Item Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase bg-[#234E42] text-white px-2 py-0.5 rounded">
                    {selectedItem.activityType}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{selectedItem.destination}</h2>
                  <p className="text-xs text-slate-500">{selectedItem.address}</p>
                </div>
                <button onClick={() => setSelectedItem(null)} className="cursor-pointer"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">Window</span>
                  <span className="font-bold">{formatTime12h(toMinutes(selectedItem.arrivalTime))} – {formatTime12h(toMinutes(selectedItem.departTime))}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Transit</span>
                  <span className="font-bold">{selectedItem.travelMinutes}m {selectedItem.travelMode}</span>
                </div>
              </div>

              {selectedItem.notes && (
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {selectedItem.notes}
                </p>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => {
                    setEditingItem(selectedItem);
                    setIsAddMode(false);
                    setSelectedItem(null);
                  }}
                  className="flex-1 py-2 bg-[#234E42] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setItinerary((prev) => prev.filter((it) => it.id !== selectedItem.id));
                    setSelectedItem(null);
                  }}
                  className="px-4 py-2 border border-rose-200 text-rose-600 rounded-xl font-bold text-xs cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Drawer */}
        {showCalendarPicker && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-sm">Select Trip Day</h3>
                <button onClick={() => setShowCalendarPicker(false)} className="cursor-pointer"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {tripDates.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setSelectedDate(d);
                      setShowCalendarPicker(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex justify-between items-center text-xs font-bold cursor-pointer ${
                      d === selectedDate ? 'bg-[#234E42] text-white' : 'bg-white text-slate-800'
                    }`}
                  >
                    <span>{formatDateDisplay(d)}</span>
                    {d === selectedDate && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// ==========================================
// Types & Interfaces
// ==========================================
export interface ItineraryItem {
  id: string;
  date: string;
  depart: string;
  from: string;
  driving: string;
  estTravel: string;
  address: string;
  to: string;
  arrive: string;
  timeSpent: string;
  details: string;
  notes: string;
}

// ==========================================
// Storage Configuration & Initial Data
// ==========================================
const STORAGE_KEY_DATA = 'travel_guide_itinerary_v1';
const STORAGE_KEY_SYNC_TIME = 'travel_guide_last_sync_v1';
const STORAGE_KEY_SHEET_URL = 'travel_guide_sheet_url_v1';

// Default Google Sheets published CSV URL or fallback endpoint
const DEFAULT_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQplaceholder/pub?gid=0&single=true&output=csv';

export const INITIAL_DATA: ItineraryItem[] = [
  {
    id: 'day1-1',
    date: 'Fri 9/18',
    depart: '9:00 AM',
    from: 'HOME',
    driving: '1:10',
    estTravel: '1 hr 10 min',
    address: '6100 S Semoran Blvd, Orlando, FL 32822',
    to: 'Park N Go Orlando',
    arrive: '10:10 AM',
    timeSpent: '0:20',
    details: 'Depart home in Palm Bay; drive to Park N Go Orlando',
    notes: 'Home departure',
  },
  {
    id: 'day1-2',
    date: 'Fri 9/18',
    depart: '10:30 AM',
    from: 'Park N Go Orlando',
    driving: '0:10',
    estTravel: '11 mins',
    address: 'MCO Airport - Terminal B, Orlando, FL 32827',
    to: 'MCO Terminal',
    arrive: '10:40 AM',
    timeSpent: '1:00',
    details: 'Drop off car at Park N Go Orlando & take shuttle to MCO',
    notes: 'Park N Go drop-off (Res #2250681)',
  },
  {
    id: 'day1-3',
    date: 'Fri 9/18',
    depart: '11:40 AM',
    from: 'MCO Terminal',
    driving: '0:00',
    estTravel: '0 mins',
    address: 'Orlando International Airport (MCO)',
    to: 'Frontier Gate',
    arrive: '11:40 AM',
    timeSpent: '1:48',
    details: 'MCO Terminal Check-in & TSA Security Screening',
    notes: 'Frontier check-in gate (Conf #BGH5GW)',
  },
  {
    id: 'day1-4',
    date: 'Fri 9/18',
    depart: '1:28 PM',
    from: 'Frontier Gate',
    driving: '2:09',
    estTravel: '4 hr 9 min',
    address: 'Denver International Airport (DEN), 8500 Peña Blvd, Denver, CO 80249',
    to: 'DEN Airport',
    arrive: '3:37 PM',
    timeSpent: '0:15',
    details: 'Flight Outbound: MCO to DEN (Frontier Flight #4919)',
    notes: '4hr 9m flight; 2-hr time difference (EDT -> MDT)',
  },
  {
    id: 'day1-5',
    date: 'Fri 9/18',
    depart: '3:52 PM',
    from: 'DEN Airport',
    driving: '0:15',
    estTravel: '15 mins',
    address: 'Denver International Airport Turo Lot',
    to: 'Turo Pick-up Area',
    arrive: '4:07 PM',
    timeSpent: '0:10',
    details: 'Baggage claim & shuttle to Turo Pick-up Area',
    notes: 'Collect rental vehicle',
  },
  {
    id: 'day1-6',
    date: 'Fri 9/18',
    depart: '4:17 PM',
    from: 'Turo Pick-up Area',
    driving: '0:26',
    estTravel: '26 mins',
    address: 'Walmart Supercenter, Longmont / Denver vicinity',
    to: 'Walmart Supercenter',
    arrive: '4:43 PM',
    timeSpent: '0:45',
    details: 'Walmart Supercenter Supply Run (Denver Airport / Longmont)',
    notes: 'Snacks, water, trail gear',
  },
  {
    id: 'day1-7',
    date: 'Fri 9/18',
    depart: '5:28 PM',
    from: 'Walmart Supercenter',
    driving: '0:40',
    estTravel: '40 mins',
    address: '1642 Main St, Longmont, CO 80501',
    to: 'Lamplighter Motel, Longmont',
    arrive: '6:08 PM',
    timeSpent: '0:00',
    details: 'Drive I-25 North / Hwy 119 to Longmont / Loveland Hotel',
    notes: 'Scenic foothills drive (passing Flatirons Vista)',
  },
  {
    id: 'day1-8',
    date: 'Fri 9/18',
    depart: '6:08 PM',
    from: 'Lamplighter Motel, Longmont',
    driving: '0:00',
    estTravel: '0 mins',
    address: 'Longmont / Loveland, CO',
    to: 'Dinner in Longmont / Loveland',
    arrive: '6:08 PM',
    timeSpent: '1:05',
    details: 'Dinner at local restaurant in Longmont / Loveland area',
    notes: 'Evening meal',
  },
  {
    id: 'day1-9',
    date: 'Fri 9/18',
    depart: '7:13 PM',
    from: 'Dinner in Longmont / Loveland',
    driving: '0:00',
    estTravel: '0 mins',
    address: '1642 Main St, Longmont, CO 80501',
    to: 'Lamplighter Motel, Longmont',
    arrive: '7:13 PM',
    timeSpent: '13:47',
    details: 'Hotel Check-in & overnight rest prior to morning service',
    notes: 'Lamplighter Motel (Conf #6660084583)',
  },
];

// ==========================================
// RFC 4180 Compliant CSV Parser
// ==========================================
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function convertCSVToItinerary(csvText: string): ItineraryItem[] {
  const rawRows = parseCSV(csvText);
  if (rawRows.length < 2) return [];

  // Match header indexes dynamically
  const headers = rawRows[0].map((h) => h.toUpperCase().replace(/\s+/g, ' ').trim());
  const dateIdx = headers.findIndex((h) => h.includes('DATE'));
  const departIdx = headers.findIndex((h) => h.includes('DEPART'));
  const fromIdx = headers.findIndex((h) => h.includes('FROM'));
  const driveIdx = headers.findIndex((h) => h.includes('DRIVING'));
  const travelIdx = headers.findIndex((h) => h.includes('EST') || h.includes('TRAVEL'));
  const addressIdx = headers.findIndex((h) => h.includes('ADDRESS'));
  const toIdx = headers.findIndex((h) => h === 'TO');
  const arriveIdx = headers.findIndex((h) => h.includes('ARRIVE'));
  const spentIdx = headers.findIndex((h) => h.includes('SPENT'));
  const detailsIdx = headers.findIndex((h) => h.includes('DETAIL'));
  const notesIdx = headers.findIndex((h) => h.includes('NOTE'));

  const parsedItems: ItineraryItem[] = [];

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    const dateVal = dateIdx !== -1 ? row[dateIdx] || '' : row[0] || '';
    if (!dateVal) continue;

    parsedItems.push({
      id: `synced-${r}-${Date.now()}`,
      date: dateVal,
      depart: departIdx !== -1 ? row[departIdx] || '' : row[1] || '',
      from: fromIdx !== -1 ? row[fromIdx] || '' : row[2] || '',
      driving: driveIdx !== -1 ? row[driveIdx] || '' : row[3] || '',
      estTravel: travelIdx !== -1 ? row[travelIdx] || '' : row[4] || '',
      address: addressIdx !== -1 ? row[addressIdx] || '' : row[5] || '',
      to: toIdx !== -1 ? row[toIdx] || '' : row[6] || '',
      arrive: arriveIdx !== -1 ? row[arriveIdx] || '' : row[7] || '',
      timeSpent: spentIdx !== -1 ? row[spentIdx] || '' : row[8] || '',
      details: detailsIdx !== -1 ? row[detailsIdx] || '' : row[9] || '',
      notes: notesIdx !== -1 ? row[notesIdx] || '' : row[10] || '',
    });
  }

  return parsedItems;
}

// ==========================================
// Main App Component
// ==========================================
export const App: React.FC = () => {
  // 1. Bug Fix: Lazy state initialization checks localStorage first before INITIAL_DATA
  const [items, setItems] = useState<ItineraryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DATA);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached itinerary from localStorage:', e);
    }
    return INITIAL_DATA;
  });

  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_SYNC_TIME);
  });

  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_SHEET_URL) || DEFAULT_SHEET_CSV_URL;
  });

  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error' | 'idle'; msg: string }>({
    type: 'idle',
    msg: '',
  });
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // 2. Persist state changes whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save itinerary to localStorage:', e);
    }
  }, [items]);

  // Extract unique day list
  const availableDays = useMemo(() => {
    const days = new Set<string>();
    items.forEach((item) => {
      if (item.date) days.add(item.date);
    });
    return Array.from(days);
  }, [items]);

  // Filter items by day and search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesDay = selectedDay === 'ALL' || item.date === selectedDay;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.details.toLowerCase().includes(q) ||
        item.to.toLowerCase().includes(q) ||
        item.from.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q);
      return matchesDay && matchesSearch;
    });
  }, [items, selectedDay, searchQuery]);

  // 3. Sync from Google Sheets CSV with direct localStorage persistence
  const handleSync = useCallback(async () => {
    if (!sheetUrl.trim()) {
      setSyncStatus({ type: 'error', msg: 'Please enter a valid Google Sheets CSV URL' });
      return;
    }

    setIsSyncing(true);
    setSyncStatus({ type: 'idle', msg: '' });

    try {
      // Add cache buster to bypass browser proxy caching
      const separator = sheetUrl.includes('?') ? '&' : '?';
      const fetchUrl = `${sheetUrl.trim()}${separator}_cb=${Date.now()}`;

      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const csvText = await response.text();
      const parsed = convertCSVToItinerary(csvText);

      if (parsed.length === 0) {
        throw new Error('No valid itinerary entries found in the synced CSV.');
      }

      const timestamp = new Date().toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // Explicitly commit directly to localStorage immediately
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(parsed));
      localStorage.setItem(STORAGE_KEY_SYNC_TIME, timestamp);
      localStorage.setItem(STORAGE_KEY_SHEET_URL, sheetUrl.trim());

      // Update in-memory state
      setItems(parsed);
      setLastSyncTime(timestamp);
      setSyncStatus({ type: 'success', msg: `Synced ${parsed.length} items at ${timestamp}` });
    } catch (err: any) {
      console.error('Sync failed:', err);
      setSyncStatus({
        type: 'error',
        msg: err.message || 'Failed to sync. Ensure the sheet is published to web as CSV.',
      });
    } finally {
      setIsSyncing(false);
    }
  }, [sheetUrl]);

  // 4. Reset to Initial Default Data
  const handleResetToDefault = () => {
    if (window.confirm('Reset itinerary back to initial data? Any synced changes will be cleared.')) {
      localStorage.removeItem(STORAGE_KEY_DATA);
      localStorage.removeItem(STORAGE_KEY_SYNC_TIME);
      setItems(INITIAL_DATA);
      setLastSyncTime(null);
      setSyncStatus({ type: 'idle', msg: 'Reset to default initial data.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-amber-400">🏔️</span> Travel Guide & Itinerary
            </h1>
            <p className="text-xs text-slate-400">
              {lastSyncTime ? (
                <span>
                  Last synced: <span className="text-emerald-400 font-medium">{lastSyncTime}</span>
                </span>
              ) : (
                <span className="text-amber-400/80">Using default initial data</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow transition flex items-center gap-1.5 ${
                isSyncing
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
              {isSyncing ? 'Syncing...' : 'Sync Sheet'}
            </button>

            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Configure Sheet URL"
            >
              ⚙️
            </button>

            <button
              onClick={handleResetToDefault}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition"
              title="Reset to Initial Data"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Sync Settings Dropdown */}
        {showConfig && (
          <div className="max-w-5xl mx-auto mt-3 p-3 bg-slate-800/90 rounded-lg border border-slate-700 text-xs">
            <label className="block text-slate-300 font-medium mb-1">
              Google Sheets Published CSV URL:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => {
                  localStorage.setItem(STORAGE_KEY_SHEET_URL, sheetUrl.trim());
                  setShowConfig(false);
                }}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {syncStatus.msg && (
          <div
            className={`max-w-5xl mx-auto mt-2 px-3 py-1.5 rounded text-xs flex items-center justify-between ${
              syncStatus.type === 'success'
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50'
                : syncStatus.type === 'error'
                ? 'bg-rose-950/70 text-rose-300 border border-rose-800/50'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            <span>{syncStatus.msg}</span>
            <button
              onClick={() => setSyncStatus({ type: 'idle', msg: '' })}
              className="text-slate-400 hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 mt-6">
        {/* Controls: Day Selector & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
          {/* Day Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            <button
              onClick={() => setSelectedDay('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedDay === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Days ({items.length})
            </button>
            {availableDays.map((day) => {
              const count = items.filter((i) => i.date === day).length;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                    selectedDay === day
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {day} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination, notes..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Timeline Itinerary Cards */}
        {filteredItems.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-sm">
            No activities found matching your criteria.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item, idx) => {
              const mapsUrl = item.address
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    item.address
                  )}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    item.to
                  )}`;

              return (
                <div
                  key={item.id || idx}
                  className="bg-slate-800/70 border border-slate-700/70 hover:border-slate-600 rounded-xl p-4 shadow-sm transition hover:shadow-md"
                >
                  {/* Top Bar: Date & Times */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/50 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 text-xs font-semibold uppercase tracking-wide">
                        {item.date}
                      </span>
                      <span className="text-xs text-slate-400">
                        {item.depart} → <span className="text-slate-200 font-medium">{item.arrive}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {item.estTravel && (
                        <span className="text-slate-400">
                          🚗 <span className="text-slate-300">{item.estTravel}</span>
                        </span>
                      )}
                      {item.timeSpent && item.timeSpent !== '0:00' && (
                        <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                          ⏱️ {item.timeSpent} spent
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Destination & Action */}
                  <div className="mb-2">
                    <h3 className="text-base font-semibold text-white flex items-center justify-between gap-2">
                      <span>{item.to}</span>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 font-normal shrink-0"
                      >
                        Map 📍
                      </a>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.details}</p>
                  </div>

                  {/* Origin & Address */}
                  <div className="text-xs text-slate-400 space-y-0.5 pt-1">
                    {item.from && (
                      <div>
                        <span className="text-slate-500">From:</span> {item.from}
                      </div>
                    )}
                    {item.address && (
                      <div className="truncate">
                        <span className="text-slate-500">Address:</span> {item.address}
                      </div>
                    )}
                  </div>

                  {/* Notes Callout */}
                  {item.notes && (
                    <div className="mt-3 text-xs bg-slate-900/60 border border-slate-700/40 rounded-lg p-2.5 text-amber-200/90 flex items-start gap-1.5">
                      <span className="text-amber-400 shrink-0">📌</span>
                      <span className="leading-normal">{item.notes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

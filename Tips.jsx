import { useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";


const DATA_GOV_API_KEY = "579b464db66ec23bdd000001d7cf9e00a87242e65afc04b405b62cf6"; // ← replace after registration

// data.gov.in resource ID for "Current Daily Price of Various Commodities from Various Markets (Mandi)"
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

// ─────────────────────────────────────────────────────────────────────────────
// Supported crops — commodity name must match data.gov.in spelling exactly
// ─────────────────────────────────────────────────────────────────────────────
const CROPS = [
  { label: "Wheat",          commodity: "Wheat",          emoji: "🌾", msp: 2275 },
  { label: "Rice (Paddy)",   commodity: "Paddy(Desi)",    emoji: "🍚", msp: 2183 },
  { label: "Maize",          commodity: "Maize",          emoji: "🌽", msp: 2090 },
  { label: "Cotton",         commodity: "Cotton",         emoji: "🪴", msp: 7020 },
  { label: "Soybean",        commodity: "Soya bean",      emoji: "🫘", msp: 4892 },
  { label: "Onion",          commodity: "Onion",          emoji: "🧅", msp: null  },
  { label: "Tomato",         commodity: "Tomato",         emoji: "🍅", msp: null  },
  { label: "Potato",         commodity: "Potato",         emoji: "🥔", msp: null  },
  { label: "Sugarcane",      commodity: "Sugarcane",      emoji: "🎋", msp: 315   },
  { label: "Mustard",        commodity: "Mustard",        emoji: "🌻", msp: 5650  },
  { label: "Groundnut",      commodity: "Groundnut",      emoji: "🥜", msp: 6377  },
  { label: "Chickpea (Gram)",commodity: "Gram",           emoji: "🫘", msp: 5440  },
  { label: "Moong Dal",      commodity: "Moong(Green Gram)", emoji: "🟢", msp: 8558 },
  { label: "Tur/Arhar",      commodity: "Arhar (Tur/Red Gram)(Whole)", emoji: "🔴", msp: 7000 },
  { label: "Sunflower",      commodity: "Sunflower",      emoji: "🌻", msp: 6760  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Fetch live mandi prices from data.gov.in
// ─────────────────────────────────────────────────────────────────────────────
async function fetchMandiPrice(commodity) {
  if (!DATA_GOV_API_KEY || DATA_GOV_API_KEY === "YOUR_DATA_GOV_IN_API_KEY") {
    throw new Error("NO_API_KEY");
  }

  const url =
    `https://api.data.gov.in/resource/${RESOURCE_ID}` +
    `?api-key=${DATA_GOV_API_KEY}` +
    `&format=json` +
    `&limit=20` +
    `&filters[commodity]=${encodeURIComponent(commodity)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  const records = data?.records ?? [];
  if (!records.length) throw new Error("NO_DATA");

  // records have: state, district, market, commodity, variety, grade,
  //               arrival_date, min_price, max_price, modal_price
  return records.map((r) => ({
    market:    r.market     || r.Market     || "—",
    state:     r.state      || r.State      || "—",
    district:  r.district   || r.District   || "—",
    minPrice:  Number(r.min_price   ?? r.Min_Price   ?? 0),
    maxPrice:  Number(r.max_price   ?? r.Max_Price   ?? 0),
    modalPrice:Number(r.modal_price ?? r.Modal_Price ?? 0),
    date:      r.arrival_date || r.Arrival_Date || "Today",
    variety:   r.variety    || r.Variety    || "",
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// UI helpers
// ─────────────────────────────────────────────────────────────────────────────
function PriceTag({ label, value, color }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-400 mb-0.5">{label}</span>
      <span className={`font-bold text-sm ${color}`}>₹{value.toLocaleString()}</span>
    </div>
  );
}

function MandiCard({ record, index }) {
  return (
    <div
      className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-800 text-sm">{record.market}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {record.district}, {record.state}
            {record.variety ? ` · ${record.variety}` : ""}
          </p>
        </div>
        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
          {record.date}
        </span>
      </div>

      <div className="flex justify-between bg-gray-50 rounded-lg px-4 py-2">
        <PriceTag label="Min"   value={record.minPrice}   color="text-orange-500" />
        <div className="w-px bg-gray-200" />
        <PriceTag label="Modal" value={record.modalPrice} color="text-green-600"  />
        <div className="w-px bg-gray-200" />
        <PriceTag label="Max"   value={record.maxPrice}   color="text-blue-600"   />
      </div>

      <p className="text-xs text-gray-400 text-center mt-2">Price per quintal (₹/qtl)</p>
    </div>
  );
}

function MSPBadge({ msp }) {
  if (!msp) return null;
  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mt-4">
      <span className="text-amber-500 text-lg">🏛️</span>
      <div>
        <p className="text-xs text-amber-700 font-semibold">Govt. MSP (2024–25)</p>
        <p className="text-sm font-bold text-amber-800">₹{msp.toLocaleString()} / quintal</p>
      </div>
      <span className="ml-auto text-xs text-amber-500">Minimum Support Price</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tips.jsx — Main export (drop-in replacement, no existing code touched)
// ─────────────────────────────────────────────────────────────────────────────
export default function Tips() {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [records, setRecords]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [noApiKey, setNoApiKey]         = useState(false);

  const handleCropSelect = useCallback(async (crop) => {
    setSelectedCrop(crop);
    setRecords([]);
    setError(null);
    setNoApiKey(false);
    setLoading(true);

    try {
      const data = await fetchMandiPrice(crop.commodity);
      setRecords(data);
    } catch (err) {
      if (err.message === "NO_API_KEY") {
        setNoApiKey(true);
      } else if (err.message === "NO_DATA") {
        setError("No mandi data found for this crop today. Try another crop or check back later.");
      } else {
        setError("Could not fetch live prices. Check your internet or API key.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ── Page header ── */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">🌾 Crop Market Prices</h2>
          <p className="text-sm text-gray-500 mt-1">
            Select a crop to see today's live mandi prices across Indian markets
          </p>
        </div>

        {/* ── Crop selector grid ── */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-6">
          {CROPS.map((crop) => (
            <button
              key={crop.commodity}
              onClick={() => handleCropSelect(crop)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-sm font-medium transition-all shadow-sm
                ${
                  selectedCrop?.commodity === crop.commodity
                    ? "border-green-500 bg-green-50 text-green-700 shadow-md scale-105"
                    : "border-gray-100 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50"
                }`}
            >
              <span className="text-2xl mb-1">{crop.emoji}</span>
              <span className="text-xs text-center leading-tight">{crop.label}</span>
            </button>
          ))}
        </div>

        {/* ── Results area ── */}
        {!selectedCrop && (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="font-semibold text-gray-600">Select a crop above</p>
            <p className="text-sm text-gray-400 mt-1">
              We'll fetch today's wholesale mandi prices from across India
            </p>
          </div>
        )}

        {selectedCrop && (
          <div>
            {/* Crop title row */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedCrop.emoji}</span>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{selectedCrop.label}</h3>
                <p className="text-xs text-gray-400">
                  Commodity: {selectedCrop.commodity} · {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
                </p>
              </div>
            </div>

            {/* MSP badge always shown */}
            <MSPBadge msp={selectedCrop.msp} />

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Fetching live mandi prices…</p>
              </div>
            )}

            {/* No API key — show how-to */}
            {!loading && noApiKey && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-5">
                <p className="font-semibold text-blue-800 mb-1">🔑 API Key Required for Live Prices</p>
                <p className="text-sm text-blue-700 mb-3">
                  The live mandi data comes from the Government of India's open data portal — completely free.
                  Just follow these steps:
                </p>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>
                    Register at{" "}
                    <a
                      href="https://data.gov.in"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-semibold"
                    >
                      data.gov.in
                    </a>
                  </li>
                  <li>Go to <strong>My Account → API Keys</strong> and generate a key</li>
                  <li>
                    Open <code className="bg-blue-100 px-1 rounded">Tips.jsx</code> and replace{" "}
                    <code className="bg-blue-100 px-1 rounded">YOUR_DATA_GOV_IN_API_KEY</code> with your key
                  </li>
                  <li>Save & refresh — live prices will appear instantly 🎉</li>
                </ol>

                {/* Fallback: show indicative MSP data */}
                {selectedCrop.msp && (
                  <div className="mt-4 bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-xs text-gray-500 mb-2 font-semibold">
                      📌 Showing Government MSP as reference price
                    </p>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">MSP 2024–25</p>
                        <p className="text-xl font-bold text-green-600">₹{selectedCrop.msp.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">per quintal</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Approx. per kg</p>
                        <p className="text-xl font-bold text-blue-600">₹{(selectedCrop.msp / 100).toFixed(2)}</p>
                        <p className="text-xs text-gray-400">per kg</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                ⚠️ {error}
              </div>
            )}

            {/* Live price cards */}
            {!loading && records.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-3">
                  Showing {records.length} market{records.length > 1 ? "s" : ""} · Prices in ₹ per quintal
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {records.map((record, i) => (
                    <MandiCard key={i} record={record} index={i} />
                  ))}
                </div>

                {/* Summary row */}
                {records.length > 1 && (() => {
                  const modals  = records.map((r) => r.modalPrice).filter(Boolean);
                  const avgModal = Math.round(modals.reduce((a, b) => a + b, 0) / modals.length);
                  const highest  = Math.max(...modals);
                  const lowest   = Math.min(...modals);
                  return (
                    <div className="mt-4 bg-green-50 rounded-xl p-4 border border-green-200">
                      <p className="text-sm font-semibold text-green-800 mb-2">📊 Price Summary (across all markets)</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-gray-500">Lowest Modal</p>
                          <p className="font-bold text-orange-600">₹{lowest.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Avg Modal</p>
                          <p className="font-bold text-green-700">₹{avgModal.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Highest Modal</p>
                          <p className="font-bold text-blue-600">₹{highest.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 text-center mt-2">Modal price = most traded price at mandi</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Tip footer */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-1">💡 Farmer Tip</p>
              <p className="text-sm text-yellow-700">
                The <strong>modal price</strong> is the price at which the highest quantity was sold.
                Compare markets before selling — prices can vary by ₹200–₹800/qtl across mandis.
                {selectedCrop.msp
                  ? ` The government MSP for ${selectedCrop.label} is ₹${selectedCrop.msp.toLocaleString()}/qtl — you should not sell below this.`
                  : ""}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
          }

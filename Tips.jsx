// Tips.jsx — Fully updated with more crops + state-wise filter
import { useState, useCallback, useMemo } from "react";

const DATA_GOV_API_KEY = "579b464db66ec23bdd000001d7cf9e00a87242e65afc04b405b62cf6x"; // ← replace after registration

// data.gov.in resource ID for "Current Daily Price of Various Commodities from Various Markets (Mandi)"
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

// ─────────────────────────────────────────────────────────────────────────────
// All Indian States & Union Territories
// ─────────────────────────────────────────────────────────────────────────────
const STATES = [
  { code: "ALL", name: "All States" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CT", name: "Chhattisgarh" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TG", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
  // Union Territories
  { code: "AN", name: "Andaman and Nicobar" },
  { code: "CH", name: "Chandigarh" },
  { code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "DL", name: "Delhi" },
  { code: "JK", name: "Jammu and Kashmir" },
  { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" },
  { code: "PY", name: "Puducherry" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Crop categories for the filter tabs
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: "all",         label: "All Crops",    emoji: "🌿" },
  { key: "cereals",     label: "Cereals",      emoji: "🌾" },
  { key: "pulses",      label: "Pulses",       emoji: "🫘" },
  { key: "oilseeds",    label: "Oilseeds",     emoji: "🥜" },
  { key: "vegetables",  label: "Vegetables",   emoji: "🥬" },
  { key: "fruits",      label: "Fruits",       emoji: "🍎" },
  { key: "spices",      label: "Spices",       emoji: "🌶️" },
  { key: "cashcrops",   label: "Cash Crops",   emoji: "💰" },
  { key: "fibre",       label: "Fibre & Others", emoji: "🪴" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Extended crop list — commodity name must match data.gov.in spelling exactly
// ─────────────────────────────────────────────────────────────────────────────
const CROPS = [
  // ── Cereals ──
  { label: "Wheat",                commodity: "Wheat",                    emoji: "🌾", msp: 2275,  category: "cereals" },
  { label: "Rice (Paddy)",         commodity: "Paddy(Desi)",              emoji: "🍚", msp: 2183,  category: "cereals" },
  { label: "Maize",                commodity: "Maize",                    emoji: "🌽", msp: 2090,  category: "cereals" },
  { label: "Barley",               commodity: "Barley (Jau)",             emoji: "🌾", msp: 1735,  category: "cereals" },
  { label: "Jowar (Sorghum)",      commodity: "Jowar(Sorghum)",           emoji: "🌾", msp: 3180,  category: "cereals" },
  { label: "Bajra (Pearl Millet)", commodity: "Bajra(Pearl Millet)",      emoji: "🌾", msp: 2500,  category: "cereals" },
  { label: "Ragi (Finger Millet)", commodity: "Ragi(Finger Millet)",      emoji: "🌾", msp: 3846,  category: "cereals" },
  { label: "Rice (Basmati)",       commodity: "Rice",                     emoji: "🍚", msp: null,  category: "cereals" },

  // ── Pulses ──
  { label: "Chickpea (Gram)",      commodity: "Gram",                     emoji: "🫘", msp: 5440,  category: "pulses" },
  { label: "Moong Dal",            commodity: "Moong(Green Gram)(Whole)", emoji: "🟢", msp: 8558,  category: "pulses" },
  { label: "Tur / Arhar",         commodity: "Arhar (Tur/Red Gram)(Whole)", emoji: "🔴", msp: 7000, category: "pulses" },
  { label: "Urad (Black Gram)",   commodity: "Urad (Whole)",             emoji: "⚫", msp: 6950,  category: "pulses" },
  { label: "Masoor (Lentil)",      commodity: "Masoor",                   emoji: "🟤", msp: 6425,  category: "pulses" },
  { label: "Peas (Dry)",           commodity: "Peas(Dry)",                emoji: "🟢", msp: null,  category: "pulses" },
  { label: "Rajma",                commodity: "Rajma",                    emoji: "🫘", msp: null,  category: "pulses" },
  { label: "Kulthi (Horse Gram)",  commodity: "Kulthi(Horse Gram)",       emoji: "🫘", msp: null,  category: "pulses" },
  { label: "Moth",                 commodity: "Moth",                     emoji: "🫘", msp: null,  category: "pulses" },
  { label: "Lobia (Cowpea)",       commodity: "Lobia",                    emoji: "🫘", msp: null,  category: "pulses" },

  // ── Oilseeds ──
  { label: "Soybean",              commodity: "Soya bean",                emoji: "🫘", msp: 4892,  category: "oilseeds" },
  { label: "Mustard",              commodity: "Mustard",                  emoji: "🌻", msp: 5650,  category: "oilseeds" },
  { label: "Groundnut",            commodity: "Groundnut",                emoji: "🥜", msp: 6377,  category: "oilseeds" },
  { label: "Sunflower",            commodity: "Sunflower",                emoji: "🌻", msp: 6760,  category: "oilseeds" },
  { label: "Sesame (Til)",         commodity: "Sesamum(Sesame,Gingelly,Til)", emoji: "🌿", msp: 8635, category: "oilseeds" },
  { label: "Castor Seed",          commodity: "Castor Seed",              emoji: "🌿", msp: 6015,  category: "oilseeds" },
  { label: "Linseed",              commodity: "Linseed",                  emoji: "🌿", msp: 6485,  category: "oilseeds" },
  { label: "Niger Seed",           commodity: "Niger Seed(Ramtil)",       emoji: "🌿", msp: 7734,  category: "oilseeds" },
  { label: "Safflower",            commodity: "Safflower",                emoji: "🌼", msp: 5800,  category: "oilseeds" },
  { label: "Copra",                commodity: "Copra",                    emoji: "🥥", msp: 11160, category: "oilseeds" },
  { label: "Coconut",              commodity: "Coconut",                  emoji: "🥥", msp: null,  category: "oilseeds" },

  // ── Vegetables ──
  { label: "Onion",                commodity: "Onion",                    emoji: "🧅", msp: null,  category: "vegetables" },
  { label: "Tomato",               commodity: "Tomato",                   emoji: "🍅", msp: null,  category: "vegetables" },
  { label: "Potato",               commodity: "Potato",                   emoji: "🥔", msp: null,  category: "vegetables" },
  { label: "Green Chilli",         commodity: "Green Chilli",             emoji: "🌶️", msp: null, category: "vegetables" },
  { label: "Brinjal",              commodity: "Brinjal",                  emoji: "🍆", msp: null,  category: "vegetables" },
  { label: "Cabbage",              commodity: "Cabbage",                  emoji: "🥬", msp: null,  category: "vegetables" },
  { label: "Cauliflower",          commodity: "Cauliflower",              emoji: "🥦", msp: null,  category: "vegetables" },
  { label: "Okra (Bhindi)",        commodity: "Bhindi(Ladies Finger)",    emoji: "🌿", msp: null,  category: "vegetables" },
  { label: "Bottle Gourd",         commodity: "Bottle gourd",             emoji: "🥒", msp: null,  category: "vegetables" },
  { label: "Bitter Gourd",         commodity: "Bitter gourd",             emoji: "🥒", msp: null,  category: "vegetables" },
  { label: "Cucumber",             commodity: "Cucumber(Kheera)",         emoji: "🥒", msp: null,  category: "vegetables" },
  { label: "Pumpkin",              commodity: "Pumpkin",                  emoji: "🎃", msp: null,  category: "vegetables" },
  { label: "Carrot",               commodity: "Carrot",                   emoji: "🥕", msp: null,  category: "vegetables" },
  { label: "Radish",               commodity: "Radish",                   emoji: "🌿", msp: null,  category: "vegetables" },
  { label: "Spinach",              commodity: "Spinach",                  emoji: "🥬", msp: null,  category: "vegetables" },
  { label: "Capsicum",             commodity: "Capsicum",                 emoji: "🫑", msp: null,  category: "vegetables" },
  { label: "Peas (Green)",         commodity: "Peas(Green)",              emoji: "🟢", msp: null,  category: "vegetables" },
  { label: "French Beans",         commodity: "French Beans (Frasbean)",  emoji: "🫛", msp: null,  category: "vegetables" },
  { label: "Drumstick",            commodity: "Drumstick",                emoji: "🌿", msp: null,  category: "vegetables" },
  { label: "Garlic",               commodity: "Garlic",                   emoji: "🧄", msp: null,  category: "vegetables" },
  { label: "Sweet Potato",         commodity: "Sweet Potato",             emoji: "🍠", msp: null,  category: "vegetables" },
  { label: "Beetroot",             commodity: "Beetroot",                 emoji: "🌿", msp: null,  category: "vegetables" },
  { label: "Pointed Gourd",        commodity: "Pointed gourd (Parval)",   emoji: "🥒", msp: null,  category: "vegetables" },
  { label: "Ridge Gourd",          commodity: "Ridge gourd(Tori)",        emoji: "🥒", msp: null,  category: "vegetables" },
  { label: "Cluster Beans",        commodity: "Cluster beans",            emoji: "🫛", msp: null,  category: "vegetables" },
  { label: "Mushroom",             commodity: "Mushrooms",                emoji: "🍄", msp: null,  category: "vegetables" },
  { label: "Tapioca",              commodity: "Tapioca",                  emoji: "🌿", msp: null,  category: "vegetables" },

  // ── Fruits ──
  { label: "Banana",               commodity: "Banana",                   emoji: "🍌", msp: null,  category: "fruits" },
  { label: "Mango",                commodity: "Mango(Raw-Loss)",          emoji: "🥭", msp: null,  category: "fruits" },
  { label: "Apple",                commodity: "Apple",                    emoji: "🍎", msp: null,  category: "fruits" },
  { label: "Grapes",               commodity: "Grapes",                   emoji: "🍇", msp: null,  category: "fruits" },
  { label: "Orange",               commodity: "Orange",                   emoji: "🍊", msp: null,  category: "fruits" },
  { label: "Papaya",               commodity: "Papaya",                   emoji: "🌿", msp: null,  category: "fruits" },
  { label: "Guava",                commodity: "Guava",                    emoji: "🌿", msp: null,  category: "fruits" },
  { label: "Pomegranate",          commodity: "Pomegranate",              emoji: "🌿", msp: null,  category: "fruits" },
  { label: "Watermelon",           commodity: "Water Melon",              emoji: "🍉", msp: null,  category: "fruits" },
  { label: "Lemon",                commodity: "Lemon",                    emoji: "🍋", msp: null,  category: "fruits" },
  { label: "Pineapple",            commodity: "Pineapple",                emoji: "🍍", msp: null,  category: "fruits" },
  { label: "Litchi",               commodity: "Litchi",                   emoji: "🌿", msp: null,  category: "fruits" },
  { label: "Sapota (Chikoo)",      commodity: "Sapota",                   emoji: "🌿", msp: null,  category: "fruits" },
  { label: "Jack Fruit",           commodity: "Jack Fruit",               emoji: "🌿", msp: null,  category: "fruits" },
  { label: "Coconut (Fruit)",      commodity: "Tender Coconut",           emoji: "🥥", msp: null,  category: "fruits" },
  { label: "Mousambi",             commodity: "Mousambi(Sweet Lime)",     emoji: "🍋", msp: null,  category: "fruits" },
  { label: "Amla",                 commodity: "Amla(Indian Gooseberry)",  emoji: "🌿", msp: null,  category: "fruits" },
  { label: "Custard Apple",        commodity: "Custard Apple(Sharifa)",   emoji: "🌿", msp: null,  category: "fruits" },
  { label: "Fig (Anjeer)",         commodity: "Fig(Anjeer/Anjur)",        emoji: "🌿", msp: null,  category: "fruits" },
  { label: "Ber (Jujube)",         commodity: "Ber(Zizyphus/Borehannu)", emoji: "🌿", msp: null,  category: "fruits" },

  // ── Spices ──
  { label: "Turmeric",             commodity: "Turmeric",                 emoji: "🟡", msp: null,  category: "spices" },
  { label: "Dry Chilli",           commodity: "Dry Chillies",             emoji: "🌶️", msp: null, category: "spices" },
  { label: "Ginger (Dry)",         commodity: "Ginger(Dry)",              emoji: "🫚", msp: null,  category: "spices" },
  { label: "Ginger (Green)",       commodity: "Ginger(Green)",            emoji: "🫚", msp: null,  category: "spices" },
  { label: "Black Pepper",         commodity: "Black Pepper",             emoji: "⚫", msp: null,  category: "spices" },
  { label: "Cardamom",             commodity: "Cardamom",                 emoji: "🌿", msp: null,  category: "spices" },
  { label: "Coriander Seed",       commodity: "Coriander(Dhania)(Whole)", emoji: "🌿", msp: null,  category: "spices" },
  { label: "Cumin (Jeera)",        commodity: "Cummin Seed(Jeera)",       emoji: "🌿", msp: null,  category: "spices" },
  { label: "Fennel (Saunf)",       commodity: "Saunf(Fennel)",            emoji: "🌿", msp: null,  category: "spices" },
  { label: "Fenugreek (Methi)",    commodity: "Methi(Fenugreek)(Whole)",  emoji: "🌿", msp: null,  category: "spices" },
  { label: "Ajwain",               commodity: "Ajwan",                    emoji: "🌿", msp: null,  category: "spices" },
  { label: "Clove",                commodity: "Cloves",                   emoji: "🌿", msp: null,  category: "spices" },
  { label: "Cinnamon",             commodity: "Cinnamon(Dalchini)",       emoji: "🌿", msp: null,  category: "spices" },
  { label: "Nutmeg",               commodity: "Nutmeg",                   emoji: "🌿", msp: null,  category: "spices" },
  { label: "Tamarind",             commodity: "Tamarind Fruit",           emoji: "🌿", msp: null,  category: "spices" },
  { label: "Betel Nut",            commodity: "Arecanut(Betelnut/Supari)", emoji: "🌴", msp: null, category: "spices" },

  // ── Cash Crops ──
  { label: "Sugarcane",            commodity: "Sugarcane",                emoji: "🎋", msp: 315,   category: "cashcrops" },
  { label: "Cotton",               commodity: "Cotton",                   emoji: "☁️", msp: 7020,  category: "cashcrops" },
  { label: "Jaggery (Gur)",        commodity: "Gur(Jaggery)",             emoji: "🟤", msp: null,  category: "cashcrops" },
  { label: "Rubber",               commodity: "Rubber",                   emoji: "🌳", msp: null,  category: "cashcrops" },
  { label: "Coffee",               commodity: "Coffee",                   emoji: "☕", msp: null,  category: "cashcrops" },
  { label: "Tea",                  commodity: "Tea",                      emoji: "🍵", msp: null,  category: "cashcrops" },
  { label: "Tobacco",              commodity: "Tobacco",                  emoji: "🍃", msp: null,  category: "cashcrops" },
  { label: "Cashew Nut",           commodity: "Cashewnuts",               emoji: "🌿", msp: null,  category: "cashcrops" },

  // ── Fibre & Others ──
  { label: "Jute",                 commodity: "Jute",                     emoji: "🌿", msp: 5050,  category: "fibre" },
  { label: "Raw Silk",             commodity: "Silk",                     emoji: "🌿", msp: null,  category: "fibre" },
  { label: "Isabgol",              commodity: "Isabgol",                  emoji: "🌿", msp: null,  category: "fibre" },
  { label: "Flower (Marigold)",    commodity: "Marigold(Calcutta)",       emoji: "🌼", msp: null,  category: "fibre" },
  { label: "Rose",                 commodity: "Rose(Pusa)",               emoji: "🌹", msp: null,  category: "fibre" },
  { label: "Jasmine",              commodity: "Jasmine",                  emoji: "🌸", msp: null,  category: "fibre" },
  { label: "Tuberose",             commodity: "Tube Rose",                emoji: "🌸", msp: null,  category: "fibre" },
  { label: "Aloe Vera",            commodity: "Alasande Gram",            emoji: "🌿", msp: null,  category: "fibre" },
  { label: "Dry Coconut",          commodity: "Dry Coconut",              emoji: "🥥", msp: null,  category: "fibre" },
  { label: "Honey",                commodity: "Honey",                    emoji: "🍯", msp: null,  category: "fibre" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Fetch live mandi prices from data.gov.in with optional state filter
// ─────────────────────────────────────────────────────────────────────────────
async function fetchMandiPrice(commodity, stateName = null) {
  if (!DATA_GOV_API_KEY || DATA_GOV_API_KEY === "YOUR_DATA_GOV_IN_API_KEY") {
    throw new Error("NO_API_KEY");
  }

  let url =
    `https://api.data.gov.in/resource/${RESOURCE_ID}` +
    `?api-key=${DATA_GOV_API_KEY}` +
    `&format=json` +
    `&limit=100` +
    `&filters[commodity]=${encodeURIComponent(commodity)}`;

  // Add state filter if selected
  if (stateName && stateName !== "All States") {
    url += `&filters[state]=${encodeURIComponent(stateName)}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  const records = data?.records ?? [];
  if (!records.length) throw new Error("NO_DATA");

  return records.map((r) => ({
    market:     r.market      || r.Market      || "—",
    state:      r.state       || r.State       || "—",
    district:   r.district    || r.District    || "—",
    minPrice:   Number(r.min_price    ?? r.Min_Price    ?? 0),
    maxPrice:   Number(r.max_price    ?? r.Max_Price    ?? 0),
    modalPrice: Number(r.modal_price  ?? r.Modal_Price  ?? 0),
    date:       r.arrival_date || r.Arrival_Date || "Today",
    variety:    r.variety     || r.Variety     || "",
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
      className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow animate-fadeIn"
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
        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
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
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function Tips() {
  const [selectedCrop, setSelectedCrop]       = useState(null);
  const [selectedState, setSelectedState]     = useState(STATES[0]); // "All States"
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery]         = useState("");
  const [records, setRecords]                 = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [noApiKey, setNoApiKey]               = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [stateSearch, setStateSearch]         = useState("");

  // ── Filtered crops based on category + search ──
  const filteredCrops = useMemo(() => {
    let result = CROPS;

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.commodity.toLowerCase().includes(q)
      );
    }

    return result;
  }, [selectedCategory, searchQuery]);

  // ── Filtered states for the dropdown search ──
  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return STATES;
    const q = stateSearch.toLowerCase().trim();
    return STATES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
    );
  }, [stateSearch]);

  // ── Fetch handler ──
  const handleCropSelect = useCallback(
    async (crop) => {
      setSelectedCrop(crop);
      setRecords([]);
      setError(null);
      setNoApiKey(false);
      setLoading(true);

      try {
        const stateName =
          selectedState.code === "ALL" ? null : selectedState.name;
        const data = await fetchMandiPrice(crop.commodity, stateName);
        setRecords(data);
      } catch (err) {
        if (err.message === "NO_API_KEY") {
          setNoApiKey(true);
        } else if (err.message === "NO_DATA") {
          setError(
            selectedState.code !== "ALL"
              ? `No mandi data found for ${crop.label} in ${selectedState.name} today. Try "All States" or another crop.`
              : "No mandi data found for this crop today. Try another crop or check back later."
          );
        } else {
          setError("Could not fetch live prices. Check your internet or API key.");
        }
      } finally {
        setLoading(false);
      }
    },
    [selectedState]
  );

  // ── Re-fetch when state changes (if a crop is already selected) ──
  const handleStateChange = useCallback(
    (state) => {
      setSelectedState(state);
      setShowStateDropdown(false);
      setStateSearch("");
      if (selectedCrop) {
        // Re-trigger fetch with new state
        handleCropSelectWithState(selectedCrop, state);
      }
    },
    [selectedCrop]
  );

  const handleCropSelectWithState = useCallback(async (crop, state) => {
    setSelectedCrop(crop);
    setRecords([]);
    setError(null);
    setNoApiKey(false);
    setLoading(true);

    try {
      const stateName = state.code === "ALL" ? null : state.name;
      const data = await fetchMandiPrice(crop.commodity, stateName);
      setRecords(data);
    } catch (err) {
      if (err.message === "NO_API_KEY") {
        setNoApiKey(true);
      } else if (err.message === "NO_DATA") {
        setError(
          state.code !== "ALL"
            ? `No mandi data found for ${crop.label} in ${state.name} today. Try "All States" or another crop.`
            : "No mandi data found for this crop today. Try another crop or check back later."
        );
      } else {
        setError("Could not fetch live prices. Check your internet or API key.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Count of unique states in results ──
  const statesInResults = useMemo(() => {
    const unique = new Set(records.map((r) => r.state));
    return unique.size;
  }, [records]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ── Page header ── */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            🌾 Crop Market Prices
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Select a crop to see today's live mandi prices across Indian markets
          </p>
        </div>

        {/* ── State Filter ── */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📍 Filter by State / UT
          </label>
          <div className="relative">
            <button
              onClick={() => setShowStateDropdown(!showStateDropdown)}
              className="w-full sm:w-80 flex items-center justify-between bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:border-green-400 transition-colors shadow-sm"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">
                  {selectedState.code === "ALL" ? "🇮🇳" : "📍"}
                </span>
                {selectedState.name}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  showStateDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* ── State dropdown ── */}
            {showStateDropdown && (
              <div className="absolute z-50 mt-1 w-full sm:w-80 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-hidden">
                {/* Search within states */}
                <div className="p-2 border-b border-gray-100">
                  <input
                    type="text"
                    placeholder="Search state..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-400"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto max-h-64">
                  {filteredStates.map((state) => (
                    <button
                      key={state.code}
                      onClick={() => handleStateChange(state)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition-colors flex items-center gap-2 ${
                        selectedState.code === state.code
                          ? "bg-green-50 text-green-700 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="text-base">
                        {state.code === "ALL" ? "🇮🇳" : "📍"}
                      </span>
                      <span>{state.name}</span>
                      {selectedState.code === state.code && (
                        <span className="ml-auto text-green-500">✓</span>
                      )}
                    </button>
                  ))}
                  {filteredStates.length === 0 && (
                    <p className="px-4 py-3 text-sm text-gray-400 text-center">
                      No state found
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Category tabs ── */}
        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🏷️ Crop Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  selectedCategory === cat.key
                    ? "bg-green-500 text-white border-green-500 shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:bg-green-50"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedCategory === cat.key
                      ? "bg-green-600 text-green-100"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {cat.key === "all"
                    ? CROPS.length
                    : CROPS.filter((c) => c.category === cat.key).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="mb-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search crops by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-96 pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-400 bg-white shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-gray-400 mt-1">
              Found {filteredCrops.length} crop
              {filteredCrops.length !== 1 ? "s" : ""} matching "{searchQuery}"
            </p>
          )}
        </div>

        {/* ── Active filters summary ── */}
        {(selectedState.code !== "ALL" ||
          selectedCategory !== "all" ||
          searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-gray-500">
              Active filters:
            </span>
            {selectedState.code !== "ALL" && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">
                📍 {selectedState.name}
                <button
                  onClick={() => handleStateChange(STATES[0])}
                  className="ml-1 hover:text-blue-900"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full border border-purple-200">
                🏷️{" "}
                {CATEGORIES.find((c) => c.key === selectedCategory)?.label}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="ml-1 hover:text-purple-900"
                >
                  ✕
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full border border-orange-200">
                🔍 "{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-1 hover:text-orange-900"
                >
                  ✕
                </button>
              </span>
            )}
            <button
              onClick={() => {
                handleStateChange(STATES[0]);
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="text-xs text-red-500 hover:text-red-700 font-medium underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Crop selector grid ── */}
        {filteredCrops.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center mb-6">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-semibold text-gray-600">No crops found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try a different category or search term
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 mb-6">
            {filteredCrops.map((crop) => (
              <button
                key={crop.commodity}
                onClick={() => handleCropSelect(crop)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-sm font-medium transition-all shadow-sm hover:scale-102 ${
                  selectedCrop?.commodity === crop.commodity
                    ? "border-green-500 bg-green-50 text-green-700 shadow-md scale-105"
                    : "border-gray-100 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50"
                }`}
              >
                <span className="text-2xl mb-1">{crop.emoji}</span>
                <span className="text-xs text-center leading-tight">
                  {crop.label}
                </span>
                {crop.msp && (
                  <span className="text-[10px] text-amber-600 mt-0.5 font-semibold">
                    MSP ₹{crop.msp.toLocaleString()}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Crop count info bar ── */}
        <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-gray-100 mb-6 text-xs text-gray-500">
          <span>
            Showing {filteredCrops.length} of {CROPS.length} crops
          </span>
          <span>
            {CROPS.filter((c) => c.msp).length} crops have govt MSP
          </span>
        </div>

        {/* ── Results area ── */}
        {!selectedCrop && (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="font-semibold text-gray-600">Select a crop above</p>
            <p className="text-sm text-gray-400 mt-1">
              We'll fetch today's wholesale mandi prices
              {selectedState.code !== "ALL"
                ? ` from ${selectedState.name}`
                : " from across India"}
            </p>
          </div>
        )}

        {selectedCrop && (
          <div>
            {/* Crop title row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedCrop.emoji}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {selectedCrop.label}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Commodity: {selectedCrop.commodity} ·{" "}
                    {new Date().toLocaleDateString("en-IN", {
                      dateStyle: "long",
                    })}
                    {selectedState.code !== "ALL" &&
                      ` · ${selectedState.name}`}
                  </p>
                </div>
              </div>

              {/* State badge in results */}
              {selectedState.code !== "ALL" && (
                <span className="hidden sm:inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-200">
                  📍 {selectedState.name}
                </span>
              )}
            </div>

            {/* MSP badge */}
            <MSPBadge msp={selectedCrop.msp} />

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">
                  Fetching live mandi prices
                  {selectedState.code !== "ALL"
                    ? ` from ${selectedState.name}`
                    : ""}
                  …
                </p>
              </div>
            )}

            {/* No API key */}
            {!loading && noApiKey && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-5">
                <p className="font-semibold text-blue-800 mb-1">
                  🔑 API Key Required for Live Prices
                </p>
                <p className="text-sm text-blue-700 mb-3">
                  The live mandi data comes from the Government of India's open
                  data portal — completely free. Just follow these steps:
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
                  <li>
                    Go to <strong>My Account → API Keys</strong> and generate a
                    key
                  </li>
                  <li>
                    Open{" "}
                    <code className="bg-blue-100 px-1 rounded">Tips.jsx</code>{" "}
                    and replace{" "}
                    <code className="bg-blue-100 px-1 rounded">
                      YOUR_DATA_GOV_IN_API_KEY
                    </code>{" "}
                    with your key
                  </li>
                  <li>Save & refresh — live prices will appear instantly 🎉</li>
                </ol>

                {selectedCrop.msp && (
                  <div className="mt-4 bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-xs text-gray-500 mb-2 font-semibold">
                      📌 Showing Government MSP as reference price
                    </p>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">MSP 2024–25</p>
                        <p className="text-xl font-bold text-green-600">
                          ₹{selectedCrop.msp.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">per quintal</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Approx. per kg</p>
                        <p className="text-xl font-bold text-blue-600">
                          ₹{(selectedCrop.msp / 100).toFixed(2)}
                        </p>
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
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400">
                    Showing {records.length} market
                    {records.length > 1 ? "s" : ""}
                    {statesInResults > 1
                      ? ` across ${statesInResults} states`
                      : ""}
                    {" · "}Prices in ₹ per quintal
                  </p>
                </div>

                {/* ── Group by state if "All States" is selected ── */}
                {selectedState.code === "ALL" && statesInResults > 1 ? (
                  (() => {
                    // Group records by state
                    const grouped = {};
                    records.forEach((r) => {
                      if (!grouped[r.state]) grouped[r.state] = [];
                      grouped[r.state].push(r);
                    });
                    const sortedStates = Object.keys(grouped).sort();

                    return (
                      <div className="space-y-4">
                        {sortedStates.map((stateName) => (
                          <div key={stateName}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm">📍</span>
                              <h4 className="text-sm font-bold text-gray-700">
                                {stateName}
                              </h4>
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {grouped[stateName].length} market
                                {grouped[stateName].length > 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3 ml-5">
                              {grouped[stateName].map((record, i) => (
                                <MandiCard
                                  key={`${stateName}-${i}`}
                                  record={record}
                                  index={i}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {records.map((record, i) => (
                      <MandiCard key={i} record={record} index={i} />
                    ))}
                  </div>
                )}

                {/* Summary row */}
                {records.length > 1 &&
                  (() => {
                    const modals = records
                      .map((r) => r.modalPrice)
                      .filter(Boolean);
                    const avgModal = Math.round(
                      modals.reduce((a, b) => a + b, 0) / modals.length
                    );
                    const highest = Math.max(...modals);
                    const lowest = Math.min(...modals);
                    const highestMarket = records.find(
                      (r) => r.modalPrice === highest
                    );
                    const lowestMarket = records.find(
                      (r) => r.modalPrice === lowest
                    );

                    return (
                      <div className="mt-4 bg-green-50 rounded-xl p-4 border border-green-200">
                        <p className="text-sm font-semibold text-green-800 mb-2">
                          📊 Price Summary
                          {selectedState.code !== "ALL"
                            ? ` — ${selectedState.name}`
                            : statesInResults > 1
                            ? ` — across ${statesInResults} states`
                            : ""}
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-xs text-gray-500">
                              Lowest Modal
                            </p>
                            <p className="font-bold text-orange-600">
                              ₹{lowest.toLocaleString()}
                            </p>
                            {lowestMarket && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {lowestMarket.market},{" "}
                                {lowestMarket.state}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Avg Modal</p>
                            <p className="font-bold text-green-700">
                              ₹{avgModal.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {records.length} markets
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Highest Modal
                            </p>
                            <p className="font-bold text-blue-600">
                              ₹{highest.toLocaleString()}
                            </p>
                            {highestMarket && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {highestMarket.market},{" "}
                                {highestMarket.state}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* MSP comparison */}
                        {selectedCrop.msp && (
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Govt MSP: ₹
                                {selectedCrop.msp.toLocaleString()}/qtl
                              </span>
                              {avgModal >= selectedCrop.msp ? (
                                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                  ✅ Avg price is above MSP by ₹
                                  {(
                                    avgModal - selectedCrop.msp
                                  ).toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                                  ⚠️ Avg price is below MSP by ₹
                                  {(
                                    selectedCrop.msp - avgModal
                                  ).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-gray-400 text-center mt-2">
                          Modal price = most traded price at mandi
                        </p>
                      </div>
                    );
                  })()}
              </div>
            )}

            {/* Tip footer */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-1">
                💡 Farmer Tip
              </p>
              <p className="text-sm text-yellow-700">
                The <strong>modal price</strong> is the price at which the
                highest quantity was sold. Compare markets before selling —
                prices can vary by ₹200–₹800/qtl across mandis.
                {selectedCrop.msp
                  ? ` The government MSP for ${selectedCrop.label} is ₹${selectedCrop.msp.toLocaleString()}/qtl — you should not sell below this.`
                  : ""}
                {selectedState.code === "ALL"
                  ? " Try filtering by your state to see nearby mandis."
                  : ""}
              </p>
            </div>
          </div>
        )}

        {/* ── Quick Stats Footer ── */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl mb-1">🌾</p>
            <p className="text-lg font-bold text-gray-800">{CROPS.length}</p>
            <p className="text-xs text-gray-500">Crops Available</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl mb-1">📍</p>
            <p className="text-lg font-bold text-gray-800">
              {STATES.length - 1}
            </p>
            <p className="text-xs text-gray-500">States & UTs</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl mb-1">🏛️</p>
            <p className="text-lg font-bold text-gray-800">
              {CROPS.filter((c) => c.msp).length}
            </p>
            <p className="text-xs text-gray-500">MSP Crops</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl mb-1">🏷️</p>
            <p className="text-lg font-bold text-gray-800">
              {CATEGORIES.length - 1}
            </p>
            <p className="text-xs text-gray-500">Categories</p>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showStateDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowStateDropdown(false);
            setStateSearch("");
          }}
        />
      )}
    </div>
  );
          }

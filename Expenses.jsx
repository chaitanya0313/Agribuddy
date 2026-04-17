import { useState } from "react";
import Header from "../components/Header";
import TopTabs from "../components/Toptabs";
import { useCropSeason } from "../context/CropSeasonContext";
import { authHeader } from "../utils/auth"; // Added this import

const API = import.meta.env.VITE_API_URL;

const EXPENSE_CATEGORIES = [
  "Seeds",
  "Fertilizer",
  "Pesticide",
  "Labour",
  "Irrigation",
  "Equipment",
  "Transport",
  "Other",
];

export default function Expenses() {
  // Destructure refreshData instead of addExpense
  const { cropSeasons, expenses, refreshData } = useCropSeason();

  const [showAll, setShowAll] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [category, setCategory] = useState("Seeds");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${API}/expenses`, {
        method: "POST",
        headers: { 
          ...authHeader(), 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          // Match your backend field names
          cropRecordId: Number(selectedSeasonId), 
          category,
          description: desc, // Ensure this matches your backend field (desc vs description)
          amount: Number(amount),
          date,
        }),
      });

      if (!res.ok) throw new Error("Failed to save expense");

      // Reset form
      setDesc("");
      setAmount("");
      setDate("");
      setSelectedSeasonId("");
      setCategory("Seeds");
      
      // Refresh global state
      refreshData();
      alert("Expense saved successfully!");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const recent = expenses.slice(0, 3);
  const list = showAll ? expenses : recent;

  const getSeasonLabel = (id) => {
    // Check cropId or id depending on your backend structure
    const cs = cropSeasons.find((c) => (c.cropId || c.id) === id);
    return cs ? `${cs.cropName} — ${cs.season}` : "Unknown Season";
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <TopTabs />

        {cropSeasons.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-6 text-center">
            <p className="text-amber-700 font-medium">🌾 No crop seasons found.</p>
            <p className="text-amber-600 text-sm mt-1">
              Please go to the <strong>Profit/Loss</strong> tab and click{" "}
              <strong>+ Add Crop Season</strong> first.
            </p>
          </div>
        ) : (
          <form
            className="bg-white rounded-xl shadow-sm p-4 mt-6"
            onSubmit={handleSubmit}
          >
            <h3 className="font-semibold text-orange-600 mb-3">+ Add Expense</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="lg:col-span-1">
                <label className="text-xs text-gray-500 mb-1 block">Crop Season</label>
                <select
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-300"
                  value={selectedSeasonId}
                  onChange={(e) => setSelectedSeasonId(e.target.value)}
                  required
                >
                  <option value="">Select crop season</option>
                  {cropSeasons.map((cs, index) => (
                    // FIX: Unique key using ID or index fallback
                    <option key={cs.cropId || cs.id || index} value={cs.cropId || cs.id}>
                      {cs.cropName} — {cs.season}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Category</label>
                <select
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-300"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Description</label>
                <input
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="e.g. Hybrid seeds"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Amount (₹)</label>
                <input
                  type="number"
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date</label>
                <input
                  type="date"
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-300"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Expense"}
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm p-4 mt-6">
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold">Recent Expenses</h3>
            {expenses.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-orange-600 text-sm"
              >
                {showAll ? "Hide history" : "See all history"}
              </button>
            )}
          </div>
          {list.length === 0 && (
            <p className="text-sm text-gray-500">No expenses added yet</p>
          )}
          {list.map((e, index) => (
            // FIX: Unique key for list items
            <div key={e.id || index} className="flex justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">
                  <span className="text-orange-500 text-xs font-semibold mr-1 uppercase">
                    {e.category}
                  </span>
                  {e.description || e.desc}
                </p>
                <p className="text-xs text-gray-400">{getSeasonLabel(e.cropRecordId || e.seasonId)}</p>
                <p className="text-xs text-gray-500">{e.date}</p>
              </div>
              <p className="text-orange-600 font-semibold">₹{e.amount?.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
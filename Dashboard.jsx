import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import TopTabs from "../components/Toptabs";
import { useCropSeasonsDB } from "../hooks/useCropSeasonsDB";

const SEASONS = ["Kharif", "Rabi", "Zaid"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 2 + i);

export default function Dashboard() {
  const navigate = useNavigate();
  const { cropSeasons, loading, addCropSeason, deleteCropSeason } = useCropSeasonsDB();

  const [showForm, setShowForm] = useState(false);
  const [cropName, setCropName] = useState("");
  const [season, setSeason] = useState("Kharif");
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [acres, setAcres] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCropSeason({ cropName, season, year: Number(year), acres: Number(acres) });
      setCropName("");
      setSeason("Kharif");
      setYear(String(CURRENT_YEAR));
      setAcres("");
      setShowForm(false);
    } catch (err) {
      alert("Failed to save: " + err.message);
    }
  };

  // Grand totals across all seasons using DB values
  const grandIncome = cropSeasons.reduce((s, cs) => s + (cs.totalIncome || 0), 0);
  const grandExpense = cropSeasons.reduce((s, cs) => s + (cs.totalExpense || 0), 0);
  const grandProfit = grandIncome - grandExpense;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <p className="text-green-700 font-medium">Loading your farm data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header already has Logout button in top-right */}
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <TopTabs />

        {/* ── Overview Cards ── */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Profit / Loss Overview</h2>
            <p className="text-sm text-gray-500">All Seasons</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            {showForm ? "✕ Cancel" : "+ Add Crop Season"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Total Income</p>
            <p className="text-2xl font-semibold text-green-600">
              ₹{grandIncome.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-semibold text-orange-500">
              ₹{grandExpense.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:col-span-2">
            <p className="text-sm text-gray-500">Net Profit</p>
            <p className={`text-2xl font-semibold ${grandProfit >= 0 ? "text-green-700" : "text-red-600"}`}>
              ₹{grandProfit.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ── Add Crop Season Form ── */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm border border-green-100 p-5 mt-6"
          >
            <h3 className="font-semibold text-green-700 mb-4">🌾 New Crop Season</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Crop Name *</label>
                <input
                  className="border px-3 py-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  placeholder="e.g. Wheat, Rice, Cotton"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Season *</label>
                <select
                  className="border px-3 py-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                >
                  {SEASONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Year *</label>
                <select
                  className="border px-3 py-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  {YEARS.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Area (Acres) *</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  className="border px-3 py-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  placeholder="e.g. 3.5"
                  value={acres}
                  onChange={(e) => setAcres(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
              >
                Save Crop Season
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-500 px-5 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ── Empty State ── */}
        {cropSeasons.length === 0 && !showForm && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-200 p-12 text-center mt-6">
            <p className="text-4xl mb-3">🌱</p>
            <p className="font-semibold text-gray-600 text-base">No crop seasons added yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">
              Add a crop season to start tracking income, expenses and profit
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
            >
              + Add Your First Crop Season
            </button>
          </div>
        )}

        {/* ── Per-Crop Profit Cards ── */}
        {cropSeasons.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            {cropSeasons.map((cs) => {
              const totalIncome = cs.totalIncome || 0;
              const totalExpense = cs.totalExpense || 0;
              const profit = totalIncome - totalExpense;
              const isProfit = profit >= 0;
              const perAcre = cs.acres > 0 ? (Math.abs(profit) / cs.acres).toFixed(0) : 0;

              return (
                <div
                  key={cs.id}
                  className={`bg-white rounded-xl shadow-sm border-l-4 p-5 ${
                    isProfit ? "border-green-500" : "border-red-400"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">🌾 {cs.cropName}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {cs.season} · {cs.year} · {cs.acres} Acres
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        isProfit ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}>
                        {isProfit ? "✅ PROFIT" : "❌ LOSS"}
                      </span>
                      <button
                        onClick={() => deleteCropSeason(cs.id)}
                        className="text-[10px] text-red-400 hover:text-red-600 underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t pt-3 space-y-1 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Total Income</span>
                      <span className="text-green-600 font-semibold">₹{totalIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Total Expense</span>
                      <span className="text-red-500 font-semibold">₹{totalExpense.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
                      <span>Profit / Loss</span>
                      <span className={isProfit ? "text-green-600" : "text-red-500"}>
                        {isProfit ? "+" : "-"}₹{Math.abs(profit).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 text-right">
                      ₹{Number(perAcre).toLocaleString()} per acre
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
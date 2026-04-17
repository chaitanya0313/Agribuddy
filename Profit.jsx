import { useState, useEffect } from "react";
import Header from "../components/Header";
import TopTabs from "../components/Toptabs";

const API = import.meta.env.VITE_API_URL;
const SEASONS = ["Kharif", "Rabi", "Summer", "Annual"];

export default function Profit() {
  // Support both localStorage key naming conventions
  const farmerId =
    localStorage.getItem("agri_farmer_id") || localStorage.getItem("farmerId");

  const [crops, setCrops] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    cropName: "", season: "Kharif", year: new Date().getFullYear(), areaAcres: "", startDate: "",
  });

  useEffect(() => { fetchProfitLoss(); }, []);

  const fetchProfitLoss = async () => {
    try {
      const res = await fetch(`${API}/crops/profit/${farmerId}`);
      const data = await res.json();
      setCrops(data);
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddCrop = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/crops/record`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          farmerId,
          year: String(form.year),
          areaAcres: String(form.areaAcres),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForm({ cropName: "", season: "Kharif", year: new Date().getFullYear(), areaAcres: "", startDate: "" });
      setShowForm(false);
      fetchProfitLoss();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalProfit = crops.reduce((sum, c) => sum + c.profitLoss, 0);
  const totalIncome = crops.reduce((sum, c) => sum + c.totalIncome, 0);
  const totalExpense = crops.reduce((sum, c) => sum + c.totalExpense, 0);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Logout is in the Header (top-right) */}
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <TopTabs />

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500">Total Income</p>
            <p className="text-green-700 font-bold text-lg">₹{totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500">Total Expense</p>
            <p className="text-orange-600 font-bold text-lg">₹{totalExpense.toLocaleString()}</p>
          </div>
          <div className={`rounded-xl p-4 text-center border ${totalProfit >= 0 ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"}`}>
            <p className="text-xs text-gray-500">Net Profit/Loss</p>
            <p className={`font-bold text-lg ${totalProfit >= 0 ? "text-blue-700" : "text-red-600"}`}>
              {totalProfit >= 0 ? "+" : ""}₹{totalProfit.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Add Crop Button */}
        <div className="flex justify-between items-center mt-6">
          <h3 className="font-semibold text-gray-700">Crop Seasons</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800"
          >
            {showForm ? "Cancel" : "+ Add Crop Season"}
          </button>
        </div>

        {/* Add Crop Form */}
        {showForm && (
          <form className="bg-white rounded-xl shadow-sm p-4 mt-3" onSubmit={handleAddCrop}>
            <h3 className="font-semibold text-green-700 mb-3">New Crop Season</h3>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                name="cropName" placeholder="Crop Name (e.g. Wheat, Rice)"
                value={form.cropName} onChange={handleChange}
                className="border px-3 py-2 rounded" required
              />
              <select
                name="season" value={form.season} onChange={handleChange}
                className="border px-3 py-2 rounded"
              >
                {SEASONS.map(s => <option key={s}>{s}</option>)}
              </select>
              <input
                name="year" type="number" placeholder="Year (e.g. 2025)"
                value={form.year} onChange={handleChange}
                className="border px-3 py-2 rounded" required
              />
              <input
                name="areaAcres" type="number" step="0.1" placeholder="Area (acres)"
                value={form.areaAcres} onChange={handleChange}
                className="border px-3 py-2 rounded" required
              />
              <div className="col-span-2">
                <label className="text-xs text-gray-500 ml-1">Season Start Date</label>
                <input
                  name="startDate" type="date"
                  value={form.startDate} onChange={handleChange}
                  className="w-full border px-3 py-2 rounded mt-1" required
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="mt-3 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Crop Season"}
            </button>
          </form>
        )}

        {/* Crop Cards */}
        <div className="mt-4 space-y-4">
          {crops.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-400">
              No crop seasons yet. Add your first crop season above ↑
            </div>
          )}

          {crops.map((c) => (
            <div key={c.cropId} className="bg-white rounded-xl shadow-sm p-4">
              {/* Crop Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">{c.cropName}</h4>
                  <p className="text-xs text-gray-400">{c.season} {c.year} • {c.areaAcres} acres • Started {c.startDate}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${c.status === "PROFIT" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {c.status}
                </span>
              </div>

              {/* Income / Expense / Profit row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Income</p>
                  <p className="text-green-700 font-semibold">₹{c.totalIncome.toLocaleString()}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Expense</p>
                  <p className="text-orange-600 font-semibold">₹{c.totalExpense.toLocaleString()}</p>
                </div>
                <div className={`rounded-lg p-2 ${c.profitLoss >= 0 ? "bg-blue-50" : "bg-red-50"}`}>
                  <p className="text-xs text-gray-500">Profit/Loss</p>
                  <p className={`font-semibold ${c.profitLoss >= 0 ? "text-blue-700" : "text-red-600"}`}>
                    {c.profitLoss >= 0 ? "+" : ""}₹{c.profitLoss.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Per acre */}
              {c.areaAcres > 0 && (
                <p className="text-xs text-gray-400 mt-2 text-right">
                  Per acre: <span className={c.profitPerAcre >= 0 ? "text-blue-600" : "text-red-500"}>
                    ₹{c.profitPerAcre.toLocaleString()}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
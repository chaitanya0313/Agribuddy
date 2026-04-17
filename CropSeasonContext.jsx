import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authHeader } from "../utils/auth";

export const CropSeasonContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL;

export function CropSeasonProvider({ children }) {
  const [cropSeasons, setCropSeasons] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshData = useCallback(async () => {
    // Support both key names used across login flows
    const farmerId =
      localStorage.getItem("agri_farmer_id") || localStorage.getItem("farmerId");
    if (!farmerId) return;

    setLoading(true);
    try {
      const [cropsRes, incRes, expRes] = await Promise.all([
        fetch(`${API_BASE}/crops/record/${farmerId}`, { headers: authHeader() }),
        // Use consistent URL — no extra /api/ prefix (VITE_API_URL already includes base)
        fetch(`${API_BASE}/incomes`, { headers: authHeader() }),
        fetch(`${API_BASE}/expenses`, { headers: authHeader() }),
      ]);

      const crops = await cropsRes.json();
      const incs = await incRes.json();
      const exps = await expRes.json();

      setCropSeasons(Array.isArray(crops) ? crops : []);
      setIncomes(Array.isArray(incs) ? incs : []);
      setExpenses(Array.isArray(exps) ? exps : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <CropSeasonContext.Provider
      value={{ cropSeasons, incomes, expenses, loading, refreshData }}
    >
      {children}
    </CropSeasonContext.Provider>
  );
}

// Named export for the hook
export const useCropSeason = () => {
  const context = useContext(CropSeasonContext);
  if (!context) throw new Error("useCropSeason must be used within Provider");
  return context;
};
import { useState, useEffect, useCallback } from "react";
import { authHeader, logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";

// Note: Using the /crops endpoint as defined in your CropController
const API = `${import.meta.env.VITE_API_URL}/crops`; 

export function useCropSeasonsDB() {
  const navigate = useNavigate();
  const [cropSeasons, setCropSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleUnauth = useCallback(() => logout(navigate), [navigate]);

  const fetchAll = useCallback(async () => {
    const farmerId = localStorage.getItem("agri_farmer_id");
    if (!farmerId) return;

    setLoading(true);
    try {
      // Use the profit endpoint because it returns the calculated totals you need for cards
      const res = await fetch(`${API}/profit/${farmerId}`, { 
        headers: authHeader() 
      });

      if (res.status === 401) { handleUnauth(); return; }
      
      const data = await res.json();
      // Map backend fields (profitLoss, areaAcres) to frontend expected names if necessary
      const mappedData = data.map(item => ({
        ...item,
        id: item.cropId, // Frontend expects .id
        acres: item.areaAcres // Frontend expects .acres
      }));

      setCropSeasons(mappedData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [handleUnauth]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addCropSeason = async (formData) => {
    const farmerId = localStorage.getItem("agri_farmer_id");
    
    // Prepare payload for CropController.createCropRecord
    const payload = {
      farmerId: farmerId,
      cropName: formData.cropName,
      season: formData.season,
      year: String(formData.year),
      areaAcres: String(formData.acres),
      startDate: new Date().toISOString().split('T')[0] // Backend expects a date string
    };

    const res = await fetch(`${API}/record`, {
      method: "POST",
      headers: { 
        ...authHeader(), 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 401) { handleUnauth(); return; }
    if (!res.ok) throw new Error("Failed to save crop record");
    
    await fetchAll();
  };

  const deleteCropSeason = async (id) => {
    // Ensure your backend has a @DeleteMapping("/{id}") in CropController
    const res = await fetch(`${API}/record/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });

    if (res.status === 401) { handleUnauth(); return; }
    await fetchAll();
  };

  return { 
    cropSeasons, 
    loading, 
    error, 
    addCropSeason, 
    deleteCropSeason, 
    refetch: fetchAll 
  };
}
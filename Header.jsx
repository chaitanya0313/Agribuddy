import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

export default function Header() {
  const [lang, setLang] = useState("en");
  const navigate = useNavigate();

  const handleLogout = () => logout(navigate);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
      {/* Left */}
      <div>
        <h1 className="text-lg font-semibold text-green-700">
          AgriFinTech
        </h1>
        <p className="text-xs text-gray-500">
          Welcome, {localStorage.getItem("agri_farmer_name") || localStorage.getItem("farmerName") || "Farmer"}
        </p>
      </div>

      {/* Right */}
      <div className="flex gap-2 items-center">
        <button
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
          className="border border-green-600 text-green-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-50"
        >
          {lang === "en" ? "हिंदी" : "English"}
        </button>
        <button
          onClick={handleLogout}
          className="border border-red-500 text-red-500 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-50"
        >
          🚪 Logout
        </button>
      </div>
    </header>
  );
}
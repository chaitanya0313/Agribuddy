import { NavLink, useLocation } from "react-router-dom";

export default function TopTabs() {
  const location = useLocation();

  const isExpense = location.pathname === "/expenses";

  const base = "px-4 py-1 rounded-lg text-sm font-medium";
  const inactive = "text-gray-600";

  const activeGreen = "bg-green-600 text-white";
  const activeOrange = "bg-orange-500 text-white";

  return (
    <div className="flex gap-4 bg-white p-3 rounded-xl shadow-sm">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `${base} ${isActive ? activeGreen : inactive}`
        }
      >
        Profit / Loss
      </NavLink>

      <NavLink
        to="/income"
        className={({ isActive }) =>
          `${base} ${isActive ? activeGreen : inactive}`
        }
      >
        Income
      </NavLink>

      <NavLink
        to="/expenses"
        className={({ isActive }) =>
          `${base} ${isActive ? activeOrange : inactive}`
        }
      >
        Expenses
      </NavLink>

      <button className={`${base} ${inactive}`}>Tips</button>
    </div>
  );
}

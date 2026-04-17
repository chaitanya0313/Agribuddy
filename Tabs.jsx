import { NavLink } from "react-router-dom";

export default function Tabs() {
  const base =
    "px-4 py-2 rounded-md font-medium text-sm transition";

  return (
    <div className="flex gap-3 bg-white p-2 rounded-lg shadow w-fit">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `${base} ${
            isActive ? "bg-gray-300 text-black" : "text-gray-500"
          }`
        }
      >
        Profit/Loss
      </NavLink>

      <NavLink
        to="/income"
        className={({ isActive }) =>
          `${base} ${
            isActive ? "bg-green-500 text-white" : "text-gray-500"
          }`
        }
      >
        Income
      </NavLink>

      <NavLink
        to="/expenses"
        className={({ isActive }) =>
          `${base} ${
            isActive ? "bg-orange-400 text-white" : "text-gray-500"
          }`
        }
      >
        Expenses
      </NavLink>
    </div>
  );
}

// Read the stored token
export const getToken = () => localStorage.getItem("agri_token");

// Clear all auth data on logout
export const logout = (navigate) => {
  localStorage.removeItem("agri_token");
  localStorage.removeItem("agri_farmer_name");
  localStorage.removeItem("agri_farmer_id");
  // Replace so back-button can't return to dashboard
  navigate("/login", { replace: true });
};

// Attach Authorization header to fetch calls
export const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});
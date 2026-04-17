import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Profit from "./pages/Profit";
import ProtectedRoute from "./components/ProtectedRoute"; 
import Tips from "./pages/Tips";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes — User must be logged in to access these */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/income" 
          element={<ProtectedRoute><Income /></ProtectedRoute>} 
        />
        <Route 
          path="/expenses" 
          element={<ProtectedRoute><Expenses /></ProtectedRoute>} 
        />
        <Route 
          path="/profit" 
          element={<ProtectedRoute><Profit /></ProtectedRoute>} 
        />
        <Route 
          path="/tips" 
          element={<ProtectedRoute><Tips /></ProtectedRoute>} 
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import SetupCheck from "./pages/SetupCheck";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup-check" element={<SetupCheck />} />
        <Route
          path="/dashboard"
          element={
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
              <p className="text-xl">Dashboard coming soon — login successful!</p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

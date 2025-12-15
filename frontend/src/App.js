import React, { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import { clearAuth, getRole, getName } from "./utils/auth";

export default function App() {
  const [mode, setMode] = useState("login"); // login/register/app
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  function onLoggedIn() {
    setLoggedIn(true);
    setMode("app");
  }

  function logout() {
    clearAuth();
    setLoggedIn(false);
    setMode("login");
  }

  const role = getRole();
  const name = getName();

  if (!loggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", padding: "20px" }}>
        <div style={{ maxWidth: 420, margin: "20px auto", display: "flex", gap: 10, background: "white", padding: "10px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <button 
            onClick={() => setMode("login")} 
            style={{ 
              padding: "12px 20px", 
              flex: 1, 
              border: "none",
              borderRadius: "8px",
              background: mode === "login" ? "#3b82f6" : "#e5e7eb",
              color: mode === "login" ? "white" : "#374151",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              if (mode !== "login") {
                e.target.style.background = "#d1d5db";
              }
            }}
            onMouseOut={(e) => {
              if (mode !== "login") {
                e.target.style.background = "#e5e7eb";
              }
            }}
          >
            Login
          </button>
          <button 
            onClick={() => setMode("register")} 
            style={{ 
              padding: "12px 20px", 
              flex: 1, 
              border: "none",
              borderRadius: "8px",
              background: mode === "register" ? "#3b82f6" : "#e5e7eb",
              color: mode === "register" ? "white" : "#374151",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              if (mode !== "register") {
                e.target.style.background = "#d1d5db";
              }
            }}
            onMouseOut={(e) => {
              if (mode !== "register") {
                e.target.style.background = "#e5e7eb";
              }
            }}
          >
            Register
          </button>
        </div>
        {mode === "register" ? (
          <Register onDone={() => setMode("login")} />
        ) : (
          <Login onLoggedIn={onLoggedIn} />
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <div style={{ 
        padding: "20px 30px", 
        borderBottom: "2px solid #e5e7eb", 
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center",
        background: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
      }}>
        <div style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
          <span style={{ color: "#3b82f6", fontSize: "20px" }}>📋</span> <b>Smart Queue</b> — Logged in as: <span style={{ color: "#3b82f6" }}>{name}</span> <span style={{ color: "#6b7280", fontSize: "14px", fontWeight: "500" }}>({role})</span>
        </div>
        <button 
          onClick={logout} 
          style={{ 
            padding: "10px 20px", 
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => e.target.style.background = "#dc2626"}
          onMouseOut={(e) => e.target.style.background = "#ef4444"}
        >
          Logout
        </button>
      </div>
      {role === "PROVIDER" || role === "ADMIN" ? <ProviderDashboard /> : <CustomerDashboard />}
    </div>
  );
}

import React, { useState } from "react";
import { api } from "../api/client";
import { saveAuth } from "../utils/auth";

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveAuth(data.token, data.role, data.fullName);
      onLoggedIn();
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div style={{ 
      maxWidth: 420, 
      margin: "40px auto", 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: "white",
      padding: "40px",
      borderRadius: "16px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ marginBottom: "30px", color: "#1f2937", fontSize: "28px", fontWeight: "700" }}>Welcome Back</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="login-email" style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "14px" }}>Email</label>
          <input 
            id="login-email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            type="email"
            style={{ 
              width: "100%", 
              padding: "12px 16px", 
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "16px",
              transition: "all 0.2s",
              boxSizing: "border-box"
            }}
            onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>
        <div style={{ marginBottom: "24px" }}>
          <label htmlFor="login-password" style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "14px" }}>Password</label>
          <input 
            id="login-password"
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ 
              width: "100%", 
              padding: "12px 16px", 
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "16px",
              transition: "all 0.2s",
              boxSizing: "border-box"
            }}
            onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>
        <button 
          type="submit"
          style={{ 
            padding: "14px", 
            width: "100%",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 4px 6px rgba(59, 130, 246, 0.3)"
          }}
          onMouseOver={(e) => e.target.style.background = "#2563eb"}
          onMouseOut={(e) => e.target.style.background = "#3b82f6"}
        >
          Login
        </button>
      </form>
      {msg && (
        <p style={{ 
          color: "#ef4444", 
          marginTop: "16px", 
          padding: "12px",
          background: "#fee2e2",
          borderRadius: "8px",
          fontSize: "14px",
          textAlign: "center"
        }}>
          {msg}
        </p>
      )}
    </div>
  );
}


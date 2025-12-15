import React, { useState } from "react";
import { api } from "../api/client";

export default function Register({ onDone }) {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password, role }),
      });
      setMsg("Registered successfully. Please login.");
      setTimeout(onDone, 800);
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
      <h2 style={{ marginBottom: "30px", color: "#1f2937", fontSize: "28px", fontWeight: "700" }}>Create Account</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="register-fullName" style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "14px" }}>Full Name</label>
          <input 
            id="register-fullName"
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
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
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="register-role" style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "14px" }}>Role</label>
          <select 
            id="register-role"
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            style={{ 
              width: "100%", 
              padding: "12px 16px", 
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "16px",
              background: "white",
              cursor: "pointer",
              transition: "all 0.2s",
              boxSizing: "border-box"
            }}
            onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          >
            <option value="CUSTOMER">Customer</option>
            <option value="PROVIDER">Service Provider</option>
            <option value="ADMIN">Admin (use only if needed)</option>
          </select>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="register-email" style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "14px" }}>Email</label>
          <input 
            id="register-email"
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
          <label htmlFor="register-password" style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "14px" }}>Password (min 6 chars)</label>
          <input 
            id="register-password"
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
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)"
          }}
          onMouseOver={(e) => e.target.style.background = "#059669"}
          onMouseOut={(e) => e.target.style.background = "#10b981"}
        >
          Create Account
        </button>
      </form>
      {msg && (
        <p style={{ 
          color: msg.includes("successfully") ? "#059669" : "#ef4444", 
          marginTop: "16px", 
          padding: "12px",
          background: msg.includes("successfully") ? "#d1fae5" : "#fee2e2",
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


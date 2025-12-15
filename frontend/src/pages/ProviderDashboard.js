import React, { useEffect, useState } from "react";
import { api } from "../api/client";

export default function ProviderDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const s = await api("/services/mine");
    const b = await api("/bookings/provider");
    setServices(s);
    setBookings(b);
  }

  useEffect(() => { load(); }, []);

  async function addService(e) {
    e.preventDefault();
    setMsg("");
    try {
      await api("/services", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });
      setTitle("");
      setDescription("");
      setMsg("Service created.");
      await load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function updateStatus(id, status) {
    setMsg("");
    try {
      await api(`/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setMsg("Status updated.");
      await load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case "WAITING": return { bg: "#fef3c7", color: "#92400e" };
      case "SERVING": return { bg: "#dbeafe", color: "#1e40af" };
      case "COMPLETED": return { bg: "#d1fae5", color: "#065f46" };
      case "CANCELLED": return { bg: "#fee2e2", color: "#991b1b" };
      default: return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "30px auto", padding: "0 20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <h2 style={{ color: "#1f2937", fontSize: "32px", fontWeight: "700", marginBottom: "30px" }}>Provider Dashboard</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        <div style={{ 
          padding: "24px", 
          border: "none", 
          borderRadius: "12px",
          background: "white",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
        }}>
          <h3 style={{ color: "#374151", fontSize: "20px", fontWeight: "600", marginBottom: "20px" }}>Create Service</h3>
          <form onSubmit={addService}>
            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="provider-title" style={{ display: "block", marginBottom: "8px", color: "#6b7280", fontSize: "14px", fontWeight: "500" }}>Title</label>
              <input 
                id="provider-title"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
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
              <label htmlFor="provider-description" style={{ display: "block", marginBottom: "8px", color: "#6b7280", fontSize: "14px", fontWeight: "500" }}>Description</label>
              <textarea 
                id="provider-description"
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows="4"
                style={{ 
                  width: "100%", 
                  padding: "12px 16px", 
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "all 0.2s",
                  resize: "vertical",
                  boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
                onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>
            <button 
              type="submit"
              style={{ 
                padding: "12px 24px", 
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
              Add Service
            </button>
          </form>
          {msg && (
            <p style={{ 
              color: msg.includes("created") || msg.includes("updated") ? "#059669" : "#ef4444", 
              marginTop: "16px", 
              padding: "12px",
              background: msg.includes("created") || msg.includes("updated") ? "#d1fae5" : "#fee2e2",
              borderRadius: "8px",
              fontSize: "14px"
            }}>
              {msg}
            </p>
          )}
        </div>
        
        <div style={{ 
          padding: "24px", 
          border: "none", 
          borderRadius: "12px",
          background: "white",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
        }}>
          <h3 style={{ color: "#374151", fontSize: "20px", fontWeight: "600", marginBottom: "20px" }}>My Services</h3>
          {services.length === 0 ? (
            <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>No services yet. Create your first service!</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {services.map((s) => (
                <li key={s.id} style={{ 
                  padding: "16px", 
                  marginBottom: "12px", 
                  background: "#f9fafb",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#1f2937", fontWeight: "600", fontSize: "16px" }}>{s.title}</span>
                    <span style={{ 
                      padding: "4px 12px",
                      background: s.active ? "#d1fae5" : "#fee2e2",
                      color: s.active ? "#065f46" : "#991b1b",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>
                      {s.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {s.description && (
                    <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px", marginBottom: 0 }}>
                      {s.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ 
        padding: "24px", 
        border: "none", 
        borderRadius: "12px",
        marginTop: "24px",
        background: "white",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
      }}>
        <h3 style={{ color: "#374151", fontSize: "20px", fontWeight: "600", marginBottom: "20px" }}>Bookings Queue</h3>
        {bookings.length === 0 ? (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}>No bookings yet. Customers will appear here when they book your services.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table width="100%" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                  <th align="left" style={{ padding: "12px 16px", color: "#374151", fontWeight: "600", fontSize: "14px" }}>Customer</th>
                  <th align="left" style={{ padding: "12px 16px", color: "#374151", fontWeight: "600", fontSize: "14px" }}>Service</th>
                  <th align="left" style={{ padding: "12px 16px", color: "#374151", fontWeight: "600", fontSize: "14px" }}>Date</th>
                  <th align="left" style={{ padding: "12px 16px", color: "#374151", fontWeight: "600", fontSize: "14px" }}>Queue</th>
                  <th align="left" style={{ padding: "12px 16px", color: "#374151", fontWeight: "600", fontSize: "14px" }}>Status</th>
                  <th align="left" style={{ padding: "12px 16px", color: "#374151", fontWeight: "600", fontSize: "14px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const statusStyle = getStatusColor(b.status);
                  return (
                    <tr key={b.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "16px", color: "#1f2937", fontWeight: "500" }}>{b.customer?.fullName}</td>
                      <td style={{ padding: "16px", color: "#6b7280" }}>{b.service?.title}</td>
                      <td style={{ padding: "16px", color: "#6b7280" }}>{new Date(b.date).toLocaleString()}</td>
                      <td style={{ padding: "16px" }}>
                        <span style={{ 
                          display: "inline-block",
                          padding: "4px 12px",
                          background: "#dbeafe",
                          color: "#1e40af",
                          borderRadius: "20px",
                          fontSize: "14px",
                          fontWeight: "600"
                        }}>
                          #{b.queueNumber}
                        </span>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span style={{ 
                          display: "inline-block",
                          padding: "6px 12px",
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "600"
                        }}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <select 
                          value={b.status} 
                          onChange={(e) => updateStatus(b.id, e.target.value)} 
                          style={{ 
                            padding: "8px 12px",
                            border: "2px solid #e5e7eb",
                            borderRadius: "6px",
                            fontSize: "14px",
                            background: "white",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                          onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                        >
                          <option value="WAITING">WAITING</option>
                          <option value="SERVING">SERVING</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


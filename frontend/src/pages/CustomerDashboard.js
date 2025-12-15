import React, { useEffect, useState } from "react";
import { api } from "../api/client";

export default function CustomerDashboard() {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [date, setDate] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const s = await api("/services");
    const b = await api("/bookings/mine");
    setServices(s);
    setBookings(b);
  }

  useEffect(() => { load(); }, []);

  async function book() {
    setMsg("");
    try {
      if (!selectedService || !date) return setMsg("Select service and date/time.");
      await api("/bookings", {
        method: "POST",
        body: JSON.stringify({ serviceId: selectedService, date }),
      });
      setMsg("Booking created.");
      setSelectedService("");
      setDate("");
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
    <div style={{ maxWidth: 1000, margin: "30px auto", padding: "0 20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <h2 style={{ color: "#1f2937", fontSize: "32px", fontWeight: "700", marginBottom: "30px" }}>Customer Dashboard</h2>
      
      <div style={{ 
        padding: "24px", 
        border: "none", 
        borderRadius: "12px", 
        marginBottom: "24px",
        background: "white",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
      }}>
        <h3 style={{ color: "#374151", fontSize: "20px", fontWeight: "600", marginBottom: "20px" }}>Create Booking</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1", minWidth: "250px" }}>
            <label htmlFor="customer-service" style={{ display: "block", marginBottom: "8px", color: "#6b7280", fontSize: "14px", fontWeight: "500" }}>Service</label>
            <select 
              id="customer-service"
              value={selectedService} 
              onChange={(e) => setSelectedService(e.target.value)} 
              style={{ 
                padding: "12px 16px", 
                width: "100%",
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
              <option value="">Select Service</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} (Provider: {s.provider?.fullName})
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: "1", minWidth: "200px" }}>
            <label htmlFor="customer-date" style={{ display: "block", marginBottom: "8px", color: "#6b7280", fontSize: "14px", fontWeight: "500" }}>Date & Time</label>
            <input 
              id="customer-date"
              type="datetime-local" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              style={{ 
                padding: "12px 16px", 
                width: "100%",
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
            onClick={book} 
            style={{ 
              padding: "12px 24px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 6px rgba(59, 130, 246, 0.3)"
            }}
            onMouseOver={(e) => e.target.style.background = "#2563eb"}
            onMouseOut={(e) => e.target.style.background = "#3b82f6"}
          >
            Book Now
          </button>
        </div>
        {msg && (
          <p style={{ 
            color: msg.includes("created") ? "#059669" : "#ef4444", 
            marginTop: "16px", 
            padding: "12px",
            background: msg.includes("created") ? "#d1fae5" : "#fee2e2",
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
        <h3 style={{ color: "#374151", fontSize: "20px", fontWeight: "600", marginBottom: "20px" }}>My Bookings</h3>
        {bookings.length === 0 ? (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}>No bookings yet. Create your first booking above!</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table width="100%" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                  <th align="left" style={{ padding: "12px 16px", color: "#374151", fontWeight: "600", fontSize: "14px" }}>Service</th>
                  <th align="left" style={{ padding: "12px 16px", color: "#374151", fontWeight: "600", fontSize: "14px" }}>Date</th>
                  <th align="left" style={{ padding: "12px 16px", color: "#374151", fontWeight: "600", fontSize: "14px" }}>Queue</th>
                  <th align="left" style={{ padding: "12px 16px", color: "#374151", fontWeight: "600", fontSize: "14px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const statusStyle = getStatusColor(b.status);
                  return (
                    <tr key={b.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "16px", color: "#1f2937", fontWeight: "500" }}>{b.service?.title}</td>
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


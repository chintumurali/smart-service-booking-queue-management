const express = require("express");
const cors = require("cors");
const authRoutes = require("./modules/auth/auth.routes");
const serviceRoutes = require("./modules/services/services.routes");
const bookingRoutes = require("./modules/bookings/bookings.routes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);

app.use(errorHandler);

module.exports = app;


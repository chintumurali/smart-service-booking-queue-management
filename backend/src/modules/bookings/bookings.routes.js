const router = require("express").Router();
const { requireAuth, requireRole } = require("../../middleware/auth");
const {
  createBooking,
  myBookings,
  providerBookings,
  updateBookingStatus,
} = require("./bookings.controller");

router.post("/", requireAuth, requireRole("CUSTOMER"), createBooking);
router.get("/mine", requireAuth, requireRole("CUSTOMER"), myBookings);
router.get("/provider", requireAuth, requireRole("PROVIDER", "ADMIN"), providerBookings);
router.patch("/:id/status", requireAuth, requireRole("PROVIDER", "ADMIN"), updateBookingStatus);

module.exports = router;


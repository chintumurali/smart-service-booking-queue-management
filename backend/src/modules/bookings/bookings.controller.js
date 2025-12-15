const { z } = require("zod");
const { prisma } = require("../../config/db");

const createSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().min(1), // ISO date string
});

async function createBooking(req, res, next) {
  try {
    const data = createSchema.parse(req.body);
    const bookingDate = new Date(data.date);
    // next queue number per service+date
    const max = await prisma.booking.aggregate({
      where: { serviceId: data.serviceId, date: bookingDate, status: { not: "CANCELLED" } },
      _max: { queueNumber: true },
    });
    const nextQueue = (max._max.queueNumber || 0) + 1;

    const booking = await prisma.booking.create({
      data: {
        customerId: req.user.userId,
        serviceId: data.serviceId,
        date: bookingDate,
        queueNumber: nextQueue,
      },
      include: { service: true },
    });

    res.status(201).json(booking);
  } catch (err) {
    if (err.name === "ZodError") return res.status(400).json({ message: "Validation error", details: err.errors });
    next(err);
  }
}

async function myBookings(req, res, next) {
  try {
    const list = await prisma.booking.findMany({
      where: { customerId: req.user.userId },
      include: { service: { include: { provider: { select: { fullName: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

async function providerBookings(req, res, next) {
  try {
    // provider sees bookings for provider's services
    const list = await prisma.booking.findMany({
      where: {
        service: { providerId: req.user.userId },
      },
      include: {
        service: true,
        customer: { select: { fullName: true, email: true } },
      },
      orderBy: [{ date: "desc" }, { queueNumber: "asc" }],
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

const statusSchema = z.object({
  status: z.enum(["WAITING", "SERVING", "COMPLETED", "CANCELLED"]),
});

async function updateBookingStatus(req, res, next) {
  try {
    const data = statusSchema.parse(req.body);
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { service: true },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // provider and admin can only update bookings for their own services
    if ((req.user.role === "PROVIDER" || req.user.role === "ADMIN") && booking.service.providerId !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: data.status },
    });

    res.json(updated);
  } catch (err) {
    if (err.name === "ZodError") return res.status(400).json({ message: "Validation error", details: err.errors });
    next(err);
  }
}

module.exports = { createBooking, myBookings, providerBookings, updateBookingStatus };


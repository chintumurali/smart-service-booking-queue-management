const { z } = require("zod");
const { prisma } = require("../../config/db");

const createSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
});

async function createService(req, res, next) {
  try {
    const data = createSchema.parse(req.body);
    const service = await prisma.service.create({
      data: {
        providerId: req.user.userId,
        title: data.title,
        description: data.description || null,
      },
    });
    res.status(201).json(service);
  } catch (err) {
    if (err.name === "ZodError") return res.status(400).json({ message: "Validation error", details: err.errors });
    next(err);
  }
}

async function listServices(req, res, next) {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      include: { provider: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(services);
  } catch (err) {
    next(err);
  }
}

async function providerServices(req, res, next) {
  try {
    const services = await prisma.service.findMany({
      where: { providerId: req.user.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(services);
  } catch (err) {
    next(err);
  }
}

module.exports = { createService, listServices, providerServices };


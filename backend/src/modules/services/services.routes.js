const router = require("express").Router();
const { requireAuth, requireRole } = require("../../middleware/auth");
const { createService, listServices, providerServices } = require("./services.controller");

router.get("/", listServices);
router.get("/mine", requireAuth, requireRole("PROVIDER", "ADMIN"), providerServices);
router.post("/", requireAuth, requireRole("PROVIDER", "ADMIN"), createService);

module.exports = router;


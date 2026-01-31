import express from "express";
import { Truck, Driver } from "../db.js";
import { authenticate, ownerOnly } from "../middlewares/auth.js";

const router = express.Router();

// Create truck
router.post("/", authenticate, ownerOnly, async (req, res) => {
  const truck = await Truck.create({
    ...req.body,
    owner: req.user.id,
  });
  res.json(truck);
});

// Get owner trucks
router.get("/", authenticate, ownerOnly, async (req, res) => {
  const trucks = await Truck.find({ owner: req.user.id });
  res.json(trucks);
});

// Create driver for a truck (owner can assign a driver record to their truck)
router.post("/:truckId/driver", authenticate, ownerOnly, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const truck = await Truck.findById(req.params.truckId);
    if (!truck) return res.status(404).json({ message: "Truck not found" });
    if (truck.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const driver = await Driver.create({ name, phone, truck: truck._id });
    res.json(driver);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update truck destination (owner only)
router.patch(
  "/:truckId/destination",
  authenticate,
  ownerOnly,
  async (req, res) => {
    try {
      const { city, lat, lng } = req.body;
      const truck = await Truck.findById(req.params.truckId);
      if (!truck) return res.status(404).json({ message: "Truck not found" });
      if (truck.owner.toString() !== req.user.id)
        return res.status(403).json({ message: "Not authorized" });

      truck.destination = { city, lat, lng };
      await truck.save();

      res.json(truck);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Update truck password (owner only)
router.patch(
  "/:truckId/password",
  authenticate,
  ownerOnly,
  async (req, res) => {
    try {
      const { password } = req.body;
      if (!password || String(password).length < 4)
        return res
          .status(400)
          .json({ message: "Password required (min 4 chars)" });

      const truck = await Truck.findById(req.params.truckId);
      if (!truck) return res.status(404).json({ message: "Truck not found" });
      if (truck.owner.toString() !== req.user.id)
        return res.status(403).json({ message: "Not authorized" });

      truck.password = String(password);
      await truck.save();

      res.json({ message: "Password updated" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

export default router;

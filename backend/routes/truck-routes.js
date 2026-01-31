import express from "express";
import { Truck } from "../db.js";
import { authenticate, ownerOnly } from "../middlewares/auth.js";

const router = express.Router();

// Create truck
router.post("/", authenticate, ownerOnly, async (req, res) => {
  try {
    const { truckNumber, password, capacityTons, ...rest } = req.body;

    if (!truckNumber || truckNumber.toString().trim() === "") {
      return res.status(400).json({ message: "truckNumber is required" });
    }

    // Build payload and avoid sending empty password so Mongoose default can apply
    const payload = { truckNumber, capacityTons, ...rest, owner: req.user.id };
    if (password !== undefined && password !== null && password.toString().trim() !== "") {
      payload.password = password;
    }

    const truck = await Truck.create(payload);
    res.json(truck);
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message).join("; ");
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Get owner trucks
router.get("/", authenticate, ownerOnly, async (req, res) => {
  const trucks = await Truck.find({ owner: req.user.id });
  res.json(trucks);
});

export default router;

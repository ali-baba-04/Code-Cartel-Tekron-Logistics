import express from "express";
import jwt from "jsonwebtoken";
import { User, Truck } from "../db.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// Signup (USER / OWNER)
router.post("/signup", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Signup failed" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.json({ token, role: user.role });
});

// TRUCK LOGIN (for drivers)
router.post("/truck-login", async (req, res) => {
  try {
    const { truckNo, password } = req.body;

    if (!truckNo || !password) {
      return res
        .status(400)
        .json({ message: "Truck number and password required" });
    }

    // Find truck by truckNumber (not truckNo - adjust based on your schema)
    const truck = await Truck.findOne({ truckNumber: truckNo });

    if (!truck) {
      return res.status(401).json({ message: "Truck not found" });
    }

    // Compare password (in production, use hashed passwords)
    // Note: Your Truck model doesn't have a password field yet - need to add it
    if (truck.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token for truck/driver
    const token = jwt.sign(
      {
        id: truck._id,
        role: "TRUCK",
        truckNumber: truck.truckNumber,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      role: "TRUCK",
      truckId: truck._id,
      truckNumber: truck.truckNumber,
      capacityTons: truck.capacityTons,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current authenticated user or truck
router.get("/me", authenticate, async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user.id).select("-password");
      return res.json({ type: "USER", user });
    }

    if (req.truck) {
      const truck = await Truck.findById(req.truck.id);
      if (!truck) return res.status(404).json({ message: "Truck not found" });
      return res.json({ type: "TRUCK", truck });
    }

    return res.status(401).json({ message: "Not authenticated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

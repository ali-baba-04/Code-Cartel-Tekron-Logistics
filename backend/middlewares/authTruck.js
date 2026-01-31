// middleware/authTruck.js
import jwt from "jsonwebtoken";
import { Truck } from "../db.js";

export const authenticateTruck = async (req, res, next) => {
  try {
    // First, try to authenticate via Bearer token
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const truck = await Truck.findById(decoded.id);
        if (!truck) return res.status(401).json({ message: "Truck not found" });
        req.truck = truck;
        return next();
      } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
    }

    // Fallback: authenticate using truckNumber (truckNo) + password in body
    const { truckNo, password } = req.body;

    if (!truckNo || !password) {
      return res
        .status(400)
        .json({ message: "Truck number and password required" });
    }

    const truck = await Truck.findOne({ truckNumber: truckNo });
    if (!truck) {
      return res.status(401).json({ message: "Truck not found" });
    }

    if (truck.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    req.truck = truck; // attach truck to request
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

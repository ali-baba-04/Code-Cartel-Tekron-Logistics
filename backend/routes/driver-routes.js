import express from "express";
import { Truck, Trip } from "../db.js";
import { authenticate, truckOnly } from "../middlewares/auth.js";

const router = express.Router();

// Driver updates GPS + status + usedTons
router.post("/update/:truckId", authenticate, truckOnly, async (req, res) => {
  try {
    // Ensure truckId matches authenticated truck
    if (req.truck.id.toString() !== req.params.truckId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Truck ID mismatch" });
    }

    const {
      lat,
      lng,
      containerAvailable,
      delayMinutes,
      usedTons,
      status,
      destination,
    } = req.body;

    // Validate usedTons doesn't exceed capacity
    const truck = await Truck.findById(req.params.truckId);
    if (usedTons && usedTons > truck.capacityTons) {
      return res.status(400).json({
        message: `Used tons (${usedTons}) exceeds capacity (${truck.capacityTons})`,
      });
    }

    const updateData = {};
    if (lat !== undefined && lng !== undefined) {
      updateData.currentLocation = { lat, lng };
    }
    if (containerAvailable !== undefined) {
      updateData.containerAvailable = containerAvailable;
    }
    if (delayMinutes !== undefined) {
      updateData.delayMinutes = delayMinutes;
    }
    if (usedTons !== undefined) {
      updateData.usedTons = usedTons;
    }
    if (status && ["IDLE", "ON_TRIP"].includes(status)) {
      updateData.status = status;
    }
    if (
      destination &&
      typeof destination === "object" &&
      destination.city !== undefined &&
      destination.lat !== undefined &&
      destination.lng !== undefined
    ) {
      updateData.destination = {
        city: destination.city,
        lat: destination.lat,
        lng: destination.lng,
      };
    }

    const updatedTruck = await Truck.findByIdAndUpdate(
      req.params.truckId,
      updateData,
      { new: true },
    );

    res.json({
      message: "Truck updated successfully",
      truck: {
        id: updatedTruck._id,
        truckNumber: updatedTruck.truckNumber,
        currentLocation: updatedTruck.currentLocation,
        destination: updatedTruck.destination,
        containerAvailable: updatedTruck.containerAvailable,
        delayMinutes: updatedTruck.delayMinutes,
        usedTons: updatedTruck.usedTons,
        availableTons: updatedTruck.availableTons,
        status: updatedTruck.status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get truck info (for driver to view)
router.get("/info/:truckId", authenticate, truckOnly, async (req, res) => {
  try {
    if (req.truck.id.toString() !== req.params.truckId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Truck ID mismatch" });
    }

    const truck = await Truck.findById(req.params.truckId);
    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    res.json({
      id: truck._id,
      truckId: truck._id,
      truckNumber: truck.truckNumber,
      capacityTons: truck.capacityTons,
      usedTons: truck.usedTons,
      availableTons: truck.availableTons,
      currentLocation: truck.currentLocation,
      destination: truck.destination,
      containerAvailable: truck.containerAvailable,
      delayMinutes: truck.delayMinutes,
      status: truck.status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Trip endpoints: start, update, end, get active trip
router.post("/trip/start", authenticate, truckOnly, async (req, res) => {
  try {
    const truck = await Truck.findById(req.truck.id);
    if (!truck) return res.status(404).json({ message: "Truck not found" });

    const { startLocation } = req.body;
    const trip = await Trip.create({
      truck: truck._id,
      startTime: new Date(),
      startLocation: startLocation || truck.currentLocation || {},
      updates: startLocation
        ? [{ ...startLocation, timestamp: new Date() }]
        : [],
    });

    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/trip/:tripId/update",
  authenticate,
  truckOnly,
  async (req, res) => {
    try {
      const { lat, lng } = req.body;
      const trip = await Trip.findById(req.params.tripId);
      if (!trip) return res.status(404).json({ message: "Trip not found" });
      if (trip.truck.toString() !== req.truck.id)
        return res.status(403).json({ message: "Not authorized" });

      trip.updates.push({ lat, lng, timestamp: new Date() });
      await trip.save();

      // update truck currentLocation
      await Truck.findByIdAndUpdate(req.truck.id, {
        currentLocation: { lat, lng },
      });

      res.json({ message: "Trip update saved", trip });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

router.post("/trip/:tripId/end", authenticate, truckOnly, async (req, res) => {
  try {
    const { endLocation } = req.body;
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (trip.truck.toString() !== req.truck.id)
      return res.status(403).json({ message: "Not authorized" });

    if (endLocation)
      trip.updates.push({ ...endLocation, timestamp: new Date() });
    trip.endTime = new Date();
    await trip.save();

    // set truck status to IDLE
    await Truck.findByIdAndUpdate(req.truck.id, { status: "IDLE" });

    res.json({ message: "Trip ended", trip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/trip/active", authenticate, truckOnly, async (req, res) => {
  try {
    const trip = await Trip.findOne({ truck: req.truck.id, endTime: null });
    if (!trip) return res.json({ active: false });
    res.json({ active: true, trip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

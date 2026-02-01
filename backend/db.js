// db.js
import mongoose from "mongoose";

// 🔗 MongoDB Connection
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: "logistics_ai",
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  }
};

/* =========================
   USER (OWNER / USER)
========================= */
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["OWNER", "USER"],
      required: true,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);

/* =========================
   TRUCK
========================= */
const truckSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    truckNumber: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      // ADD THIS FIELD
      type: String,
      required: true,
      default: "driver123", // Default password, should be changed
    },

    capacityTons: {
      type: Number,
      required: true,
    },

    usedTons: {
      type: Number,
      default: 0,
    },

    currentLocation: {
      lat: Number,
      lng: Number,
    },

    destination: {
      city: String,
      lat: Number,
      lng: Number,
    },

    containerAvailable: {
      type: Boolean,
      default: true,
    },

    delayMinutes: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["IDLE", "ON_TRIP"],
      default: "IDLE",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// Virtual field for available capacity
truckSchema.virtual("availableTons").get(function () {
  return this.capacityTons - (this.usedTons || 0);
});

export const Truck = mongoose.model("Truck", truckSchema);

/* =========================
   DRIVER (NO SIGNUP)
========================= */
const driverSchema = new mongoose.Schema({
  name: String,
  phone: String,

  truck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Truck",
  },
});

export const Driver = mongoose.model("Driver", driverSchema);

/* =========================
   PR (LOAD REQUEST)
========================= */
const prSchema = new mongoose.Schema(
  {
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    pickup: String,
    drop: String,
    distanceKm: Number,
    loadTons: Number,
    priceOffered: Number,

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },

    agentEvaluation: {
      recommended: Boolean,
      expectedProfit: Number,
      risk: String,
      reason: String,
    },
  },
  { timestamps: true },
);

export const PR = mongoose.model("PR", prSchema);

/* =========================
   TRIP (Telemetry)
========================= */
const tripSchema = new mongoose.Schema(
  {
    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      required: true,
    },
    startTime: Date,
    endTime: Date,
    startLocation: {
      lat: Number,
      lng: Number,
    },
    updates: [
      {
        lat: Number,
        lng: Number,
        timestamp: Date,
      },
    ],
  },
  { timestamps: true },
);

export const Trip = mongoose.model("Trip", tripSchema);

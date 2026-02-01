import express from "express";
import { PR } from "../db.js";
import { authenticate, userOnly, ownerOnly } from "../middlewares/auth.js";

const router = express.Router();

// User raises PR
router.post("/", authenticate, userOnly, async (req, res) => {
  const pr = await PR.create({
    ...req.body,
    raisedBy: req.user.id
  });
  res.json(pr);
});

// User views own PRs
router.get("/my", authenticate, userOnly, async (req, res) => {
  const prs = await PR.find({ raisedBy: req.user.id });
  res.json(prs);
});

// Owner views pending PRs
router.get("/pending", authenticate, ownerOnly, async (req, res) => {
  const prs = await PR.find({ status: "PENDING" });
  res.json(prs);
});

// Owner accepts a PR (closes it)
router.post("/:prId/accept", authenticate, ownerOnly, async (req, res) => {
  try {
    const pr = await PR.findById(req.params.prId);
    if (!pr) return res.status(404).json({ message: "PR not found" });
    if (pr.status !== "PENDING") return res.status(400).json({ message: "PR already processed" });

    pr.status = "ACCEPTED";
    await pr.save();
    res.json({ message: "PR accepted", pr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Owner rejects a PR
router.post("/:prId/reject", authenticate, ownerOnly, async (req, res) => {
  try {
    const pr = await PR.findById(req.params.prId);
    if (!pr) return res.status(404).json({ message: "PR not found" });
    if (pr.status !== "PENDING") return res.status(400).json({ message: "PR already processed" });

    pr.status = "REJECTED";
    await pr.save();
    res.json({ message: "PR rejected", pr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

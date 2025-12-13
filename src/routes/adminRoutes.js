import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect, superAdminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* -------------------------------------------------
   CREATE COMPANY
------------------------------------------------- */
router.post("/companies", protect, superAdminOnly, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        message: "Company with this email already exists",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const company = await User.create({
      name,
      email,
      password: hashed,
      role: "COMPANY",
      isActive: true,
    });

    res.status(201).json({
      message: "Company created successfully",
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        isActive: company.isActive,
      },
    });
  } catch (err) {
    console.error("Create company error:", err);

    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: "Failed to create company" });
  }
});

/* -------------------------------------------------
   LIST COMPANIES
------------------------------------------------- */
router.get("/companies", protect, superAdminOnly, async (req, res) => {
  try {
    const companies = await User.find({ role: "COMPANY" }).select("-password");
    res.json(companies);
  } catch (err) {
    console.error("List companies error:", err);
    res.status(500).json({ message: "Failed to fetch companies" });
  }
});

/* -------------------------------------------------
   UPDATE COMPANY
------------------------------------------------- */
router.put("/companies/:id", protect, superAdminOnly, async (req, res) => {
  try {
    // Prevent role tampering
    delete req.body.role;
    delete req.body.password;

    // Prevent duplicate email update
    if (req.body.email) {
      const exists = await User.findOne({
        email: req.body.email,
        _id: { $ne: req.params.id },
      });

      if (exists) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update company error:", err);
    res.status(500).json({ message: "Failed to update company" });
  }
});

/* -------------------------------------------------
   DELETE COMPANY (Hard delete)
   ⚠️ Optional: convert to soft delete later
------------------------------------------------- */
router.delete("/companies/:id", protect, superAdminOnly, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: "Company deleted successfully" });
  } catch (err) {
    console.error("Delete company error:", err);
    res.status(500).json({ message: "Failed to delete company" });
  }
});

/* -------------------------------------------------
   ACTIVATE / DEACTIVATE COMPANY
------------------------------------------------- */
router.patch(
  "/companies/:id/status",
  protect,
  superAdminOnly,
  async (req, res) => {
    try {
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res
          .status(400)
          .json({ message: "isActive must be boolean" });
      }

      const updated = await User.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
      ).select("-password");

      if (!updated) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json({
        message: `Company ${isActive ? "activated" : "deactivated"}`,
        company: updated,
      });
    } catch (err) {
      console.error("Status update error:", err);
      res.status(500).json({ message: "Failed to update status" });
    }
  }
);

export default router;

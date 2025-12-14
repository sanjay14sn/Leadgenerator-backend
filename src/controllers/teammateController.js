import bcrypt from "bcryptjs";
import Teammate from "../models/Teammate.js";

/* ----------------------------------------------------
   CREATE / ONBOARD TEAMMATE (ADMIN)
---------------------------------------------------- */
export const createTeammate = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      monthly_target,
      instructions,
      permissions,
      languages,
      regions,
      working_hours,
      weekly_off,
      salary,
    } = req.body;

    // Auto credentials
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const teammate = await Teammate.create({
      name,
      email,
      phone,
      role,
      monthly_target,
      instructions,
      permissions,
      languages,
      regions,
      working_hours,
      weekly_off,
      salary,

      credentials: {
        username: email,
        password: hashedPassword,
      },

      createdBy: req.user.id,
    });

    res.json({
      success: true,
      teammate,
      login_credentials: {
        username: email,
        password: rawPassword, // send once (show admin)
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ----------------------------------------------------
   LIST ALL TEAMMATES (ADMIN)
---------------------------------------------------- */
export const getTeammates = async (req, res) => {
  const list = await Teammate.find({ createdBy: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(list);
};

/* ----------------------------------------------------
   TOGGLE ACTIVE / INACTIVE
---------------------------------------------------- */
export const toggleTeammateStatus = async (req, res) => {
  const teammate = await Teammate.findById(req.params.id);
  teammate.isActive = !teammate.isActive;
  await teammate.save();

  res.json({ success: true, isActive: teammate.isActive });
};

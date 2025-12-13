import Admin from "../models/Admin.js";
import { generateJWT } from "../utils/simpleJwt.js";

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // find admin
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(400).json({ error: "Invalid email or password" });

  const hash = Admin.hashPassword(password);
  if (hash !== admin.passwordHash) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = generateJWT(
    { id: admin._id, email: admin.email },
    process.env.JWT_SECRET
  );

  res.json({ success: true, token });
};

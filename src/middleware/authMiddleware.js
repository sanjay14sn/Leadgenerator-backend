import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded must contain: id, email, role
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function superAdminOnly(req, res, next) {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "SUPER_ADMIN only" });
  }
  next();
}

export function companyOnly(req, res, next) {
  if (req.user.role !== "COMPANY") {
    return res.status(403).json({ message: "COMPANY only" });
  }
  next();
}

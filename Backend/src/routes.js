import express from "express";
import authRoutes from "./core/auth/auth.routes.js";
import { authenticate } from "./core/auth/auth.middleware.js";

const router = express.Router();

router.get("/secure-test", authenticate, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});
router.use("/auth", authRoutes);

export default router;

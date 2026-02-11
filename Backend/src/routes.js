import express from "express";
import authRoutes from "./core/auth/auth.routes.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Hyper Kitchen Hub API",
    version: "v1",
  });
});
router.use("/auth", authRoutes);

export default router;

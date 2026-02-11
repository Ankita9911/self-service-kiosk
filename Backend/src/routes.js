import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Hyper Kitchen Hub API",
    version: "v1",
  });
});

export default router;

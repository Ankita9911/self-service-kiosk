import express from "express";
import * as controller from "./controller/recommendation.controller.js";

const router = express.Router();

router.get("/trending", controller.getTrending);

router.get(
  "/frequently-bought-together",
  controller.getFrequentlyBoughtTogether,
);

router.get("/complete-meal", controller.getCompleteMeal);

export default router;

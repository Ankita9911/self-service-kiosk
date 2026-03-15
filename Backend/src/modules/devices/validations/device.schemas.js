import { z } from "zod";
import {
  objectIdSchema,
  statusSchema,
} from "../../../shared/validation/common.schemas.js";

export const createDeviceSchema = z.object({
  outletId: objectIdSchema,
  name: z.string().trim().optional(),
  landingImage: z.string().optional(),
  landingTitle: z.string().trim().optional(),
  landingSubtitle: z.string().trim().optional(),
});

export const updateDeviceSchema = z.object({
  name: z.string().trim().optional(),
});

export const setDeviceStatusSchema = z.object({
  status: statusSchema,
});

export const heartbeatSchema = z.object({
  appVersion: z.string().optional(),
  osVersion: z.string().optional(),
});

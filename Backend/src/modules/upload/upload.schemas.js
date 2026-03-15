import { z } from "zod";

export const uploadSchema = z.object({
  fileName: z.string({ required_error: "fileName is required" }).min(1),
  fileType: z.string({ required_error: "fileType is required" }).min(1),
  folder: z.string({ required_error: "folder is required" }).min(1),
});

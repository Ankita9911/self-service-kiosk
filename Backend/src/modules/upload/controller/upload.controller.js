import { asyncHandler } from "../../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../../shared/utils/response.js";
import { getUploadUrl } from "../service/upload.service.js";

export const generateUploadUrl = asyncHandler(async (req, res) => {
  const result = await getUploadUrl(req.body, req.tenant);

  return sendSuccess(res, {
    message: "Upload URL generated successfully",
    data: result,
  });
});

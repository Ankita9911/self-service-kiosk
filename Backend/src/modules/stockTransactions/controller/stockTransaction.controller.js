import { asyncHandler } from "../../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../../shared/utils/response.js";
import * as stockTransactionService from "../service/stockTransaction.service.js";

export const createManualTransaction = asyncHandler(async (req, res) => {
  const transaction = await stockTransactionService.createManualTransaction(
    req.body,
    req.tenant,
  );
  return sendSuccess(res, {
    statusCode: 201,
    message: "Stock transaction recorded",
    data: transaction,
  });
});

export const getTransactions = asyncHandler(async (req, res) => {
  const result = await stockTransactionService.getTransactions(
    req.tenant,
    req.query,
  );
  return sendSuccess(res, {
    message: "Stock transactions fetched",
    data: result.items,
    meta: result.meta,
  });
});

export const getTransactionsByIngredient = asyncHandler(async (req, res) => {
  const result = await stockTransactionService.getTransactionsByIngredient(
    req.params.ingredientId,
    req.tenant,
    req.query,
  );
  return sendSuccess(res, {
    message: "Stock transaction history fetched",
    data: result.items,
    meta: result.meta,
  });
});

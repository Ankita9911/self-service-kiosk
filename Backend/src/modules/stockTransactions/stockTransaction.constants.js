/**
 * stockTransaction.constants.js
 *
 * Single source of truth for stock transaction domain enums.
 */

export const TRANSACTION_TYPE = {
  PURCHASE:    "PURCHASE",
  CONSUMPTION: "CONSUMPTION",
  WASTAGE:     "WASTAGE",
  ADJUSTMENT:  "ADJUSTMENT",
};

export const REFERENCE_TYPE = {
  ORDER:  "ORDER",
  MANUAL: "MANUAL",
};

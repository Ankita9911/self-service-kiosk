/**
 * order.constants.js
 *
 * Single source of truth for all order-domain enums and transition rules.
 * Import from here instead of repeating inline strings in models, services, and handlers.
 */

export const ORDER_STATUS = {
  CREATED:    "CREATED",
  IN_KITCHEN: "IN_KITCHEN",
  READY:      "READY",
  COMPLETED:  "COMPLETED",
  PICKED_UP:  "PICKED_UP",
};

// Defines the only allowed forward transitions for each status.
// Used by order.service.js and the queue handler for validation.
export const VALID_STATUS_TRANSITIONS = {
  [ORDER_STATUS.CREATED]:    [ORDER_STATUS.IN_KITCHEN],
  [ORDER_STATUS.IN_KITCHEN]: [ORDER_STATUS.READY],
  [ORDER_STATUS.READY]:      [ORDER_STATUS.PICKED_UP, ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.COMPLETED]:  [ORDER_STATUS.PICKED_UP],
  [ORDER_STATUS.PICKED_UP]:  [],
};

export const PAYMENT_METHOD = {
  CASH: "CASH",
  CARD: "CARD",
  UPI:  "UPI",
};

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
};

export const ORDER_REQUEST_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED:  "FAILED",
};

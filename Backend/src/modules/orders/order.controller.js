import AppError from "../../shared/errors/AppError.js";
import * as orderService from "./order.service.js";

export async function createOrder(req, res, next) {
  try {
    const result = await orderService.createOrder(
      req.body,
      req.tenant,
      req.user.role
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function listOrders(req, res, next) {
  try {
    const { statuses } = req.query;
    const statusArray = statuses ? statuses.split(",").filter(Boolean) : null;
    const result = await orderService.listOrders(req.tenant, statusArray);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) {
      return next(new AppError("Status is required", 400));
    }
    const result = await orderService.updateOrderStatus(
      req.params.id,
      status,
      req.tenant
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

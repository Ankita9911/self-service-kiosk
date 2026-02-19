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

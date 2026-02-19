import {
  createOutlet,
  getOutlets,
  getOutletById,
  updateOutlet,
  deleteOutlet,
} from "./outlet.service.js";

export async function createOutletController(req, res, next) {
  try {
    const outlet = await createOutlet(req.body, req.user);
    res.status(201).json({ success: true, data: outlet });
  } catch (error) {
    next(error);
  }
}

export async function getOutletsController(req, res, next) {
  try {
    const outlets = await getOutlets(req.user);
    res.status(200).json({ success: true, data: outlets });
  } catch (error) {
    next(error);
  }
}

export async function getOutletByIdController(req, res, next) {
  try {
    const { id } = req.body;

    if (!id) {
      throw new Error("ID is required");
    }

    const outlet = await getOutletById(id, req.user);
    res.status(200).json({ success: true, data: outlet });
  } catch (error) {
    next(error);
  }
}

export async function updateOutletController(req, res, next) {
  try {
    const { id, ...payload } = req.body;

    if (!id) {
      throw new Error("ID is required");
    }

    const outlet = await updateOutlet(id, payload, req.user);
    res.status(200).json({ success: true, data: outlet });
  } catch (error) {
    next(error);
  }
}

export async function deleteOutletController(req, res, next) {
  try {
    const { id } = req.body;

    if (!id) {
      throw new Error("ID is required");
    }

    const result = await deleteOutlet(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

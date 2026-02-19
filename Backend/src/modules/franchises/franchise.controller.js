import {
  createFranchise,
  getFranchises,
  getFranchiseById,
  updateFranchise,
  deleteFranchise,
} from "./franchise.service.js";

export async function createFranchiseController(
  req,
  res,
  next
) {
  try {
    const franchise = await createFranchise(
      req.body,
      req.user
    );
    res.status(201).json({ success: true, data: franchise });
  } catch (error) {
    next(error);
  }
}

export async function getFranchisesController(
  req,
  res,
  next
) {
  try {
    const franchises = await getFranchises(req.user);
    res.status(200).json({ success: true, data: franchises });
  } catch (error) {
    next(error);
  }
}

export async function getFranchiseByIdController(
  req,
  res,
  next
) {
  try {
    const { id } = req.body;
    const franchise = await getFranchiseById(
      id,
      req.user
    );
    res.status(200).json({ success: true, data: franchise });
  } catch (error) {
    next(error);
  }
}

export async function updateFranchiseController(
  req,
  res,
  next
) {
  try {
    const { id, ...payload } = req.body;
    const franchise = await updateFranchise(
      id,
      payload,
      req.user
    );
    res.status(200).json({ success: true, data: franchise });
  } catch (error) {
    next(error);
  }
}

export async function deleteFranchiseController(
  req,
  res,
  next
) {
  try {
    const { id } = req.body;
    const result = await deleteFranchise(
      id,
      req.user
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

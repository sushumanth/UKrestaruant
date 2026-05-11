import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { orderSchema } from '../validations/order.validation';
import { createOrder, getOrderById, listOrders } from '../services/order.service';

export const placeOrder = asyncHandler(async (request: Request, response: Response) => {
  const payload = orderSchema.parse(request.body);
  const order = await createOrder(payload);
  return response.status(201).json({ order });
});

export const getOrders = asyncHandler(async (request: Request, response: Response) => {
  const email = request.user?.role === 'customer' ? request.user.email : (request.query.email as string | undefined);

  const result = await listOrders({
    page: request.query.page as string | undefined,
    limit: request.query.limit as string | undefined,
    email,
  });

  return response.status(200).json(result);
});

export const getOrder = asyncHandler(async (request: Request, response: Response) => {
  const order = await getOrderById(String(request.params.id));
  return response.status(200).json({ order });
});

/* eslint-disable @typescript-eslint/no-var-requires */
import { Response } from 'express';

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function customUnauthorizedError(
  response: Response,
): Promise<void> {
  response
    .status(401)
    .json({ error: "You don't have the authority to make this request" });
}

export async function customGoneError(
  response: Response,
  resource: string,
): Promise<void> {
  response.status(410).json({ error: `${resource} Not Found` });
}

export async function customError(
  response: Response,
  error: string,
): Promise<void> {
  response.status(401).json({ error });
}

export async function customSuccess(
  response: Response,
  data?: any,
): Promise<void> {
  response.status(201).json({ success: 'Request Successful', data });
}

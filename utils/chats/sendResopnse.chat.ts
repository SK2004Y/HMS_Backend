import { Response } from "express";

interface SendResponseParams {
  res: Response;
  data: any;
  message: string;
  success: boolean;
  statusCode?: number;
}

export const sendResponse = ({
  res,
  data,
  message,
  success,
  statusCode = 200,
}: SendResponseParams) => {
  res.status(statusCode).json({
    success,
    message,
    data,
  });
};

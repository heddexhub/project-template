import { Request, Response, NextFunction } from "express";
import AppError from "../common/AppError";
import { CustomRequest, CustomResponse, CustomNextFunction, ResBodyType } from "../types/customHttpTypes";

export const toCustomRequest = (req: Request): CustomRequest => ({
  body: req.body,
  // add any other fields you commonly use
});

export const toCustomResponse = (res: Response): CustomResponse => {
  return {
    json: (body: ResBodyType) => res.json(body),
    status: (code: number) => {
      res.status(code);
      return res as CustomResponse;
    },
    // add any other methods you commonly use
  };
};

export const toCustomNext = (next: NextFunction): CustomNextFunction => {
  return (error?: AppError) => {
    next(error);
  };
};

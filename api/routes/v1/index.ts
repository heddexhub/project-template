import express from 'express';
import AppError from '../../common/AppError';
import UserRoutes from './userRoutes';

const mainRoute = `/api/v1`;

export const initializeRoutes = (app: express.Application, ) => {
    app.use(mainRoute, UserRoutes);
  
    app.get(`${mainRoute}/`, (_req, _res, next) => {
      // Some code...
      if (true) {
        next(new AppError("This is an operational error!", 400));
      }
    });
  };
  
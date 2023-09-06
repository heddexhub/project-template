import expressJwt from 'express-jwt';

const jwtSecret = process.env.JWT_SECRET;

export const authenticate = (expressJwt as any)({ secret: jwtSecret });;
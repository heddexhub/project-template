import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { log } from "../utils/logger";

import AppError from "../common/AppError";

import { User } from "../interfaces/IUser";

const jwtSecret: string | undefined = process.env.JWT_SECRET; // Providing a fallback value
if (!jwtSecret) {
  log("JWT", "alert", "API url is not defined");
  throw new AppError("JWT secret is not defined", 500);
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: "1h" });
};

export const verifyToken = (token: string): string | object => {
  return jwt.verify(token, jwtSecret);
};

export const validateCredentials = async (password: string, hashpassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashpassword);
  } catch (error) {
    console.error("Error validating credentials:", error);
    return false;
  }
};

export const getUserByEmail = (email: string): User | null => {
  // This is hard-coded data; you would typically fetch this from your database.
  const users: User[] = [
    {
      id: "1",
      username: "john_doe",
      email: "john@example.com",
      hashedPassword: "hashed_password_here", // again, typically hashed
    },
    {
      id: "2",
      username: "jane_doe",
      email: "jane@example.com",
      hashedPassword: "another_hashed_password_here", // again, typically hashed
    },
    // Add more hard-coded users as needed
  ];

  const user = users.find(u => u.email === email);
  return user || null;
};

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import {User} from '../interfaces/IUser';

const jwtSecret: string = process.env.JWT_SECRET || 'yourSecretKey';  // Providing a fallback value

export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: '1h' });
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
      id: '1',
      username: 'john_doe',
      email: 'john@example.com',
      hashedPassword: 'hashed_password_here' // again, typically hashed
    },
    {
      id: '2',
      username: 'jane_doe',
      email: 'jane@example.com',
      hashedPassword: 'another_hashed_password_here' // again, typically hashed
    },
    // Add more hard-coded users as needed
  ];

  const user = users.find(u => u.email === email);
  return user || null;
};
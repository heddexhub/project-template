import { generateToken, validateCredentials, getUserByEmail } from "../services/authService";
import AppError from "../common/AppError";
import { CustomRequest, CustomResponse, CustomNextFunction } from "../types/customHttpTypes";

function hasUsernameAndPassword(obj: any): obj is { email: string; password: string } {
  return obj && typeof obj.email === "string" && typeof obj.password === "string";
}

export const signIn = async (req: CustomRequest, res: CustomResponse, next: CustomNextFunction): Promise<void> => {
  if (hasUsernameAndPassword(req.body)) {
    const { email, password } = req.body;
    const user = getUserByEmail(email);
    if (user === null) {
      next(new AppError("User not found", 404));
      return;
    }
    try {
      const isPasswordValid = await validateCredentials(password, user.hashedPassword);
      if (isPasswordValid) {
        const token = generateToken(user.id);
        res.status(200).json({ token });
      } else {
        next(new AppError("Invalid email or password", 401));
      }
    } catch (error) {
      next(new AppError("Error during authentication", 500));
    }
  } else {
    next(new AppError("Missing email or password", 400));
  }
};

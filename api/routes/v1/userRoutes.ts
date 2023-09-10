import { signIn } from "../../controllers/authController";
import { Router } from "express";

const router = Router();

router.post("/signin", signIn);

export default router;

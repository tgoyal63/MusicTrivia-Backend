import { Router } from "express";
import AuthController from "controllers/auth.controller";
const router: Router = Router();

router.get("/sign-in", AuthController.signIn);
router.get("/callback", AuthController.callback);

export default router;

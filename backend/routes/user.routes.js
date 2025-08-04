import express from "express";
import {
  getCurrentUser,
  editProfile,
  getOtherUsers,
  search,
} from "../controllers/user.controllers.js";
import isAuth from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";

const userRouter = express.Router();
userRouter.get("/current", isAuth, getCurrentUser);
userRouter.get("/others", isAuth, getOtherUsers);
userRouter.put("/profile", isAuth, upload.single("image"), editProfile);
userRouter.get("/search", isAuth, search);

export default userRouter;

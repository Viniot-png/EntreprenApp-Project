import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const optionalAuthenticateToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    // If no tokens, continue without authentication
    if (!accessToken && !refreshToken) {
      return next();
    }

    let userData;

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        userData = decoded.user;
      } catch (accessError) {
        if (accessError.name !== "TokenExpiredError") {
          return next();
        }
      }
    }

    if (!userData && refreshToken) {
      try {
        const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        userData = refreshDecoded.user;

        const newAccessToken = jwt.sign(
          { user: userData },
          process.env.JWT_ACCESS_SECRET,
          { expiresIn: '15m' }
        );

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000
        });
      } catch (refreshError) {
        return next();
      }
    }

    if (!userData) {
      return next();
    }

    const dbUser = await User.findById(userData._id).select("-password");
    if (!dbUser) {
      return next();
    }

    req.user = { ...userData, ...dbUser.toObject() };
    next();

  } catch (error) {
    console.error("Optional authentication error:", error);
    next();
  }
};
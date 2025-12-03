import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authenticateToken = async (req, res, next) => {
  try {
    // Support both cookie-based tokens and Authorization Bearer header as a fallback
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;
    const authHeader = req.headers?.authorization || req.headers?.Authorization;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Please log in to access this resource" 
      });
    }

    let userData;

  
    if (!accessToken && authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      // If no cookie accessToken, try to read Bearer token from Authorization header
      try {
        const bearer = authHeader.split(' ')[1];
        const decoded = jwt.verify(bearer, process.env.JWT_ACCESS_SECRET);
        userData = decoded.user;
      } catch (hdrErr) {
        // ignore and fallback to cookie/refresh flow
      }
    }

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        userData = decoded.user;
        
        // ✨ Vérifier que user existe toujours
        const userExists = await User.findById(userData._id);
        if (!userExists) {
          return res.status(401).json({
            success: false,
            message: "User no longer exists"
          });
        }
      } catch (accessError) {
     
        if (accessError.name !== "TokenExpiredError") throw accessError;
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
        throw refreshError;
      }
    }


    if (!userData) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid or expired session" 
      });
    }

  
    const dbUser = await User.findById(userData._id).select("-password");
    if (!dbUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User account not found" 
      });
    }

    if (!dbUser.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: "Please verify your account first" 
      });
    }

    req.user = { ...userData, ...dbUser.toObject() };
    next();

  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid authentication" 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};
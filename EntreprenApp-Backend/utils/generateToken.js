import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateTokensAndSetCookies = (res, user) => {
    
    const accessToken = jwt.sign(
        { user },  
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
    );

    
    const refreshToken = jwt.sign(
        { user },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn:'7d' }
    );

    
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000 
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    return { accessToken, refreshToken };
};
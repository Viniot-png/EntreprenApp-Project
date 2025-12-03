import bcrypt from "bcrypt";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../nodemailer/emails.js";
import { generateTokensAndSetCookies } from "../utils/generateToken.js";
import { generateVerificationCode } from "../utils/codeVerification.js";
import { loginSchema, baseRegisterSchema, forgotPasswordSchema, resetPasswordSchema } from "../utils/validationSchemas.js";
import { uploadToCloudinary } from "../utils/mediaHelpers.js";

const roleProfiles = {
  entrepreneur: (body) => {
    if (!body.sector) throw new Error("Entrepreneur must specify a business sector");
    return { entrepreneurProfile: { sector: body.sector } };
  },
  investor: (body, doc) => ({
    investorProfile: {
      professionalEmail: body.professionalEmail,
      sector: body.sector,
      foundedYear: body.foundedYear,
      verificationDocument: doc,
    },
  }),
  startup: (body, doc) => ({
    startupProfile: {
      professionalEmail: body.professionalEmail,
      sector: body.sector,
      foundedYear: body.foundedYear,
      verificationDocument: doc,
    },
  }),
  organisation: (body, doc) => ({
    organizationProfile: {
      professionalEmail: body.professionalEmail,
      sector: body.sector,
      foundedYear: body.foundedYear,
      verificationDocument: doc,
    },
  }),
  university: (body) => {
    if (!body.universityName || !body.officialUniversityEmail)
      throw new Error("University must provide name and official email");
    return {
      universityProfile: {
        universityName: body.universityName,
        officialEmail: body.officialUniversityEmail,
      },
    };
  },
};

export const register = async (req, res) => {
  try {
    console.log('[REGISTER] Request body received:', {
      username: req.body.username,
      email: req.body.email,
      role: req.body.role,
      file: req.file ? 'Present' : 'Missing'
    });

    // Validate input with Zod
    const parsed = baseRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      console.log('[REGISTER] Validation errors:', errors);
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }

    // Normalize role: accept case-insensitive values and common French synonyms
    let { username, fullname, email, password, role, location } = parsed.data;
    const roleInput = String(role || '').toLowerCase().trim();
    const roleAliases = {
      entrepreneur: 'entrepreneur',
      "entrepreneur": 'entrepreneur',
      startup: 'startup',
      investisseur: 'investor',
      investor: 'investor',
      organisation: 'organisation',
      organization: 'organisation',
      orgnisation: 'organisation', // common misspelling
      organisation_fr: 'organisation',
      universite: 'university',
      université: 'university',
      university: 'university'
    };

    const canonicalRole = roleAliases[roleInput] || roleInput; // default to provided role if not in aliases
    role = canonicalRole; // use canonical role from here onward

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: "This email is already taken" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = generateVerificationCode();
    let uploadedDoc = ["investor", "startup", "organisation"].includes(role)
      ? await uploadToCloudinary(req.file, `users/verification/${role}`)
      : null;

    const userData = {
      username,
      fullname,
      email,
      password: hashedPassword,
      role,
      location,
      gender: req.body.gender,
      dob: req.body.dob,
      verificationCode,
      verificationCodeExpireAt: Date.now() + 10 * 60 * 1000,
      ...(roleProfiles[role] ? roleProfiles[role](req.body, uploadedDoc) : {}),
    };

    if (!roleProfiles[role]) return res.status(400).json({ success: false, message: "Invalid role specified. Allowed roles: entrepreneur, investor, startup, organisation, university" });

    const newUser = await User.create(userData);
    sendVerificationEmail(newUser.email, verificationCode).catch(console.error);
    newUser.password = undefined;

    res.status(201).json({
      success: true,
      message: `User registered successfully, check your email ${newUser.email} to activate your account`,
      user: newUser,
    });
  } catch (err) {
    console.error("Registration error:", err);
    const message = err?.message || 'Server error during registration';
    // If error indicates missing required role fields, treat as 400 Bad Request
    const isValidationLike = /sector|university|must provide|must specify/i.test(message);
    if (isValidationLike) {
      return res.status(400).json({ success: false, message });
    }

    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { verificationCode } = req.body;
    if (!verificationCode || verificationCode.length !== 6)
      return res.status(400).json({ success: false, message: "Invalid verification code" });

    const user = await User.findOne({ verificationCode, verificationCodeExpireAt: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: "Invalid or expired verification code" });

    Object.assign(user, { verificationCode: undefined, verificationCodeExpireAt: undefined, isVerified: true });
    await user.save();
    // Generate auth tokens and set HTTP-only cookies so the user is logged in immediately after verification
    const tokens = generateTokensAndSetCookies(res, {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    });
    sendWelcomeEmail(user.email, user.fullname).catch(console.error);

    res.status(200).json({
      success: true,
      message: "Account activated successfully",
      data: { _id: user._id, username: user.username, email: user.email, isVerified: user.isVerified },
      tokens,
    });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ success: false, message: "An error occurred while verifying email" });
  }
};

export const Login = async (req, res) => {
  try {
    // Validate input with Zod
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(404).json({ success: false, message: "Invalid credentials" });
    if (!user.isVerified) return res.status(400).json({ success: false, message: "Account not activated" });

    const tokens = generateTokensAndSetCookies(res, {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    });

    res.status(200).json({
      success: true,
      message: `Welcome ${user.username}`,
      data: { _id: user._id, name: user.username, email: user.email, role: user.role, isVerified: user.isVerified },
      tokens,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error while logging into account" });
  }
};

export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const user = await User.findOne({ email });
    if (!user || user.isVerified)
      return res.status(user?.isVerified ? 400 : 200).json({
        success: !user?.isVerified,
        message: user?.isVerified
          ? "Account already activated"
          : "If an account exists with this email, a new code has been sent",
      });

    user.verificationCode = generateVerificationCode();
    user.verificationCodeExpireAt = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendVerificationEmail(user.email, user.verificationCode);

    res.status(200).json({ success: true, message: "New verification code sent", data: { email: user.email, expiresAt: user.verificationCodeExpireAt } });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ success: false, message: "Failed to resend verification code" });
  }
};

export const LogOut = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ success: false, message: "Error while logging out" });
  }
};

// Helper for uploading multiple images
const uploadImages = async (user, files) => {
  const images = {};
  if (!files) return images;
  
  for (const [key, fileArr] of Object.entries(files)) {
    if (!fileArr?.[0]) continue;
    
    // CloudinaryStorage already uploads to Cloudinary
    // So we just need to extract the URL and publicId from the file object
    const file = fileArr[0];
    
    // Delete old image from Cloudinary if it exists
    if (user[key]?.publicId) {
      try {
        await cloudinary.uploader.destroy(user[key].publicId);
      } catch (err) {
        console.error(`Error deleting old ${key}:`, err);
      }
    }
    
    // CloudinaryStorage provides path (URL) and filename
    // We need to extract the public_id from the filename or store it properly
    images[key] = {
      url: file.path || file.secure_url || '',
      publicId: file.filename || '' // CloudinaryStorage stores public_id in filename
    };
  }
  
  return images;
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const updateData = {
      fullname: req.body.fullname ?? user.fullname,
      gender: req.body.gender ?? user.gender,
      bio: req.body.bio ?? user.bio,
      email: req.body.email ?? user.email,
      dob: req.body.dob ?? user.dob,
      sector: req.body.sector ?? user.sector,
      location: req.body.location ?? user.location,
      ...(await uploadImages(user, req.files)),
    };

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
      select: "-password -resetPasswordToken -verificationCode",
    });

    generateTokensAndSetCookies(res, {
      _id: updatedUser._id,
      fullname: updatedUser.fullname,
      username: updatedUser.username,
      email: updatedUser.email,
      isVerified: updatedUser.isVerified,
      profileImage: updatedUser.profileImage,
      coverImage: updatedUser.coverImage,
    });

    res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedUser });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }
    const { email } = parsed.data;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(200).json({
        success: true,
        message: "If this email exists, you will receive a password reset link",
      });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    sendPasswordResetEmail(user.email, resetUrl).catch(console.error);

    res.status(200).json({
      success: true,
      message: "If this email exists, you will receive a password reset link",
      ...(process.env.NODE_ENV === "development" && { debug: { resetToken, resetUrl } }),
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, code: "PASSWORD_RESET_ERROR", message: "Error processing request" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }
    const { password } = parsed.data;

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpiresAt: { $gt: Date.now() } }).select("+password");

    if (!user) return res.status(400).json({ success: false, message: "Password reset token invalid or expired" });
    if (await bcrypt.compare(password, user.password))
      return res.status(400).json({ success: false, message: "New password must differ from current" });

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = user.resetPasswordExpiresAt = undefined;
    await user.save();
    sendResetSuccessEmail(user.email).catch(console.error);

    res.status(200).json({ success: true, message: "Password updated successfully", data: { userId: user._id, email: user.email } });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Error resetting password" });
  }
};

export const GetMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id).select("-password -verificationCode -verificationCodeExpireAt -resetPasswordToken -resetPasswordExpiresAt");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.isVerified) return res.status(404).json({ success: false, message: "Account not activated" });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};

export const getUserProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId).select("-password -verificationCode -verificationCodeExpireAt -resetPasswordToken -resetPasswordExpiresAt");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(404).json({ success: false, message: "User account not activated" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("Get user profile error:", err);
    res.status(500).json({ success: false, message: "Error fetching user profile" });
  }
};

export const refreshUserToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (!decoded?.user?._id) return res.status(403).json({ message: "Invalid refresh token payload" });

    const user = await User.findById(decoded.user._id).select("_id fullname username email isVerified profileImage coverImage");
    if (!user) return res.status(404).json({ message: "User not found" });

    generateTokensAndSetCookies(res, user);
    res.json({ message: "Token refreshed", user });
  } catch (err) {
    console.error("Refresh token error:", err);
    const msg = err.name === "TokenExpiredError" ? "Refresh token expired" : "Invalid refresh token";
    res.status(err.name === "TokenExpiredError" ? 401 : 403).json({ message: msg });
  }
};

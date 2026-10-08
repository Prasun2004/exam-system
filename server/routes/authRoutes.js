import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../Schema/UserSchema.js";

const router = express.Router();

// =====================================================
// CREATE JWT
// =====================================================

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

// =====================================================
// SIGNUP
// =====================================================

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      role,
    } = req.body;

    // -----------------------------
    // REQUIRED FIELDS
    // -----------------------------

    if (
      !email ||
      !password ||
      !confirmPassword ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // -----------------------------
    // PASSWORD MATCH
    // -----------------------------

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // -----------------------------
    // PASSWORD LENGTH
    // -----------------------------

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    // -----------------------------
    // ROLE VALIDATION
    // -----------------------------

    if (!["student", "teacher"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // -----------------------------
    // EMAIL VALIDATION
    // -----------------------------

    const normalizedEmail =
      email.trim().toLowerCase();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // -----------------------------
    // CHECK EXISTING USER
    // -----------------------------

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // -----------------------------
    // HASH PASSWORD
    // -----------------------------

    const hashedPassword =
      await bcrypt.hash(password, 12);

    // -----------------------------
    // CREATE USER
    // -----------------------------

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      role,
      name,
    });

    // -----------------------------
    // CREATE JWT
    // -----------------------------

    const token = generateToken(user);

    // -----------------------------
    // RESPONSE
    // -----------------------------

    return res.status(201).json({
      success: true,
      message: "Account created successfully",

      token,

      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });

  } catch (error) {

    console.error(
      "Signup error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error during signup",
    });
  }
});

// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // -----------------------------
    // REQUIRED FIELDS
    // -----------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    // -----------------------------
    // NORMALIZE EMAIL
    // -----------------------------

    const normalizedEmail =
      email.trim().toLowerCase();

    // -----------------------------
    // FIND USER
    // -----------------------------

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // -----------------------------
    // CHECK PASSWORD
    // -----------------------------

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // =================================================
    // JWT TOKEN
    // =================================================

    const token =
      generateToken(user);

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error during login",
    });
  }
});

// =====================================================
// CURRENT USER
// =====================================================

router.get(
  "/me",
  async (req, res) => {

    try {

      // -----------------------------
      // GET AUTHORIZATION HEADER
      // -----------------------------

      const authHeader =
        req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message:
            "Authorization token required",
        });
      }

      // -----------------------------
      // CHECK BEARER FORMAT
      // -----------------------------

      if (
        !authHeader.startsWith(
          "Bearer "
        )
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authorization format",
        });
      }

      // -----------------------------
      // GET TOKEN
      // -----------------------------

      const token =
        authHeader.split(" ")[1];

      // -----------------------------
      // VERIFY TOKEN
      // -----------------------------

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      // -----------------------------
      // RESPONSE
      // -----------------------------

      return res.json({
        success: true,

        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name,
        },
      });

    } catch (error) {

      console.error(
        "JWT verification error:",
        error.message
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired token",
      });
    }
  }
);

// =====================================================
// LOGOUT
// =====================================================

router.post(
  "/logout",
  (req, res) => {

    // JWT is stateless.
    // There is no session to destroy.

    return res.json({
      success: true,
      message:
        "Logged out successfully",
    });
  }
);

export default router;
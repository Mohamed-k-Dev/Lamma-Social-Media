import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { errorResponse } from "../response/ApiResponse.js";

export async function generateAccessToken({ data, options } = {}) {
  return jwt.sign(data, process.env.JWT_ACCESS_KEY, {
    ...options,
    expiresIn: process.env.JWT_ACCESS_EXPIRE,
    jwtid: nanoid(),
  });
}

export async function generateRefreshToken({ data, options } = {}) {
  return jwt.sign(data, process.env.JWT_REFRESH_KEY, {
    ...options,
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
    jwtid: nanoid(),
  });
}

export async function verifyAccessToken(token, res) {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_KEY);
  } catch (error) {
    if (error.name == "TokenExpiredError") {
      return errorResponse({
        res,
        message: "Access token is expired",
        status: 401,
      });
    } else if (error.name == "JsonWebTokenError") {
      return errorResponse({
        res,
        message: "Access token is invalid",
        status: 401,
      });
    }
  }
}

export async function verifyRefreshToken(token, res) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (error) {
    if (error.name == "TokenExpiredError") {
       errorResponse({
        res,
        message: "Refresh token is expired",
        status: 401,
      });
      return null;
    } else if (error.name == "JsonWebTokenError") {
       errorResponse({
        res,
        message: "Refresh token is invalid",
        status: 401,
      });
      return null;

    }
  }
}

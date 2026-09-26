import Joi from "joi";
import {
  AuthCommonFields,
  UserCommonFields,
} from "../Utils/validation/commonFields.utils.js";

export const signUpSchema = {
  body: Joi.object({
    userName: UserCommonFields.userName.required(),
    email: UserCommonFields.email.required(),
    password: UserCommonFields.password.required(),
    confirmPassword: UserCommonFields.confirmPassword.required(),
    gender: UserCommonFields.gender.required(),
    age: UserCommonFields.age.required(),
    phone: UserCommonFields.phone,
    address: UserCommonFields.address,
    bio: UserCommonFields.bio,
    birthDate: UserCommonFields.birthDate,
    imageUrl: UserCommonFields.imageUrl,
    coverImageUrl: UserCommonFields.coverImageUrl,
    role: UserCommonFields.role,
  }).messages({
    "object.unknown": "Unknown field: {{#label}}",
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: UserCommonFields.email.required(),
    password: UserCommonFields.password.required(),
  }),
};

export const verifyEmailSchema = {
  body: Joi.object({
    email: UserCommonFields.email.required(),
    otp: AuthCommonFields.otp.required(),
  }),
};

export const forgetPasswordSchema = {
  body: Joi.object({
    email: UserCommonFields.email.required(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    email: UserCommonFields.email.required(),
    otp: AuthCommonFields.otp.required(),
    password: UserCommonFields.password.required(),
    confirmPassword: UserCommonFields.confirmPassword.required(),
  }),
};

export const googleSchema = {
  body: Joi.object({
    idToken: AuthCommonFields.idToken.required(),
  }),
};

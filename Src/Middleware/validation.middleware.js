import { errorResponse } from "../Utils/response/ApiResponse.js";

export const validationMiddleware = (schema = {}) => {
  return (req, res, next) => {
    const arrOfSchemas = Object.keys(schema);
    const validationErrors = [];

    for (const key of arrOfSchemas) {
      const { error } = schema[key]?.validate(req[key], { abortEarly: false });
      validationErrors.push(...(error?.details || []));
    }

    if (validationErrors?.length > 0) {
      return errorResponse({
        res,
        message: "Validation error",
        status: 400,
        error: validationErrors?.map((err) => {
          return { message: err?.message, key: err?.context?.key };
        }),
      });
    }
    next();
  };
};

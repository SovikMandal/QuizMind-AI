import { RequestHandler } from "express";
import { ZodSchema } from "zod";

/** Validates and replaces req.body with the parsed result. */
export function validateBody(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
  };
}

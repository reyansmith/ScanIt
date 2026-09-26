import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export const isoNow = () => new Date().toISOString().replace('Z', '+00:00');
export const newId = () => randomUUID();

export class HttpError extends Error {
  constructor(status, detail, headers = {}) {
    super(typeof detail === 'string' ? detail : 'Request failed');
    this.status = status;
    this.detail = detail;
    this.headers = headers;
  }
}

function zodLocation(issue, location) {
  return [location, ...issue.path];
}

export function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const detail = result.error.issues.map((issue) => ({
        type: issue.code,
        loc: zodLocation(issue, 'body'),
        msg: issue.message,
        input: issue.input,
      }));
      return next(new HttpError(422, detail));
    }
    req.validatedBody = result.data;
    return next();
  };
}

export function validateQuery(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const detail = result.error.issues.map((issue) => ({
        type: issue.code,
        loc: zodLocation(issue, 'query'),
        msg: issue.message,
        input: issue.input,
      }));
      return next(new HttpError(422, detail));
    }
    req.validatedQuery = result.data;
    return next();
  };
}

export const nullableNumber = (schema) => z.preprocess(
  (value) => (value === null || value === undefined ? value : Number(value)),
  schema.nullable().optional(),
);

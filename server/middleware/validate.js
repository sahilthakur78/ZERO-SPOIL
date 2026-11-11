import { AppError } from '../utils/helpers.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const msg = result.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join(', ');
    return next(new AppError(msg, 400));
  }
  req.body = result.data;
  next();
};

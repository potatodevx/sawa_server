"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const AppError_1 = require("../utils/AppError");
/**
 * Middleware factory for Zod schema validation.
 *
 * Usage:
 *   router.post('/path', validate(MySchema), myController);
 *   router.get('/path', validate(MyQuerySchema, 'query'), myController);
 */
const validate = (schema, target = 'body') => (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
        const message = formatZodErrors(result.error);
        return next(new AppError_1.AppError(message, 400, 'VALIDATION_ERROR'));
    }
    // Replace with parsed/coerced data
    req[target] = result.data;
    next();
};
exports.validate = validate;
const formatZodErrors = (error) => {
    return error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('; ');
};
//# sourceMappingURL=validate.js.map
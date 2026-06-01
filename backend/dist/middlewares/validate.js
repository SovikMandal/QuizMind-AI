"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
/** Validates and replaces req.body with the parsed result. */
function validateBody(schema) {
    return (req, _res, next) => {
        req.body = schema.parse(req.body);
        next();
    };
}
//# sourceMappingURL=validate.js.map
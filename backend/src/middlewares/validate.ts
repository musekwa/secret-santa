import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

function take(object: Record<string, any>, keys: string[]) {
    // Return a new object with only the specified keys from the original object
    return Object.assign({}, ...keys.filter(key=>object.hasOwnProperty(key)).map(key=>({ [key]: object[key] })));
}

function validate(schema: Record<string, any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        const selectedSchema = take(schema, ['params', 'query', 'body']);
        const objectToValidate = take(req, Object.keys(selectedSchema));

        const { value, error } = Joi.compile(Joi.object(selectedSchema)).prefs({ errors: { label: 'key' }, abortEarly: false }).validate(objectToValidate);

        if (error) {
            const errorDetails = error.details.map(detail => detail.message).join(', ');
            res.status(400).json({ success: false, message: 'Validation error', details: errorDetails });
            return;
        } else {
            Object.assign(req, value);
            next();
        }
    }
}

export default validate;
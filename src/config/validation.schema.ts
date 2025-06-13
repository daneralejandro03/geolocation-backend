import * as Joi from 'joi';

export const validationSchema = Joi.object({
    GOOGLE_MAPS_API_KEY: Joi.string().required(),
    EMAIL_CONNECTION_STRING: Joi.string().required(),
    EMAIL_SENDER_ADDRESS: Joi.string().email().required(),
    PORT: Joi.number().required(),

    JWT_SECRET: Joi.string().required(),

    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().allow(''),
    DB_DATABASE: Joi.string().required(),
});
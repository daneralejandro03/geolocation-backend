import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
    return {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
        emailConnectionString: process.env.EMAIL_CONNECTION_STRING,
        emailSenderAddress: process.env.EMAIL_SENDER_ADDRESS,
        port: parseInt(process.env.PORT || '', 10),
        jwtSecret: process.env.JWT_SECRET,
        database: {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '', 10),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        },
    };
});
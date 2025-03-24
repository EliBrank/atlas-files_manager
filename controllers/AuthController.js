import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class AuthController {
    static async getConnect(req, res) {
        try {
            const authHeader = req.headers.authorization;
            // auth header should follow pattern of something like 'Basic 5xkIQ=...'
            if (!authHeader || !authHeader.startsWith('Basic')) {
                res.status(401).json({
                    error: "Internal server error"
                });
            }
            // extract just the base64 part
            const b64Credentials = authHeader.split(' ')[1];
            const credentials = Buffer.from(b64Credentials, 'base64')
                .toString('utf-8');
            // extract email, password from credentials (<email>:<password>)
            const [email, password] = credentials.split(':');

            // TODO get check that user is in DB

            const passwordHash = crypto.createHash('sha1')
                // pass in password to hashing process (not yet converted)
                .update(password)
                // actually process staged data as hexidecimal string
                .digest('hex');

            const token = `auth_${uuidv4()}`;
        } catch (error) {
            res.status(500).json({
                error: "Internal server error"
            });
        }
    }
}

export default AuthController;

import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';
import hash from 'sha1';

class AuthController {
    static async getConnect(req, res) {
        try {
            const authHeader = req.headers.authorization;
            // auth header should follow pattern of something like 'Basic 5xkIQ=...'
            if (!authHeader || !authHeader.startsWith('Basic')) {
                return res.status(401).json({
                    error: 'Unauthorized'
                });
            }
            // extract just the base64 part
            const b64Credentials = authHeader.split(' ')[1];
            const credentials = Buffer.from(b64Credentials, 'base64')
                .toString('utf-8');
            // extract email, password from credentials (<email>:<password>)
            const [email, password] = credentials.split(':');

            const user = await dbClient.db.collection('users').findOne({ email: email });

            // const passwordHash = crypto.createHash('sha1')
            //     // pass in password to hashing process (not yet converted)
            //     .update(password)
            //     // actually process staged data as hexidecimal string
            //     .digest('hex');

            // using sha1 instead of crypto module for consistency
            if (!user || hash(password) !== user.password) {
                return res.status(401).json({
                    error: 'Unauthorized'
                });
            }

            const token = uuidv4();
            const key = `auth_${token}`;

            // _id field is generated automatically when users inserted into db
            // duration set is 24hrs (calculated in seconds)
            await redisClient.set(key, user._id.toString(), (24 * 60 * 60))

            return res.status(200).json({
                'token': token
            });
        } catch (error) {
            return res.status(500).json({
                error: 'Internal server error'
            });
        }
    }

    static async getDisconnect(req, res) {
        try {
            const token = req.headers['x-token'];
            if (!token) {
                return res.status(401).json({
                    error: 'Unauthorized'
                });
            }
            const key = `auth_${token}`;
            await redisClient.del(key)

            // send() provides empty HTTP response body
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({
                error: 'Internal server error'
            });
        }
    }
}

export default AuthController;

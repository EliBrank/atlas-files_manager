import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';
import hash from 'sha1';
import pkg from 'mongodb';
const { ObjectId } = pkg;

export default class UsersController {
    static async postNew(req, res) {
        try {

            // Debugging console log
            // console.log(`request recieved: ${req.body}`);


            const { email, password } = req.body;

            if (!email) return res.status(400).json({ error: "Missing email" });
            if (!password) return res.status(400).json({ error: "Missing password" });

            const existingUser = await dbClient.db.collection('users').findOne({ email: email});
            if (existingUser) return res.status(400).json({ error: "Already exsists"});

            const hashPassword = hash(password);

            // More curious for my self (Taylor Green) to make sure the hashing was working
            // console.log(`I know we should never show this but I want to see if the hash is working: ${hashPassword}`);

            const result = await dbClient.db.collection('users').insertOne({
                email,
                password: hashPassword
            });

            return res.status(201).json({
                id: result.insertedId,
                email
            });

        } catch (error) {
            console.error('Something went wrong with UsersController.postNew();', error)
            res.status(500).json({
                error: 'Something went wrong with UsersController.postNew();'
            });
        }
    }

    static async getMe(req, res) {
        try {
            const token = req.headers['x-token'];
            if (!token) {
                return res.status(401).json({
                    error: 'Unauthorized'
                });
            }
            const key = `auth_${token}`;

            const userId = await redisClient.get(key);
            if (!userId) {
                return res.status(401).json({
                    error: 'Unauthorized'
                });
            }

            const user = await dbClient.db.collection('users').findOne(
                { _id: new ObjectId(userId) }
            );

            if (!user) {
                return res.status(401).json({
                    error: 'Unauthorized'
                });
            }

            return res.status(200).json({
                email: user.email,
                id: user._id
            });
        } catch (error) {
            return res.status(500).json({
                error: 'Internal Service Error'
            });
        }
    }
}

import dbClient from '../utils/db.js';
import hash from 'sha1';

export default class UsersController {
    static async postNew(req, res) {
        try {
            const { email, password } = req.body;

            if (!email) return res.status(400).json({ error: "Missing email" });
            if (!password) return res.status(400).json({ error: "Missing password" });

            const existingUser = await dbClient.collection('users').findOne({ email: email});
            if (existingUser) return res.status(400).json({ error: "Already exsists"});
            
            const hashPassword = hash({ password: password});

        } catch (error) {
            res.status(500).json({
                error: 'Something went wrong with UsersController.postNew();'
            });
        }
    }
}

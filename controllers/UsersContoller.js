import dbClient from '../utils/db.js';
import hash from 'sha1';

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
}

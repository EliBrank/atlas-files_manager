import pkg from 'mongodb';
import redisClient from './redis.js';
const { MongoClient, ObjectId } = pkg;

class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || '27017';
        const database = process.env.DB_DATABASE || 'file_manager';

        const url = `mongodb://${host}:${port}`;

        // set default for connected status
        this.connected = false;
        this.client = new MongoClient(url, { useUnifiedTopology: true });

        this.client.connect()
            .then(() => {
                this.connected = true;
                this.db = this.client.db(database);
            })
            .catch((error) => {
                console.error(`Error establishing connection to DB: ${error}`);
            });
    }

    isAlive() {
        return this.connected;
    }

    async nbUsers() {
        // no users returned if database isn't running or other issue
        if (!this.isAlive()) return 0;
        try {
            const users = this.db.collection('users');
            // countDocuments is asynchronous
            return await users.countDocuments();
        } catch (error) {
            console.error(`Error counting users in DB: ${error}`);
            return 0;
        }
    }

    async nbFiles() {
        if (!this.isAlive()) return 0;
        try {
            const files = this.db.collection('files');
            return await files.countDocuments();
        } catch (error) {
            console.error(`Error counting files in DB: ${error}`);
            return 0;
        }
    }

    async validateToken(token) {
        if (!this.isAlive() || !token) return 0;
        try {
            return await redisClient.get(`auth_${token}`);
        } catch (error) {
            console.error(`Error validating Redis token: ${error}`);
            return 0;
        }
    }

    async getUserById(id) {
        if (!this.isAlive() || !id) return 0;
        try {
            return await this.db.collection('users').findOne({
                _id: new ObjectId(id),
            });
        } catch (error) {
            console.error(`Error getting user from DB: ${error}`);
            return 0;
        }
    }

    async authenticateUser(token) {
        if (!this.isAlive() || !token) return 0;
        try {
            const userId = await this.validateToken(token);
            if (!userId) return 0;
            return this.getUserById(userId);
        } catch (error) {
            console.error(`Error authenticating user: ${error}`);
            return 0;
        }
    }

    async getObjectId(id) {
        if (!this.isAlive()) return 0;
        try {
            return new ObjectId(id);
        } catch (error) {
            console.error(`Error getting ObjectId: ${error}`);
            return 0;
        }
    }

    async getFileById(fileId, userId) {
        if (!this.isAlive() || !fileId || !userId) return 0;
        try {
            return await this.db.collection('files').findOne({
                _id: this.getObjectId(fileId),
                userId: this.getObjectId(userId),
            });
        } catch (error) {
            console.error(`Error getting file from DB: ${error}`);
            return 0;
        }
    }
}

const dbClient = new DBClient;

export default dbClient;

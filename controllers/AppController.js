import dbClient from '../utils/db';
import DBClient from '../utils/db';
import RedisClient from '../utils/redis';

class AppController {
    static getStatus(req, res) {
        try {
            const redisStatus = RedisClient.isAlive();
            const DBStatus = DBClient.isAlive();

            res.status(200).json({
                "redis": redisStatus,
                "db": DBStatus
            });
        } catch (error) {
            res.status(500).json({
                error: "Internal server error"
            })
        }
    }

    static async getStats(req, res) {
        try {
            const user = await dbClient.nbUsers();
            const files = await dbClient.nbFiles();

            res.status(200).json({
                users: user,
                files: files,
            });
        } catch (error) {
            res.status(500).json({
                error: "Internal server error"
            })
        }
    }
}


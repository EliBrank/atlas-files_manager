import { createClient } from 'redis'

class RedisClient {
    constructor() {
        this.client = createClient();
        this.connected = false

        this.client.on('error', error => {
            console.log('Redis Client Error', error);
        });

        this.client.on('ready', () => {
            this.connected = true;
            console.log('redis connected successfully');
        });
    }

    isAlive() {
        return this.connected;
    }

    async get(key) {
        if (!this.isAlive()) return null;
        return new Promise((resolve, reject) => {
            this.client.get(key, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    }

    async set(key, value, duration) {
        if (!this.isAlive()) {
            console.error('Error Connecting to Data Storage')
            return null;
        }
        return new Promise((resolve, reject) => {
            this.client.set(key, value, 'EX', duration, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    }

    async del(key) {
        if (!this.isAlive()) return null;
        return new Promise((resolve, reject) => {
            this.client.del(key, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    }
}

const redisClient = new RedisClient();

export default redisClient;

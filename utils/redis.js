import { createClient } from 'redis'

class RedisClient {
    constructor() {
        this.client = createClient();

        this.client.on('error', (error) => {
            console.error('Redis Error: ' + error)
        });

        this.client.connect.catch((error) => {
            console.error('Redis Error: ' + error)
        });
    }

    isAlive() {
        return this.client.isOpen;
    }

    async get(key) {
        return await this.client.get(key)
    }

    async set(key, value, duration) {
        if (!this.isAlive) {
            console.error('Error Connecting to Data Storage')
            return null;
        }
        try {
            return this.client.set(key, value, { EX: duration });
        }
        catch (error) {
            console.error('There was an issue set your key value pair: ' + error);
        }
    }

    async del(key) {
        return await this.client.del(key);
    }
}

const redisClient = new RedisClient();

export default redisClient

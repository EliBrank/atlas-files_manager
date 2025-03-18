import redisClient from './utils/redis.js';

(async () => {
    // Wait for the Redis client to connect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(redisClient.isAlive()); // Should print true if connected
    console.log(await redisClient.get('myKey')); // Should print null
    await redisClient.set('myKey', 12, 5); // Set key with a 5-second expiration
    console.log(await redisClient.get('myKey')); // Should print 12

    setTimeout(async () => {
        console.log(await redisClient.get('myKey')); // Should print null after 10 seconds
    }, 1000 * 10);
})();

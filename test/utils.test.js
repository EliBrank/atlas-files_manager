import redisClient from '../utils/redis';
let assert = require('assert');

describe('redisClient', () => {
    describe('set()', () => {
        it('should set the "key" in redis', (done) => {
            redisClient.set('dummyKey', 'dummyValue', 10)
            .then(() => redisClient.get('dummyKey'))
            .then((value) => {
                assert.strictEqual(value, 'dummyValue');
                done();
            })
            .catch(done);
        });

        it('should return nil/null', (done) => {
            redisClient.set('dummyKey', null, 10)
            .then(() => redisClient.get('dummyKey'))
            .then((value) => {
                assert.strictEqual(value, null);
                done();
            })
            .catch(done);
        })
    });
});

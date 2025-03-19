import pkg from 'mongodb';
const { MongoClient } = pkg;

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
        console.error(error);
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
      console.error(error);
      return 0;
    }
  }

  async nbFiles() {
    if (!this.isAlive()) return 0;
    try {
      const files = this.db.collection('files');
      return await files.countDocuments();
    } catch (error) {
      console.error(error);
      return 0;
    }
  }
}

const dbClient = new DBClient;

export default dbClient;

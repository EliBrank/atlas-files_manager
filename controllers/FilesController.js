import redisClient from "../utils/redis.js";
import dbClient from "../utils/db.js";
import { v4 as uuidv4 } from "uuid";
import pkg from 'mongodb';

const { ObjectId } = pkg;

export default class FilesController {
    static async postUpload(req, res) {
        const token = req.headers['x-token'];

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) {
            return res.status(401).json({ error: ' Unathorized' });
        }

        const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
        if (!user) {
            return res.status(401).json({ error: 'Unathorized' });
        }

        const {
            name,
            type,
            parentId = 0,
            isPublic = false,
            data
        } = req.body;

        // choose to do a list as a way to show expansion for this project
        const acceptedTypes = ["folder", "file", "image"];

        //checks for name
        if (!name) {
            return res.status(400).json({
                error: 'Missing name'
            });
        }

        // checks for type and if type is on the accepted list
        if (!type || !acceptedTypes.includes(type)) {
            return res.status(400).json({
                error: 'Missing type'
            });
        }

        // checks if there is no data and if the type is a file or an image
        if ((type === "file" || type === "image") && !data) {
            return res.status(400).json({
                error: 'Missing data'
            });
        }

        // checks if parentId is set
        if (parentId !== 0) {
            const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });

            // if we can not find the parent file
            if (!parentFile) {
                return res.status(400).json({
                    error: 'Parent not found'
                });
            }

            // if parentFile isn't a folder
            if (parentFile.type !== 'folder') {
                return res.status(400).json({
                    error: "Parent is not a folder"
                });
            }
        }

        if (type === "image" || type === "file"){
            try {

            }
        }

    }
}

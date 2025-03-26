import dbClient from "../utils/db.js";
import { v4 as uuidv4 } from "uuid";
import fs from 'fs';
import path from 'path';

const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager'

export default class FilesController {
    static async postUpload(req, res) {
        const token = req.headers['x-token'];
        const user = await dbClient.authenticateUser(token);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
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
            const parentFile = await dbClient.db.collection('files').findOne({
                _id: dbClient.getObjectId(parentId)
            });

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

        // If type is folder it saves as a new folder.
        if (type === 'folder') {
            const newFolder = {
                userId: user._id,
                name,
                type,
                isPublic,
                // if parentId is not 0, then cast it as an ObjectId, otherwise keep it set as 0 (root)
                parentId: parentId !== 0 ? dbClient.getObjectId(parentId) : 0
            };

            // adds the new folder to the collection files
            const result = await dbClient.db.collection('files').insertOne(newFolder);

            // if successful should return status 201 with a json of info
            return res.status(201).json({
                id: result.insertedId, // Id is set to whatever Mongo gives it
                userId: user._id.toString(), // user is of who made the folder
                name, // whatever the name you give it is
                type, // the type of what is being stored (in this case a folder)
                isPublic, // whether the file is accessible to the public or not
                parentId // if there is a parentId display here if the parent is root then should show a 0
            });
        }

        // gives each file a unique name when storing to the disk
        const fileName = uuidv4();

        // creates the path to the files
        let localPath = path.join(folderPath, fileName);

        // if type is and image or file store to the database and to disk
        if (type === 'image' || type === 'file') {
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            try {
                const fileData = Buffer.from(data, 'base64');
                fs.writeFileSync(localPath, fileData);
            } catch (error) {
                return res.status(500).json({ error: 'Error saving file' });
            }
        } else {
            let localPath = null;
        }

        const newFile = {
            userId: user._id,
            name,
            type,
            isPublic,
            parentId: parentId !== 0 ? dbClient.getObjectId(parentId) : 0,
            localPath
        };

        const result = await dbClient.db.collection('files').insertOne(newFile);

        return res.status(201).json({
            id: result.insertedId,
            userId: user._id.toString(),
            name,
            type,
            isPublic,
            parentId,
            localPath
        });
    }

    static async getShow(req, res) {
        const token = req.headers['x-token'];
        const user = await dbClient.authenticateUser(token);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // req.params gets route parameters from request (i.e. { id: 50f3... } in this case)
        const fileId = req.params.id;
        if (!fileId) {
            return res.status(404).json({ error: 'Not found' });
        }

        const file = await dbClient.getFileById(fileId, user._id.toString());
        if (!file) {
            return res.status(404).json({ error: 'Not found' });
        }

        return res.status(200).json(file);
    }
}

import express from "express";
import AppController from "../controllers/AppController.js";
import AuthController from "../controllers/AuthController.js";
import UsersController from "../controllers/UsersController.js";
import FilesController from "../controllers/FilesController.js";

const routes = express.Router();

routes.get('/status', AppController.getStatus);
routes.get('/stats', AppController.getStats);

routes.get('/connect', AuthController.getConnect)
routes.get('/disconnect', AuthController.getDisconnect)

routes.post('/users', UsersController.postNew);
routes.get('/users/me', UsersController.getMe);

routes.post('/files', FilesController.postUpload);
routes.get('/files/:id', FilesController.getShow);
routes.get('/files', FilesController.getIndex);
routes.put('/files/:id/publish', FilesController.putPublish);
routes.put('/files/:id/unpublish', FilesController.putUnpublish);

export default routes;

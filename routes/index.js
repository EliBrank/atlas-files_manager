import express from "express";
import AppController from "../controllers/AppController.js";
import AuthController from "../controllers/AuthController.js";
import UsersController from "../controllers/UsersController.js";

const routes = express.Router();

routes.get('/status', AppController.getStatus);
routes.get('/stats', AppController.getStats);

routes.get('/connect', AuthController.getConnect)
routes.get('/disconnect', AuthController.getDisconnect)

routes.post('/users', UsersController.postNew);
routes.get('/users/me', UsersController.getMe);

export default routes;

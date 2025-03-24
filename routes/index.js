import express from "express";
import AppController from "../controllers/AppController.js";
import UsersController from "../controllers/UsersContoller.js";

const routes = express.Router();

routes.get('/status', AppController.getStatus);

routes.get('/stats', AppController.getStats);

routes.post('/users', UsersController.postNew);

export default routes;

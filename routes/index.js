import express from "express";
import AppController from "../controllers/AppController.js";
import AuthController from "../controllers/AuthController.js";

const routes = express.Router();

routes.get('/status', AppController.getStatus);
routes.get('/stats', AppController.getStats);
routes.get('/connect', AuthController.getConnect)

export default routes;

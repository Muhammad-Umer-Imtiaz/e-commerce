import express from "express";
import { globalAtlasSearch } from "../Controller/Search.Controller.js";

const router = express.Router();

router.get("/atlas", globalAtlasSearch);

export default router;

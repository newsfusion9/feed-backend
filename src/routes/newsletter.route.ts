import express from "express";
import {
  createNewsletterController,
  deleteNewsletterController,
  getNewsletterController,
  getRssArticleEndPoint,
  importOpmlController,
  updateNewsletterStatusController,
} from "../controllers/index.controllers";
import multer from "multer";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// create newsletter route
router.post("/newsletters", createNewsletterController);

// get newsletters route
router.get("/newsletters", getNewsletterController);

// New endpoint for OPML import
router.post(
  "/newsletters/import-opml",
  upload.single("file"),
  importOpmlController
);

// update newsletter status route
router.patch("/newsletters/:id/status", updateNewsletterStatusController);

// Fetch RSS articles endpoint
router.post("/newsletters/:id/fetch-rss", getRssArticleEndPoint);

// delete newsletter by id
router.delete("/newsletters/:id", deleteNewsletterController);

export default router;

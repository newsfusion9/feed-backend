import {
  archiveController,
  createArticleController,
  fetchEmailDataViaMake,
  getArticleController,
  getArticlesController,
  publishArticleController,
  RssFeedController,
  updatePublishUntilArticleController,
} from "../controllers/index.controllers";
import express from "express";

const router = express.Router();

// create article route
router.post("/article", createArticleController);

// get articles route
router.get("/articles", getArticlesController);

// get article route
router.get("/articles/:id", getArticleController);

// publish article route
router.post("/articles/:id/publish", publishArticleController);

// RSS feed
router.get("/rss", RssFeedController);

// fetch email data via make.com route
router.post("/make", fetchEmailDataViaMake);

// update publish until article route
router.patch("/articles/:id", updatePublishUntilArticleController);
// toggle archive route
router.post("/articles/:id/archive", archiveController);

export default router;

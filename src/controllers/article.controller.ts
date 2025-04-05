import { Request, Response } from "express";
import { Article, IArticle } from "../models/parsed-email.model";
import RSS from "rss";
import {
  archiveArticleService,
  createArticleService,
  fetchArticlesService,
  getArticleService,
  publishArticleService,
  updatePublishUntilArticleService,
} from "../services/index.services";
import { sendMessageToAllClients } from '../services/websocket.service';

// create articles controller
export const createArticleController = async (req: Request, res: Response) => {
  try {
    const { title, content, newsletterId } = req.body;
    const emailData = { title, content, newsletterId };
    const response = await createArticleService(emailData as IArticle);
    res.status(200).json({
      message: `Success`,
      response,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error testing controller server",
      error,
    });
  }
};

// get articles controller
export const getArticlesController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    console.log('page ===>> ', page);
    const response = await fetchArticlesService(page);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching articles",
      error,
    });
  }
};

// get article controller
export const getArticleController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const article = await getArticleService(id);
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  } catch (error) {
    res.status(500).json({
      message: "sdf",
      error,
    });
  }
};

// publish article controller
export const publishArticleController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const article = await publishArticleService(id);
    res.status(200).json(article);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// RSS feed controller
export const RssFeedController = async (req: Request, res: Response) => {
  try {
    {
      const articles = await Article.find({ published: true });
      const feed = new RSS({
        title: "Newsletter Aggregator",
        feed_url: `${process.env.REPLIT_DOMAINS}/api/rss`,
        site_url: process.env.REPLIT_DOMAINS || "",
        custom_namespaces: {
          media: "http://search.yahoo.com/mrss/",
        },
      });

      articles
        // .filter((a) => a.published)
        .forEach((article) => {
          const feedItem: any = {
            title: article.title,
            description: article.content,
            date: article.publishedAt!,
            url: article.externalId || `${process.env.REPLIT_DOMAINS}/articles/${article.id
              }`,
            custom_elements: [],
          };

          // Add thumbnail if available
          if (article.thumbnailUrl) {
            // Add media:thumbnail element
            feedItem.custom_elements.push({
              "media:thumbnail": [
                {
                  _attr: {
                    url: article.thumbnailUrl,
                  },
                },
              ],
            });

            // Also keep the enclosure for maximum compatibility
            feedItem.enclosure = {
              url: article.thumbnailUrl,
              type: "image/jpeg", // Default to JPEG, most common for RSS feeds
            };
          }

          feed.item(feedItem);
        });

      res.type("application/xml");
      res.send(feed.xml());
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// fetch email data via make.com
export const fetchEmailDataViaMake = async (req: Request, res: Response) => {
  try {
    const emailData = {
      title: req.body.subject,
      content: req.body.htmlContent,
    };
    const response = await createArticleService(emailData as IArticle);

    // Send WebSocket notification to all connected clients
    const message = JSON.stringify({
      type: "NEW_ARTICLE",
      article: response,
    });

    sendMessageToAllClients(message);
    res.end();
  } catch (error) {
    console.log("Check Error" ,error)
    res.json(error);
  }
};

// update publish until article contoller
export const updatePublishUntilArticleController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { publishUntil } = req.body;
    const article = await updatePublishUntilArticleService(id, publishUntil);
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json(error);
  }
};

// toggle archive controller
export const archiveController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const article = await archiveArticleService(id);
    res.status(200).json(article);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

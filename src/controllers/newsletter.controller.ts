import { Request, Response } from "express";
import {
  createNewsletterService,
  getNewsletterService,
  getRssService,
  importFromOpmlService,
  updateNewsletterStatusService,
} from "../services/index.services";
import { INewsletter } from "../types/index.types";
import { Newsletter } from "../models/parsed-email.model";

// create newsletter controller
export const createNewsletterController = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, rssUrl } = req.body;
    const newsletterData = { name, email, rssUrl };
    const response = await createNewsletterService(
      newsletterData as INewsletter
    );
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// get newsletters controller
export const getNewsletterController = async (req: Request, res: Response) => {
  try {
    const response = await getNewsletterService();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const updateNewsletterStatusController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { active } = req.body;
    const { id: newsletterId } = req.params;

    // Validate the 'active' field
    if (typeof active !== "boolean") {
      return res
        .status(400)
        .json({ error: "Invalid status, must be a boolean" });
    }

    // Find and update the newsletter by its ID
    const updatedNewsletter = await updateNewsletterStatusService(
      newsletterId,
      active
    );

    if (!updatedNewsletter) {
      return res.status(404).json({ error: "Newsletter not found" });
    }

    // Respond with the updated newsletter
    return res.json(updatedNewsletter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getRssArticleEndPoint = async (req: Request, res: Response) => {
  try {
    const { id: newsletterId } = req.params;
    const articles = await getRssService(newsletterId);
    res.json(articles);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// OPML import controller
export const importOpmlController = async (
  req: Request,
  res: Response
): Promise<any> => {
  if (!req.file) {
    console.log("no file uploaded");
    return res.status(400).json({ error: "No OPML file provided" });
  }

  try {
    const opmlContent = req.file.buffer.toString("utf-8");
    importFromOpmlService(opmlContent);
    res.send({ status: "success" });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// delete newsletter by id controller
export const deleteNewsletterController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    await Newsletter.findByIdAndDelete(id);
    res.status(200).json({
      message: "Newsletter deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

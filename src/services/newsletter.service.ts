import Parser from "rss-parser";
import { Article, Newsletter } from "../models/parsed-email.model";
import { IArticle, INewsletter } from "../types/index.types";
import { DOMParser } from "@xmldom/xmldom";

// create newsletter Service
export const createNewsletterService = async ({
  name,
  email,
  rssUrl,
}: INewsletter) => {
  try {
    const newsletterData = { name, email, rssUrl };
    const response = await Newsletter.create(newsletterData);
    return response;
  } catch (error) {
    throw new Error("Error creating newsletter:" + (error as Error).message);
  }
};

// get newsletter Service
export const getNewsletterService = async () => {
  try {
    const response = await Newsletter.find();
    return response;
  } catch (error) {
    throw new Error("Error creating newsletter:" + (error as Error).message);
  }
};

// update newsletter status Service
export const updateNewsletterStatusService = async (
  newsletterId: string,
  active: boolean
) => {
  try {
    const response = await Newsletter.findByIdAndUpdate(
      newsletterId,
      { active },
      { new: true }
    );
    return response;
  } catch (error) {
    throw new Error("Error creating newsletter:" + (error as Error).message);
  }
};

// Function to extract image URL (you can replace this with your actual image extraction logic)
const extractImageUrl = (item: any): string | null => {
  // Try media:thumbnail first
  if (item["media:thumbnail"]?.[0]?.$?.url) {
    console.log("Found media:thumbnail:", item["media:thumbnail"][0].$.url);
    return item["media:thumbnail"][0].$.url;
  }

  // Try media:content
  if (item["media:content"]?.[0]?.$?.url) {
    const mediaContent = item["media:content"][0].$;
    if (!mediaContent.type || mediaContent.type.startsWith("image/")) {
      console.log("Found media:content:", mediaContent.url);
      return mediaContent.url;
    }
  }

  // Try enclosure
  if (item.enclosure?.url) {
    if (!item.enclosure.type || item.enclosure.type.startsWith("image/")) {
      console.log("Found enclosure:", item.enclosure.url);
      return item.enclosure.url;
    }
  }

  // Try content or description for an img tag
  const content = item.content || item.description || item.summary || "";
  const match = content.match(/<img[^>]+src="([^">]+)"/);
  if (match) {
    console.log("Found image in content:", match[1]);
    return match[1];
  }

  console.log("No image found for item:", item.title);
  return null;
};

const createArticle = async (insertArticle: IArticle): Promise<IArticle> => {
  try {
    const article = {
      ...insertArticle,
      published: false,
      publishedAt: null,
    };

    const savedArticle = await Article.create(article);

    return savedArticle; // Return the saved article with the MongoDB _id
  } catch (error) {
    console.error("Error creating article:", error);
    throw new Error("Error creating article");
  }
};

// fetch rss service
export const getRssService = async (newsletterId: string) => {
  try {
    // Get the newsletter (replace with actual logic to get the newsletter data)
    const newsletter = await Newsletter.findById(newsletterId);
    if (!newsletter) throw new Error("Newsletter not found");

    const rssParser = new Parser({
      customFields: {
        item: [
          ["media:content", "media:content", { keepArray: true }],
          ["media:thumbnail", "media:thumbnail", { keepArray: true }],
          "enclosure",
          "description",
          "summary",
        ],
      },
    });

    const { rssUrl } = newsletter;

    const feed = await rssParser.parseURL(rssUrl as string);
    console.log("Feed metadata:", {
      title: feed.title,
      description: feed.description,
      itemCount: feed.items.length,
    });

    const articles: any[] = [];

    // Loop over the feed items (RSS articles)
    for (const item of feed.items) {
      if (!item.title || !(item.content || item.description)) continue;

      // Simulate checking if an article already exists (skip if it does)
      const existingArticle = articles.find((a) => a.externalId === item.guid);
      if (existingArticle) continue;

      const thumbnailUrl = extractImageUrl(item); // Extract thumbnail image URL
      console.log("Extracted thumbnail URL for", item.title, ":", thumbnailUrl);


      // Save the article to MongoDB
      const findExternalID = await Article.find({
        externalID: item.guid,
      });

      if (findExternalID?.length) return;

      const article = await createArticle({
        title: item.title,
        content: item.content || item.description || "",
        newsletterId: newsletter._id,
        externalId: item.guid || undefined,
        link: item.link || undefined,
        thumbnailUrl,
      } as IArticle);

      // Add the article to the list
      articles.push(article);
    }

    return articles;
  } catch (error) {
    throw new Error("Error fetching RSS: " + (error as Error).message);
  }
};

export const importFromOpmlService = async (
  opmlContent: string
): Promise<INewsletter[]> => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(opmlContent, "text/xml");
    const outlines = doc.getElementsByTagName("outline");
    const newsletters: INewsletter[] = [];

    const outline = outlines[0];
    const type = outline.getAttribute("type");

    for (let i = 0; i < outlines.length; i++) {
      const outline = outlines[i];
      const type = outline.getAttribute("type");

      if (type === "rss") {
        const title =
          outline.getAttribute("title") || outline.getAttribute("text") || "";
        const feedUrl = outline.getAttribute("xmlUrl") || "";

        if (!title || !feedUrl) continue;

        const email = `${title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")}@imported.feed`;

        try {
          const newsletter = await createNewsletterService({
            name: title,
            email,
            rssUrl: feedUrl,
          } as INewsletter);
          newsletters.push(newsletter);

          await getRssService(newsletter._id.toString());
        } catch (error) {
          console.error(`Failed to import feed ${title}:`, error);
          continue;
        }
      }
    }

    return newsletters;
  } catch (error) {
    throw new Error(`Failed to parse OPML file: ${(error as Error).message}`);
  }
};

import { fetchArticlesQueryHelper } from "../helper/aggregation-query.helper";
import { Article, IArticle } from "../models/index.models";

// create article service
export const createArticleService = async ({ title, content }: IArticle) => {
  try {
    const response = await Article.create({ title, content });
    return { message: "Article has been successfully created", data: response };
  } catch (error) {
    throw new Error("Error creating article" + error);
  }
};

// fetch articles service
export const fetchArticlesService = async (page: number) => {
  try {
    // const response = await Article.find();
    const response = await fetchArticlesQueryHelper(page);
    return response;
  } catch (error) {
    throw new Error("Error fetching article" + error);
  }
};

// publish article service
export const publishArticleService = async (id: string) => {
  try {
    const article = await Article.findById(id);
    if (!article) {
      return { message: "Article not found" };
    }
    // Toggle the 'published' field
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      {
        $set: {
          published: !article.published, // Toggle the 'published' field
          updatedAt: new Date(), //  update the 'updatedAt' field
        },
      },
      { new: true }
    );

    return updatedArticle;
  } catch (error) {
    throw new Error("Error fetching article" + error);
  }
};

// fetch article service
export const getArticleService = async (id: string) => {
  try {
    const response = await Article.findById(id);
    return response;
  } catch (error) {
    throw new Error("Error fetching article" + error);
  }
};


// toggle archive service
export const archiveArticleService = async (id: string) => {
  try {
    const article = await Article.findById(id);
    if (!article) {
      return { message: "Article not found" };
    }
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      {
        $set: {
          archived: !article.archived, // Toggle the 'archived' field
          updatedAt: new Date(), //  update the 'updatedAt' field
        },
      },
      { new: true }
    );
    return updatedArticle;
  } catch (error) {
    throw new Error("Error achiving article" + error);
  }
};




export const updatePublishUntilArticleService = async (
  id: string,
  update: string
) => {
  try {
    const article = await Article.findById(id);
    if (!article) {
      return { message: "Article not found" };
    }
    // update 'publishUntil' field
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      {
        $set: {
          publishUntil: update, // update the 'published' field
          updatedAt: new Date(), //  update the 'updatedAt' field
        },
      },
      { new: true }
    );
    return updatedArticle;
  } catch (error) {
    throw new Error("Error updating publishUntil article date" + error);
  }
};


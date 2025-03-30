import { Article } from "../models/index.models";

export const fetchArticlesQueryHelper = async (page: number = 1) => {
    const limit = 9;
    const skip = (page - 1) * limit;

    const [articles, totalCount] = await Promise.all([
        Article.aggregate([
            { $sort: { createdAt: -1 } },  // Sort by createdAt in descending order (newest first)
            { $skip: skip },
            { $limit: limit }
        ]),
        Article.countDocuments()
    ]);

    return {
        articles,
        totalCount,
        hasMore: skip + articles.length < totalCount
    };
};


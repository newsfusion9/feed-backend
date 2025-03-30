import { Article } from '../models/parsed-email.model';

export const initializeScheduler = () => {
    // Run every 24 hours
    setInterval(async () => {
        try {
            const now = new Date();
            
            // Directly update articles that have passed their publishUntil date
            const result = await Article.updateMany(
                {
                    published: true,
                    publishUntil: { $lt: now }
                },
                {
                    $set: {
                        published: false,
                        publishedAt: null,
                        publishUntil: null
                    }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`${result.modifiedCount} articles were unpublished`);
            }
        } catch (error) {
            console.error("Error in scheduler:", error);
        }
    }, 24 * 60 * 60 * 1000); // Run every 24 hours
};

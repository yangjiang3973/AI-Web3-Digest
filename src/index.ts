import getFollowings from './getFollowings';
import getRecentTweets from './getRecentTweets';
import sendTweetsFromFile from './sendTweets';
import sendEmail from './sendEmail';
import { UserTweets } from './types/tweet';
import { backupToFile } from './utils';
import cron from 'node-cron';
import AppError from './error';
import logger from './logger';

async function main() {
    const recentUserTweets: UserTweets[] = [];
    try {
        // Fetch all followings tweets
        const followings = await getFollowings();
        for (const f of followings) {
            const tweets = await getRecentTweets(f.userName);
            console.log(
                `Finally fetched ${tweets.length} recent tweets from ${f.userName}`
            );
            if (tweets.length > 0)
                recentUserTweets.push({ name: f.name, tweets });
        }
        // save all tweets to a JSON file
        const tweetsFilePath = await backupToFile(
            JSON.stringify(recentUserTweets, null, 2),
            'json'
        );
        //  send tweets to AI Grok
        const summary = await sendTweetsFromFile(tweetsFilePath);
        // save summary to a MD file
        const summaryFilePath = await backupToFile(summary, 'md');
        // send summary by email
        await sendEmail(summaryFilePath);
    } catch (error) {
        if (error instanceof AppError) {
            logger.error('AppError in main execution', {
                message: error.message,
                type: error.type,
                stack: error.stack,
            });
        } else if (error instanceof Error) {
            logger.error('Unknown error in main execution', {
                message: error.message,
                stack: error.stack,
            });
        } else {
            logger.error('Unknown non-error thrown in main', {
                payload: error,
            });
        }
    }
}

cron.schedule(
    '0 10 * * *',
    async () => {
        console.log('Running the bot at 10:00 AM every day');
        await main();
    },
    {
        timezone: 'Asia/Shanghai',
    }
);

// main()

process.on('unhandledRejection', (reason: unknown) => {
    console.error(
        'Unhandled Rejection in main process:',
        reason instanceof Error ? reason.message : String(reason)
    );
    process.exit(1);
});

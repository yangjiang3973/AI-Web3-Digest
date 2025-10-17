import axios, { AxiosError } from 'axios';
import { GET_POSTS, sleep } from './utils';
import dotenv from 'dotenv';
import { Tweet } from './types/tweet';
import AppError from './error';

dotenv.config();
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error('API_KEY is not defined');
}

interface GetPostsParams {
    userName: string;
    cursor?: string | null;
}

interface GetPostsResponse {
    code: number;
    status: 'success' | 'error';
    msg: string;
    data: {
        tweets: Tweet[];
    };
    has_next_page: boolean;
    next_cursor: string;
}

function isRecent(time: Date) {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return time > yesterday;
}

export default async function getRecentTweets(userName: string) {
    const maxRetries = 3;
    const params: GetPostsParams = {
        userName,
    };
    let cursor = null;
    // TODO: protect the size of recentTweets to avoid too many tweets
    const recentTweets: Tweet[] = [];
    while (true) {
        if (cursor) params.cursor = cursor;
        let retryCount = 0;
        while (retryCount < maxRetries) {
            try {
                const { data } = await axios.get<GetPostsResponse>(GET_POSTS, {
                    headers: { 'X-API-Key': API_KEY! },
                    params,
                    timeout: 30000,
                });
                if (data.code !== 0 || data.status !== 'success') {
                    throw new AppError(
                        `Twitter API response error: ${data.msg || 'Twitter API error'}`,
                        'TWITTER_API_ERROR'
                    );
                }
                const currentPageTweets = data.data.tweets || [];
                const hasNextPage = data.has_next_page;
                cursor = data.next_cursor || null;

                //  Only add tweets from the last 24 hours to recentTweets.
                for (const tweet of currentPageTweets) {
                    if (isRecent(new Date(tweet.createdAt))) {
                        const simplifiedTweet: Tweet = {
                            id: tweet.id,
                            url: tweet.url,
                            text: tweet.text,
                            quoted_tweet: tweet.quoted_tweet
                                ? {
                                      id: tweet.quoted_tweet.id,
                                      url: tweet.quoted_tweet.url,
                                      text: tweet.quoted_tweet.text,
                                      createdAt: tweet.quoted_tweet.createdAt,
                                      quoted_tweet: null,
                                  }
                                : null,
                            createdAt: tweet.createdAt,
                        };
                        recentTweets.push(simplifiedTweet);
                    } else {
                        // If we encounter a tweet older than 24 hours, we can stop fetching more.
                        console.log(
                            'Encountered a tweet older than 24 hours, stopping fetch.'
                        );
                        return recentTweets;
                    }
                }

                // If no more pages, we're done
                if (!hasNextPage || !cursor) {
                    console.log(`Reached end of ${userName}'s tweets`);
                    return recentTweets;
                }
                // Add small delay to be respectful to the API
                await sleep(500);
                break; // Exit retry loop on success
            } catch (error) {
                if (error instanceof AxiosError) {
                    if (error.response?.status === 401) {
                        console.error('Authentication failed. Check API_KEY.');
                        throw new AppError(
                            'Authentication failed. Check API_KEY.',
                            'TWITTER_AUTH_ERROR'
                        );
                    } else if (error.response?.status === 429) {
                        console.warn(
                            'Rate limit exceeded. Waiting before retry...'
                        );
                        await sleep(1000);
                    } else {
                        console.error(`Axios error: ${error.message}`);
                    }
                }
                retryCount++;
                if (retryCount === maxRetries) {
                    console.log(
                        `Failed to fetch tweets after ${maxRetries} attempts`
                    );
                    throw new AppError(
                        `Failed to fetch tweets after ${maxRetries} attempts`,
                        'TWITTER_API_ERROR'
                    );
                }
                return recentTweets;
            }
        }
    }
}

import axios, { AxiosError } from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { backupToFile, GET_FOLLOWINGS, sleep } from './utils';
import dotenv from 'dotenv';
import AppError from './error';

dotenv.config();
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error('API_KEY is not defined');
}
const USERNAME = process.env.USERNAME;
if (!USERNAME) {
    throw new Error('USERNAME is not defined');
}

interface GetFollowingsParams {
    userName: string;
    pageSize: number;
    cursor?: string | null;
}

interface GetFollowingsResponse {
    code: number;
    status: 'success' | 'error';
    msg: string;
    followings: Following[];
    has_next_page: boolean;
    next_cursor: string | null;
}

interface Following {
    id: string;
    name: string;
    screen_name: string;
    userName: string;
    location: string;
    profile_image_url_https: string; //'https://pbs.twimg.com/profile_images/1945122913474002944/0b4550kf_normal.jpg',
}

export default async function getFollowings(pageSize = 200) {
    const allFollowings: Following[] = [];
    const seenUserIds = new Set(); // Set to track unique user IDs and avoid duplicates
    let cursor = null;
    const maxRetries = 3;

    while (true) {
        // Prepare query parameters for the API request
        const params: GetFollowingsParams = {
            userName: USERNAME!,
            pageSize: pageSize,
        };
        if (cursor) params.cursor = cursor;

        let retryCount = 0;
        while (retryCount < maxRetries) {
            try {
                const { data } = await axios.get<GetFollowingsResponse>(
                    GET_FOLLOWINGS,
                    {
                        headers: { 'X-API-Key': API_KEY! },
                        params,
                        timeout: 10000,
                    }
                );
                console.log(
                    `Fetched ${data.followings.length} followings from API.`
                );
                if (data.code !== 0 || data.status !== 'success') {
                    throw new AppError(
                        `Twitter API response error: ${data.msg || 'Twitter API error'}`,
                        'TWITTER_API_ERROR'
                    );
                } else if (data.followings.length === 0) {
                    throw new AppError('No followings found!', 'NO_FOLLOWINGS');
                }

                // Extract followings and metadata
                const followings = data.followings || [];
                const hasNextPage = data.has_next_page || false;
                cursor = data.next_cursor || null;

                // Filter out duplicate followings based on user ID
                for (const following of followings) {
                    const userId = following.id;
                    if (userId && !seenUserIds.has(userId)) {
                        seenUserIds.add(userId);
                        allFollowings.push(following);
                    }
                }
                // If no more pages, we're done
                if (!hasNextPage || !cursor) {
                    console.log(
                        `Got ${allFollowings.length} followings totally.`
                    );
                    // update cached followings.json file
                    await backupToFile(
                        JSON.stringify(allFollowings, null, 2),
                        'json',
                        'followings'
                    );
                    return allFollowings;
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
                        await sleep(1000 * retryCount);
                    } else {
                        console.error(`Axios error: ${error.message}`);
                    }
                } else if (error instanceof AppError) {
                    if (error.type === 'NO_FOLLOWINGS') {
                        console.error(
                            'TwitterAPI error or the user has no followings.'
                        );
                        await sleep(2000 * retryCount);
                    }
                }
                retryCount++;

                if (retryCount >= maxRetries) {
                    // read cache from local followings.json file (cache with graceful degradation)
                    try {
                        const __filename = fileURLToPath(import.meta.url);
                        const __dirname = path.dirname(__filename);
                        const filePath = path.join(
                            __dirname,
                            '../backups/followings.json'
                        );
                        const cached = await fs.readFile(filePath, 'utf-8');
                        const cachedFollowings = JSON.parse(
                            cached
                        ) as Following[];
                        if (cachedFollowings.length === 0) {
                            throw new AppError(
                                'No cached followings found!',
                                'NO_CACHED_FOLLOWINGS'
                            );
                        }
                        return cachedFollowings;
                    } catch (error) {
                        throw new AppError(
                            'No cached followings found!',
                            'NO_CACHED_FOLLOWINGS'
                        );
                    }
                }
            }
        }
    }
}

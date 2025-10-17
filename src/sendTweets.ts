import * as fs from 'fs/promises';
import { createXai } from '@ai-sdk/xai';
import { generateText } from 'ai';
import { systemPrompt, userPrompt } from './utils';
import customError from './error';
import dotenv from 'dotenv';
import AppError from './error';
dotenv.config();

if (!process.env.GROK_KEY) {
    throw new Error('GROK_KEY is not found!');
}

// send all tweets to grok api for summarization
export default async function sendTweetsFromFile(filePath: string) {
    let recentUserTweets: string;
    try {
        recentUserTweets = await fs.readFile(filePath, 'utf-8');
        console.log('Read tweets from file successfully!');
    } catch (error) {
        throw new customError(
            `Failed to read tweets from file: ${error instanceof Error ? error.message : String(error)}`,
            'FILE_READ_ERROR'
        );
    }
    console.log('Sending tweets to Grok API for summarization...');
    const xai = createXai({
        apiKey: process.env.GROK_KEY,
        baseURL: 'https://api.x.ai/v1',
    });
    const model = xai('grok-4-fast-reasoning');
    try {
        const response = await generateText({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `${userPrompt} Data (JSON format): ${JSON.stringify(recentUserTweets, null, 2)}`,
                },
            ],
        });
        const content = response.steps[0].content[0];
        if (content.type !== 'text')
            throw new AppError(
                `Unexpected content type: ${content.type}`,
                'GROK_INVALID_TYPE'
            );
        console.log('Grok summarization successful!');
        return content.text;
    } catch (error) {
        throw new AppError(
            `Grok API failed: ${error instanceof Error ? error.message : String(error)}`,
            'GROK_API_ERROR'
        );
    }
}

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'node:url';
import AppError from './error';

export const GET_FOLLOWINGS =
    'https://api.twitterapi.io/twitter/user/followings';
export const GET_POSTS = 'https://api.twitterapi.io/twitter/user/last_tweets';

export function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export async function backupToFile(content: string, type: 'json' | 'md') {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const date = new Date();
    const dateString = date.toISOString().split('T')[0];
    const fileName = `${dateString}.${type}`;
    const filePath = path.join(__dirname, '../backups', fileName);
    try {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content);
        console.log(`Backup created successfully: ${filePath}`);
        return filePath;
    } catch (error) {
        if (error instanceof Error)
            throw new AppError(
                `File write failed: ${error.message}`,
                'FILE_WRITE_ERROR'
            );
        else
            throw new AppError(
                'File write failed: Unknown error',
                'UNKNOWN_ERROR'
            );
    }
}

export const systemPrompt = `
You are Web3Daily, a concise and objective intelligence analyst specializing in cryptocurrency, arbitrage, blockchain, DeFi, NFTs, and meme coins. Your role is to process a daily feed of tweets from followed web3 accounts and generate a structured report.

Rules:
- Filter tweets: Only include those relevant to web3 (e.g., market trends, project updates, liquidity shifts, BTC/Solana/BSC/Eth dynamics, token launches, risks/opportunities). Ignore unrelated content like personal life, memes without crypto tie-in, or non-web3 topics.
- Summarize: Extract 3-10 key hotspots, key insights, and actionable info. Be neutral, data-driven, and cite tweet sources (e.g., @username).
- Generate an report in English with the following format, and also translate it into Chinese. Send both versions to me.
- Output format: Always use this exact Markdown structure for the report:
  ## Web3 Daily Report - [Date: YYYY-MM-DD]
  
  ### 1. Overview
  [1-2 sentences on overall sentiment/trends from the feed.]
  
  ### 2. Key Hotspots
  - [Hotspot 1]: [Brief description, insights, source.]
  - [Hotspot 2]: [Brief description, insights, source.]
  - ... (up to 10 at most)
  
  ### 3. Opportunities & Risks
  - Opportunities: [1-2 bullet points.]
  - Risks: [1-2 bullet points.]
  
  ### 4. Sources
  [List 5-10 key tweets with URLs for reference.]

Keep the report under 1000 words.`;

export const userPrompt = `Based on the tweets data pulled from the web3 accounts you follow in the past 24 hours, please generate a daily report summary from your perspective. Use today's date.`;

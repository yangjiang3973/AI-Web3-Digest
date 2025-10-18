# Twitter Web3 Summary By AI

[![Node.js Version](https://img.shields.io/badge/node-%3E=18-green.svg)](https://nodejs.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Twitter Follow](https://img.shields.io/twitter/follow/farmer3973?label=Follow)](https://x.com/farmer3973)

Automated Web3 Twitter digest generator: Fetches recent tweets from your followed accounts, filters for Web3-relevant content (crypto, DeFi, NFTs, memes), summarizes hotspots with Grok AI, and emails a daily Markdown report. Perfect for staying in sync with the market trends without doomscrolling.

## Features

- **Smart Fetching**: Pulls followings' tweets from the past 24 hours using TwitterAPI.io (bypasses expensive official plan).
- **Web3 Filtering**: Automatically ignores unrelated posts, focuses on blockchain, liquidity, defi, etc.
- **Backups**: Saves raw tweets and summaries as JSON/MD in `backups/` for reference or study in the future.
- **AI Summarization**: Uses Grok-4 (xAI) to generate structured reports: overview, 3-5 hotspots, opportunities/risks.
- **Daily Automation**: Cron-scheduled at 10 AM (Shanghai/Beijing Timezone)
- **Email Delivery**: Sends formatted HTML reports via Resend.

## Quick Start

### Prerequisites

- Node.js >= 18
- Accounts: TwitterAPI.io, xAI Grok API, Resend (free 3K emails/month)

### Installation and Usage

Clone the repo:

`git clone https://github.com/yangjiang3973/twitter-web3-summary.git`

`cd twitter-web3-summary`

Install dependencies:

`npm install`

Copy and configure environment:

`cp .env.example .env`

Edit `.env` with your keys from TwitterAPI.io, xAI Grok, Resend, your Twitter username and email list of recipients.

Edit cron schedule in `src/index.ts` if needed. Default time to send report is 10 a.m. (UTC+8).

(Optional) Edit `utils.ts` to customize AI system prompts (e.g., more focus on Solana memes).

Build and run:

`npm run dev` or `npm run build && npm start` for production mode. (better to run with PM2)

Your first report will generate and email automatically on 10 a.m. (UTC+8).

Check `backups/` for JSON/MD files.

## Configuration

See `.env.example` for full details. Key vars:

- `API_KEY`: TwitterAPI.io key (for fetching tweets/followings).
- `USERNAME`: Your X (Twitter) username.
- `GROK_KEY`: xAI Grok API key (console.x.ai).
- `RESEND_KEY`: Resend API key (resend.com).
- `EMAIL_LIST`: Comma-separated list of email addresses to send the digest to.

See `utils.ts` to customize. Key vars:

- `systemPrompt` for different focuses (e.g., NFTs, DeFi).

**Security Note**: Never commit `.env` (already in .gitignore).

Example Output (Markdown Report):

```markdown
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
```

## Architecture

- **src/**: Core logic (fetchers, Grok summarizer, email sender).
- **types/**: TS interfaces (Tweet, UserTweets).
- **utils/**: Helpers (prompts, backupToFile, sleep).
- **backups/**: Auto-generated JSON/MD files (ignored in Git).

## Contributing

1. Fork the repo & clone locally.
2. Create a feature branch (`git checkout -b feat/amazing-feature`).
3. Install & run: `npm install && npm run dev`.
4. Lint/format: `npm run lint:fix` (pre-commit auto-runs).
5. Commit: Husky checks style.
6. Push & PR: Describe changes, reference issues.

## License

This project is [MIT](LICENSE) licensed. See LICENSE for details.

## Acknowledgments

- Built with [Grok AI](https://x.ai) for summarization.
- [TwitterAPI.io](https://twitterapi.io) for data fetching.
- Thanks to xAI, Resend, and open-source community!

---

⭐ **Star this repo if it saves you time!** Questions? Open an issue. 🚀
Happy coding! - [yangjiang3973](https://github.com/yangjiang3973)

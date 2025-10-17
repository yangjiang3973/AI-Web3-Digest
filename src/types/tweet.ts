export interface Tweet {
    id: string;
    url: string;
    text: string;
    createdAt: string; // "Mon Oct 06 08:10:31 +0000 2025",
    quoted_tweet: null | Tweet;
}

export interface UserTweets {
    name: string;
    tweets: Tweet[];
}

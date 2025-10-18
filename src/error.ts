type ErrorType =
    | 'UNKNOWN_ERROR'
    | 'FILE_WRITE_ERROR'
    | 'FILE_READ_ERROR'
    | 'TWITTER_API_ERROR'
    | 'TWITTER_AUTH_ERROR'
    | 'GROK_INVALID_TYPE'
    | 'GROK_API_ERROR'
    | 'EMAIL_ERROR'
    | 'NO_FOLLOWINGS';

export default class AppError extends Error {
    type: ErrorType;
    constructor(message: string, type: ErrorType = 'UNKNOWN_ERROR') {
        super(message);
        this.name = 'AppError';
        this.type = type;
    }
}

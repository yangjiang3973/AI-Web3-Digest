import fs from 'fs/promises';
import { marked } from 'marked';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import { emailList } from './utils';
import AppError from './error';
dotenv.config();
if (!process.env.RESEND_KEY) {
    throw new Error('RESEND_KEY is not found!');
}
const resend = new Resend(process.env.RESEND_KEY);

export default async function sendEmail(filePath: string) {
    let summary: string;
    try {
        // read from summary file
        summary = await fs.readFile(filePath, 'utf-8');
        console.log('Read summary from file successfully!');
    } catch (error) {
        throw new AppError(
            `Failed to read summary from file: ${error instanceof Error ? error.message : String(error)}`,
            'FILE_READ_ERROR'
        );
    }
    // convert markdown to html
    const htmlSummary = marked(summary);
    const styledHtml = `
            <!DOCTYPE html>
            <html>
            <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                h1, h2, h3 { color: #1a73e8; }
                ul { list-style-type: disc; padding-left: 20px; }
                a { color: #1a73e8; text-decoration: none; }
                strong { color: #d93025; }
            </style>
            </head>
            <body>
            ${htmlSummary}
            </body>
            </html>
        `;
    try {
        // send email by using resend
        const { error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: emailList,
            subject: 'Hello from Resend',
            html: `${styledHtml}`,
        });
        if (error)
            throw new AppError(
                `Resend email failed: ${error.message}`,
                'EMAIL_ERROR'
            );
    } catch (error) {
        if (error instanceof AppError) throw error;
        else
            throw new AppError(
                `Email send failed: ${error instanceof Error ? error.message : String(error)}`,
                'EMAIL_ERROR'
            );
    }
}

# Guest App

This Next.js project is a simple guestbook application where users can leave a message and optionally upload a file. Messages and uploaded files are stored in Vercel Blob.

## Features

- Add guestbook entries with a name and message
- Upload JPEG, PNG, WebP, GIF, and PDF files
- Client-side and server-side validation with Zod
- Basic profanity filtering
- Read and create entries with Server Actions
- Data fetching and client state management with TanStack Query

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query
- React Hook Form
- Zod
- Radix UI
- Vercel Blob

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create a `.env.local` file in the project root:

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

3. Start the development server:

```bash
pnpm dev
```

4. Open `http://localhost:3000` in your browser.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## How It Works

- Messages are stored in Vercel Blob as `guestbook/messages.json`.
- Uploaded files are saved under `guestbook/uploads/`.
- When a new message is submitted, a Server Action validates the input and updates the blob data.
- The home page fetches the message list through a Server Action.

## File Rules

- Maximum file size: `5 MB`
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`

## Notes

- The app includes the required `remotePatterns` configuration in `next.config.mjs` so images served from Vercel Blob can be displayed correctly.
- When deployed on Vercel with Blob configured, environment variables may be provided automatically by the platform.

# Twins - AI Writing Style Cloning

Clone your unique writing style with AI. Upload your past writings, extract your Style DNA, and generate content that matches your voice.

## Features

- **Style DNA Extraction**: AI analyzes your writing to understand your tone, structure, vocabulary, and unique quirks
- **Multi-Format Support**: Upload articles via URL, file upload (.txt, .md), or paste text directly
- **AI Content Generation**: Generate new content in your writing style using GPT-4 or Claude
- **Secure API Key Management**: Your API keys are encrypted and stored securely
- **Dark Theme UI**: Modern, OpenAI-inspired interface

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: NextAuth.js v5 (Google, GitHub OAuth)
- **Database**: Vercel Postgres with Drizzle ORM
- **AI**: OpenAI GPT-4 & Anthropic Claude

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Vercel Postgres)
- OpenAI or Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ZhaoYis/Twins.git
cd Twins
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```env
# Database
POSTGRES_URL=your-postgres-connection-string

# NextAuth
AUTH_SECRET=your-secret-key-at-least-32-characters
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key

# App URL
NEXTAUTH_URL=http://localhost:3000
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign In**: Use Google or GitHub OAuth to sign in
2. **Add API Key**: Go to Settings and add your OpenAI or Anthropic API key
3. **Upload Articles**: Upload your past writings (at least 1 article for best results)
4. **Extract Style DNA**: Click "Analyze My Style" to create your style profile
5. **Generate Content**: Enter a topic and generate content in your writing style

## Deployment

This project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Set up OAuth redirect URLs for your domain
5. Deploy

### Custom Domain

The project is configured for deployment at `twins.dsx.plus`. Update OAuth redirect URLs accordingly.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   ├── auth/               # Auth pages
│   ├── dashboard/          # Dashboard page
│   └── settings/           # Settings page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── landing/            # Landing page sections
│   ├── dashboard/          # Dashboard components
│   └── shared/             # Shared components
├── lib/
│   ├── ai/                 # AI service abstractions
│   ├── db/                 # Database utilities
│   └── auth/               # Auth utilities
└── types/                  # TypeScript types
```

## License

MIT



# ChatGPT Clone

A full‑stack ChatGPT‑style application built with Next.js 14 (App Router), NextAuth, MongoDB (Mongoose), AI SDK (Gemini/OpenAI), Cloudinary for uploads, mem0 memory, email delivery, and SWR for data fetching.

### Key features
- Authentication with NextAuth (Google OAuth) and MongoDB adapter.  
- AI chat with provider‑pluggable backends via AI SDKs (Gemini, OpenAI).  
- Memory system using mem0AI for persistent conversation context.  
- File uploads to Cloudinary; Image,txt,csv,docx.etc 
- Email sending via SMTP/Nodemailer (e.g., for notifications or magic links if enabled).  
- Modern UI stack: React 18, Tailwind CSS, Lucide/React Icons, MD rendering and code highlighting.  
- Ready for local dev and Vercel deployment.
- Fully Responsive
- Chat thread actions: delete thread and edit message (like ChatGPT).

***

## Tech stack

- Framework: Next.js 14 (App Router), React 18, TypeScript  
- Auth: NextAuth.js v5 (beta) + @auth/mongodb-adapter  
- Database: MongoDB + Mongoose  
- AI: ai SDK, @ai-sdk/google, @ai-sdk/openai, @google/generative-ai  
- Storage: Cloudinary  
- Memory: mem0ai  
- Email: nodemailer + SMTP (optionally Resend SDK present)  
- UI/UX: Tailwind CSS, react-markdown, rehype-highlight, remark-gfm, react-syntax-highlighter, lucide-react, react-icons  

- Validation: zod  
- Tooling: ESLint 9, eslint-config-next, TypeScript 5, Tailwind 4

***

## Prerequisites

- Node.js 18+ (LTS recommended)  
- MongoDB database (Atlas or self‑hosted)  
- Cloudinary account (for media)  
- Google OAuth credentials (for NextAuth Google provider)  
- SMTP credentials (for email features)  
- Gemini API key (and optionally other AI provider keys if enabled)  

***

## Getting started

1) Clone and install
```bash
git clone https://github.com/akshayyy13/ChatGPT_Clone.git
cd ChatGPT_Clone
npm install
# or: yarn / pnpm / bun install
```

2) Create environment file  
Create a .env.local in the project root with the following keys:

```bash
# Database
DATABASE_URL=your-mongodb-connection-string

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Memory (mem0)
MEM0_API_KEY=your-mem0-api-key

# Feature flags
DISABLE_AI=false

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# SMTP / Email
SMTP_HOST=smtp.yourhost.com
SMTP_PORT=587
SMTP_USER=your-user
SMTP_PASSWORD=your-password
FROM_EMAIL="Your App <no-reply@yourdomain.com>"

# AI providers
GEMINI_API_KEY=your-gemini-api-key
# Optionally add OPENAI_API_KEY, ANTHROPIC_API_KEY, MISTRAL_API_KEY if you wire them
```

Notes:
- NEXTAUTH_SECRET should be a strong random string.  
- For Google OAuth in local dev, set the Authorized redirect URI to:
  http://localhost:3000/api/auth/callback/google  
- In production, set NEXTAUTH_URL to the deployed domain and add the corresponding redirect URI:
  https://your-domain.com/api/auth/callback/google

3) Run the dev server
```bash
npm run dev
```
Open http://localhost:3000

***

## Scripts

- dev: Start development server  
- build: Build for production  
- start: Start production server  
- lint: Run ESLint

```bash
npm run dev
npm run build
npm run start
npm run lint
```

***

## Project structure

A typical structure (yours may vary):

```
app/
  api/
    auth/
      [...nextauth]/route.ts        # NextAuth routes (v5 style route handlers)
    chat/route.ts                   # Chat API (streaming/completions)
    upload/route.ts                 # Upload endpoints if applicable
  page.tsx                          # Main UI
  layout.tsx                        # Root layout
components/
lib/
  db.ts                             # Mongo connection helper (Mongoose)
  auth.ts                           # NextAuth config
  ai/
    providers.ts                    # AI provider wiring via AI SDK
    prompts.ts                      # Prompt helpers
  cloudinary.ts                     # Cloudinary config
  email.ts                          # Nodemailer helper
models/
  User.ts                           # Mongoose models
  Thread.ts
  Message.ts
styles/
public/
```

***

## Configuration details

- Database (Mongoose): Ensure DATABASE_URL points to a MongoDB instance. Recommended to reuse a singleton connection to avoid hot‑reload issues.  
- Auth (NextAuth v5 beta): Uses the App Router and route handlers. Ensure NEXTAUTH_URL and NEXTAUTH_SECRET are set. Google provider requires correct redirect URI.  
- Cloudinary: Provide cloud name, key, and secret. The client should use signed or unsigned presets per your security model.  
- AI providers: The app is set up with Gemini via GEMINI_API_KEY. If enabling OpenAI/Anthropic/Mistral, wire their API keys and model names where configured in lib/ai/providers.ts.  
- Memory (mem0): Provide MEM0_API_KEY and configure how/when memories are stored/retrieved in your chat pipeline.  
- Email: Configure SMTP_* and FROM_EMAIL. If using Resend, add its API key and switch the transport in lib/email.ts.  


***

## Environment variables

The application reads these keys:

- DATABASE_URL  
- CLOUDINARY_CLOUD_NAME  
- CLOUDINARY_API_KEY  
- CLOUDINARY_API_SECRET  
- MEM0_API_KEY  
- DISABLE_AI (set true to disable outbound AI calls)  
- NEXTAUTH_URL  
- NEXTAUTH_SECRET  
- GOOGLE_CLIENT_ID  
- GOOGLE_CLIENT_SECRET  
- SMTP_HOST  
- SMTP_PORT  
- SMTP_USER  
- SMTP_PASSWORD  
- FROM_EMAIL  
- GEMINI_API_KEY  
- Optional if enabled: OPENAI_API_KEY, ANTHROPIC_API_KEY, MISTRAL_API_KEY

For local development, use .env.local. For production, add them in the hosting provider’s environment settings.

***

## Deployment (Vercel)

1) Push the repository to GitHub/GitLab/Bitbucket.  
2) Import the project into Vercel.  
3) Add all environment variables in Project Settings → Environment Variables.  
4) Set NEXTAUTH_URL to your production URL.  
5) Update Google OAuth Authorized redirect URI to:
   https://your-domain.com/api/auth/callback/google  
6) Deploy.

Notes:

- For file uploads, confirm Cloudinary credentials are present in the Production environment.

***

## Troubleshooting

- OAuth redirect mismatch: Ensure NEXTAUTH_URL matches the domain and the Google redirect URI matches /api/auth/callback/google.  
- Mongo connection errors: Verify DATABASE_URL and IP allowlist (if Atlas). Use a single Mongoose connection instance.  
- 401 on chat endpoints: Sessions may be missing; confirm NextAuth session strategy and that cookies are set on the same domain.  
- File upload failures: Validate Cloudinary credentials and upload presets; check server logs for error codes.  
- AI provider errors: Confirm API keys and model names; set DISABLE_AI=false to allow calls. Add retry/backoff for rate limits.  
- PDF/OCR performance: Large PDFs and images can be heavy. Consider queueing, size limits, and timeouts.

***

## Security best practices

- Never commit .env* files.  
- Use strong NEXTAUTH_SECRET and rotate API keys periodically.  
- Validate and sanitize user uploads; enforce file size/type limits.  
- Apply server‑side schema validation with zod for incoming data.  
- Scope OAuth and API keys minimally.

***

## Roadmap ideas

- Streaming UI enhancements and abort controls.  
- Per‑provider model selection and fallbacks.  
- Thread sharing and export (Markdown/PDF).  
- Role‑based access, usage limits, and billing.  
- Vector search and RAG integration.

***

## License

MIT (or your chosen license). Update LICENSE accordingly.

***

## Acknowledgements

- Next.js, Vercel AI SDK, NextAuth, MongoDB, Cloudinary, mem0, and the open‑source community.

[1](https://github.com/chirag-23/ChatGPT-Clone-Nextjs)
[2](https://github.com/nisabmohd/ChatGPT)
[3](https://www.youtube.com/watch?v=H1W5vxlueDo)
[4](https://medevel.com/self-hosted-chatgpt-based-apps/)
[5](https://www.youtube.com/watch?v=vfQ8QwFZBeQ)
[6](https://www.youtube.com/watch?v=ULGedgq6R_4)
[7](https://dev.to/nisabmohd/chatgpt-clone-with-next13-openapi-pgl)
[8](https://reliasoftware.com/blog/react-ai-chatbot-template)
[9](https://codesandbox.io/p/sandbox/nextjs-tailwindcss-chatgpt-clone-yln6h3)

# Next.js + GraphQL Application Template

A production-ready application template built with **Next.js 16**, **Apollo GraphQL**, **NextAuth.js**, **Tailwind CSS 4**, and **shadcn/ui**.

## Features

- **Next.js 16** App Router with Turbopack dev server
- **Apollo Client 4** with server-side rendering, WebSocket subscriptions, and Relay-style pagination
- **NextAuth.js** authentication (CredentialsProvider placeholder — swap for any provider)
- **Tailwind CSS 4** with 6 built-in color themes and dark mode
- **shadcn/ui** component library (40+ primitives included)
- **next-intl** internationalization (English + Spanish)
- **Permission system** with client-side hooks and server-side guards
- **GraphQL Codegen** for type-safe queries and mutations
- **Docker** production build with standalone output
- **Pino** structured logging

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Public landing page
│   ├── auth/               # Sign-in / sign-out pages
│   ├── api/auth/           # NextAuth API routes
│   ├── layout.tsx          # Root layout (fonts, providers, i18n)
│   ├── AppProviders.tsx    # Client-side providers (session, theme, Apollo)
│   └── ApolloWrapper.tsx   # Apollo client provider with token injection
├── components/
│   ├── ui/                 # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── layout/             # App layout components (sidebar, header, footer)
│   ├── theme/              # Theme provider and switcher
│   ├── forms/              # React Hook Form field wrappers
│   ├── filters/            # Filter panel and search input
│   ├── permissions/        # Feature flag and protected components
│   └── ...                 # Other shared components
├── contexts/               # React contexts (auth, navigation, pending actions)
├── hooks/                  # Custom hooks (pagination, permissions, debounce, etc.)
├── i18n/                   # Internationalization config
├── lib/                    # Core libraries
│   ├── auth.ts             # NextAuth configuration
│   ├── apollo-client.ts    # Server-side Apollo client
│   ├── makeClient.ts       # Client-side Apollo client
│   ├── themes.ts           # Theme definitions (6 color schemes)
│   ├── navigationTree.tsx  # Sidebar navigation configuration
│   └── permissions/        # Permission constants and server guards
├── types/                  # TypeScript type declarations
├── utils/                  # Utility functions
└── __generated__/          # GraphQL codegen output (auto-generated)
```

## Customization

### Adding Pages

Create new pages under `src/app/`. The template only includes the public landing page — add your routes as needed.

### Theming

The template ships with 6 color themes defined in [src/lib/themes.ts](src/lib/themes.ts) and [src/app/globals.css](src/app/globals.css). Switch themes using the `data-theme` attribute on `<html>`, or use the built-in `ThemeSwitcher` component.

### Authentication

The default CredentialsProvider in [src/lib/auth.ts](src/lib/auth.ts) accepts any credentials in development. Replace it with your preferred provider (Keycloak, Auth0, Google, GitHub, etc.).

### GraphQL

1. Export your backend schema to `src/__generated__/schema.graphql`
2. Run `pnpm codegen` to generate TypeScript types
3. Write queries using `gql` tag and use them with Apollo hooks

### Navigation

Edit [src/lib/navigationTree.tsx](src/lib/navigationTree.tsx) to define your sidebar modules and submodules.

### Internationalization

Add translation keys to `messages/en.json` and `messages/es.json`. Use the i18n management script:

```bash
pnpm manage-i18n add "my.key.path" "English value" "Spanish value"
```

## Scripts

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `pnpm dev`         | Start dev server with Turbopack |
| `pnpm build`       | Production build                |
| `pnpm start`       | Start production server         |
| `pnpm lint`        | Run ESLint                      |
| `pnpm type-check`  | Run TypeScript type checking    |
| `pnpm codegen`     | Generate GraphQL types          |
| `pnpm format`      | Format code with Prettier       |
| `pnpm manage-i18n` | Manage i18n translation keys    |

## Docker

```bash
docker build --build-arg API_URL=http://your-api:5005 -t your-app .
docker run -p 3000:3000 your-app
```

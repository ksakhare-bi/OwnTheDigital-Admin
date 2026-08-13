# Own the Digital — Admin CMS

Internal CMS for managing blog content. Public marketing site lives in a separate `website` app (to be added later). Both apps share the same **MongoDB** database.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- MongoDB + Mongoose
- Zod + React Hook Form
- ESLint + Prettier

## Responsibilities

- Admin login / session (stubbed)
- Dashboard
- Create / update / delete blogs
- Publish / unpublish
- Image uploads (planned)

This app is **not** public-facing. The website app will only **read** published blogs.

## Folder structure

```
src/
  app/           # routes (auth + dashboard)
  components/    # UI (layout, blogs, shared)
  hooks/         # client hooks
  lib/           # db, validations
  models/        # Mongoose models
  services/      # business logic
  types/         # shared TypeScript types
  utils/         # pure helpers
```

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Default port: [http://localhost:3000](http://localhost:3000)

Set `MONGODB_URI` in `.env.local` before using blog services.

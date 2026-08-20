# Lakehead Education — TypeScript MERN Platform

Full-stack TypeScript: Express API (strict TS, layered architecture) + React SPA (Vite, strict TS).
Public site, blog, contact/inquiry pipeline, and a role-based admin panel with team user management.

## File structure

```
lakehead-ts/
├── server/
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── server.ts            # entry: connect DB, start HTTP
│       ├── app.ts               # Express app factory (testable)
│       ├── config/
│       │   ├── env.ts           # Zod-validated environment (crashes early on bad config)
│       │   ├── db.ts
│       │   └── seedAdmin.ts     # npm run seed:admin
│       ├── types/
│       │   ├── express.d.ts     # adds req.user typing
│       │   └── common.ts        # PaginatedResult<T>, PaginationQuery
│       ├── models/              # Mongoose schemas + exported TS interfaces
│       │   ├── User.ts          # roles: admin | editor, active flag
│       │   ├── Post.ts          # slug + publishedAt hooks
│       │   └── Inquiry.ts       # status pipeline: new → contacted → closed
│       ├── validators/          # Zod request schemas (single source of truth)
│       ├── middleware/
│       │   ├── auth.ts          # protect + requireRole("admin") RBAC guard
│       │   ├── validate.ts      # generic Zod validator middleware
│       │   ├── errorHandler.ts  # ApiError-aware, hides internals in prod
│       │   └── rateLimiters.ts
│       ├── services/            # business logic — reusable outside HTTP
│       │   ├── auth.service.ts
│       │   ├── post.service.ts
│       │   ├── inquiry.service.ts   # includes stats() aggregation
│       │   └── user.service.ts      # admin team management
│       ├── controllers/         # thin HTTP adapters over services
│       ├── utils/               # ApiError, asyncHandler, password, pagination
│       └── routes/v1/           # versioned API: /api/v1/...
└── client/
    ├── tsconfig.json
    └── src/
        ├── types/api.ts         # API contract types shared by all pages
        ├── api/client.ts        # typed axios + getErrorMessage helper
        ├── context/AuthContext.tsx
        ├── components/          # Layout, Navbar, Footer, ProtectedRoute
        ├── pages/               # Home, About, Services, Blog, BlogPost, Contact
        ├── pages/admin/         # Login, Dashboard, PostEditor, Inquiries, Users
        └── styles.css           # design tokens in :root — swap in your design here
```

## Why this architecture scales

- **Services hold the logic, controllers stay thin.** When you later add a mobile app,
  cron jobs, or email automation, they call the same services — no logic duplication.
- **Versioned routes (`/api/v1`)** mean you can ship breaking changes later as `/v2`
  without breaking existing clients.
- **Zod schemas are the single source of truth for input validation**, and `env.ts`
  refuses to boot with a bad configuration instead of failing mysteriously at runtime.
- **RBAC via `requireRole(...)`**: admins have full control (delete posts/inquiries,
  manage team users); editors can manage content and inquiries. Adding a new role is
  a one-line union type change — the compiler then shows you everywhere to handle it.
- **`app.ts` is a factory**, so integration tests can spin up the app without binding a port.

## API surface (v1)

| Method | Path                        | Access        | Purpose                    |
|--------|-----------------------------|---------------|----------------------------|
| POST   | /api/v1/auth/login          | public (rate-limited) | Login, sets httpOnly cookie |
| POST   | /api/v1/auth/logout         | public        | Clear session              |
| GET    | /api/v1/auth/me             | authenticated | Current user               |
| GET    | /api/v1/posts               | public        | Published posts, paginated |
| GET    | /api/v1/posts/slug/:slug    | public        | Single published post      |
| GET    | /api/v1/posts/admin/all     | authenticated | All posts incl. drafts     |
| GET    | /api/v1/posts/admin/:id     | authenticated | Single post for editing    |
| POST   | /api/v1/posts               | authenticated | Create post                |
| PUT    | /api/v1/posts/:id           | authenticated | Update post                |
| DELETE | /api/v1/posts/:id           | admin         | Delete post                |
| POST   | /api/v1/inquiries           | public (rate-limited) | Contact form       |
| GET    | /api/v1/inquiries           | authenticated | List, filter by status, paginated |
| GET    | /api/v1/inquiries/stats     | authenticated | Counts per status          |
| PATCH  | /api/v1/inquiries/:id       | authenticated | Update status/notes        |
| DELETE | /api/v1/inquiries/:id       | admin         | Delete inquiry             |
| GET    | /api/v1/users               | admin         | List team members          |
| POST   | /api/v1/users               | admin         | Add team member            |
| PATCH  | /api/v1/users/:id           | admin         | Edit role/active/password  |
| GET    | /api/v1/albums              | public        | Published albums           |
| GET    | /api/v1/albums/slug/:slug   | public        | Album + its media          |
| GET    | /api/v1/albums/admin/all    | authenticated | All albums incl. unpublished |
| POST   | /api/v1/albums              | authenticated | Create album               |
| PUT    | /api/v1/albums/:id          | authenticated | Update album               |
| DELETE | /api/v1/albums/:id          | admin         | Delete album + its media   |
| GET    | /api/v1/media               | public        | List media, filter ?album= ?type= |
| POST   | /api/v1/media               | authenticated | Upload image/video (multipart `file`) |
| PATCH  | /api/v1/media/:id           | authenticated | Edit title/caption/album/order |
| DELETE | /api/v1/media/:id           | admin         | Delete media + file        |

Uploaded files are stored in `server/uploads/` and served at `/uploads/<filename>`
(max 200 MB; jpeg/png/webp/gif images, mp4/webm/mov videos).

## Local setup

Prerequisites: Node 18+, MongoDB (local or Atlas).

```bash
# Backend
cd server
cp .env.example .env      # set MONGO_URI and a 32+ char JWT_SECRET
npm install
npm run seed:admin
npm run dev               # http://localhost:5000

# Frontend (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

Admin panel: http://localhost:5173/admin/login (credentials from server/.env).

Useful scripts: `npm run typecheck` (both), `npm run build` (both), server `npm start` runs compiled `dist/`.

## Deployment

| Piece    | Service           | Notes                                       |
|----------|-------------------|---------------------------------------------|
| Database | MongoDB Atlas     | Free M0 tier                                |
| API      | Render / Railway  | Build: `npm run build`, start: `npm start`  |
| Frontend | Vercel / Netlify  | Set `VITE_API_URL=https://<api>/api/v1`     |

Production checklist:
1. Strong random 32+ char `JWT_SECRET`; `NODE_ENV=production`.
2. `CLIENT_URL` = exact frontend origin (CORS + cookie trust).
3. HTTPS on both ends (cookies are `secure` + `sameSite: none` in prod; providers handle this).
4. Change the seeded admin password after first login.

## Extending (the backend is ready for these)

- **Email on new inquiry**: call Nodemailer inside `inquiryService.create`.
- **Image uploads**: Cloudinary + multer; store URL in `coverImage`.
- **New data domains** (e.g. universities, student applications, testimonials): copy the
  model → validator → service → controller → route pattern; RBAC and pagination utilities
  are already generic.
- **Rich text**: sanitize server-side with `sanitize-html` before storing HTML.
- **SEO**: public pages can migrate to Next.js later; this API needs zero changes.

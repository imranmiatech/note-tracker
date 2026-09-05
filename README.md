# Secure Note-Taking Application API

A production-quality REST API for a **Secure Note-Taking Application** built with **NestJS**, **TypeScript**, **MongoDB**, and **Mongoose**.

---

## 1. Core Features & Tech Stack

- **Framework**: NestJS & TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT Access Token (15m) + Refresh Token (7d)
- **Password Hashing**: Secure password hashing with `bcrypt` (10 salt rounds)
- **Role-Based Access Control (RBAC)**: `USER` and `ADMIN` role permissions
- **Password Reset**: 6-digit numeric OTP sent via Nodemailer email
- **Aggregation Pipelines**: 
  - **Scenario 1**: Group users by interests using a single `collection.aggregate()` call (`$unwind` and `$group`).
  - **Scenario 2**: Retrieve user posts using a single `$lookup` aggregation pipeline.
- **Validation**: Global `ValidationPipe` with `class-validator` and `class-transformer`.
- **API Documentation**: Interactive Swagger OpenAPI 3.0 UI.

---

## 2. Installation & Setup

```bash
# Clone repository & navigate to folder
cd note-tracker

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

---

## 3. Database Seeding & Running

```bash
# Seed initial ADMIN and USER accounts
npm run seed

# Run development server with watch mode
npm run start:dev

# Build production bundle
npm run build
```

### Initial Seed Accounts

| Role | Email | Password |
|---|---|---|
| **ADMIN** | `admin@example.com` | `admin123` |
| **USER** | `user@example.com` | `user123` |
| **USER** | `jane@example.com` | `user123` |

---

## 4. API Endpoints Summary (Global Prefix `/api/v1`)

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user account (defaults to `USER` role) | Public |
| `POST` | `/api/v1/auth/login` | Login and receive `accessToken` & `refreshToken` | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Authenticated |
| `POST` | `/api/v1/auth/forgot-password` | Request 6-digit OTP sent via email | Public |
| `POST` | `/api/v1/auth/reset-password` | Reset password using `{ otp, newPassword }` | Public |
| `POST` | `/api/v1/auth/refresh` | Issue new tokens using `{ refreshToken }` | Public |

### Users (`/api/v1/users`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/users/me` | Get own user profile | Authenticated |
| `PATCH` | `/api/v1/users/me` | Update own profile (`name`, `interests`) | Authenticated |
| `GET` | `/api/v1/users/analytics/interests` | **Scenario 1 Aggregation**: Group users by interests | Authenticated |
| `GET` | `/api/v1/users` | Paginated list of all users | **ADMIN Only** |
| `GET` | `/api/v1/users/:id` | Get specific user profile | **ADMIN Only** |
| `POST` | `/api/v1/users` | Admin creates user account | **ADMIN Only** |
| `PATCH` | `/api/v1/users/:id` | Admin updates user account | **ADMIN Only** |
| `DELETE` | `/api/v1/users/:id` | Admin deletes user account | **ADMIN Only** |
| `GET` | `/api/v1/users/:userId/notes` | List notes belonging to a specific user | **ADMIN Only** |

### Notes (`/api/v1/notes`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/notes` | Create note (`userId` assigned from `req.user.sub`) | Authenticated |
| `GET` | `/api/v1/notes` | List notes with pagination (User sees own notes; Admin sees all notes) | Authenticated |
| `GET` | `/api/v1/notes/:id` | Get specific note (Owner or Admin) | Authenticated |
| `PATCH` | `/api/v1/notes/:id` | Update specific note (Owner or Admin) | Authenticated |
| `DELETE` | `/api/v1/notes/:id` | Delete specific note (Owner or Admin) | Authenticated |

### Posts (`/api/v1/posts`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/posts` | Create public post | Authenticated |
| `GET` | `/api/v1/posts` | List public posts feed with pagination | Public |
| `GET` | `/api/v1/posts/user/:userId` | **Scenario 2 Aggregation**: Retrieve posts for user with `$lookup` | Public |
| `GET` | `/api/v1/posts/:id` | Get single post details | Public |
| `PATCH` | `/api/v1/posts/:id` | Update post (Author or Admin) | Authenticated |
| `DELETE` | `/api/v1/posts/:id` | Delete post (Author or Admin) | Authenticated |

---

## 5. Indexing Strategy

> [!IMPORTANT]
> The indexing strategy follows strict query-matching rules using explicit `schema.index()` method definitions.

| Collection | Defined Index | Supported Query / Operation | Justification |
|---|---|---|---|
| **`users`** | `{ email: 1 }` (`unique`) | `userModel.findOne({ email })` | Login & Register lookups by email; enforces email uniqueness at DB level. |
| **`users`** | `{ createdAt: -1 }` | `userModel.find().sort({ createdAt: -1 }).skip().limit()` | Supports Admin user listing with pagination sorted by newest first. |
| **`users`** | `{ interests: 1 }` | `userModel.aggregate([{ $unwind: "$interests" }, ...])` | Multikey index supporting **Scenario 1** interest grouping aggregation. |
| **`notes`** | `{ userId: 1, createdAt: -1 }` | `noteModel.find({ userId }).sort({ createdAt: -1 }).skip().limit()` | Compound index supporting User note listing filtered by `userId` and sorted by date. |
| **`posts`** | `{ userId: 1, createdAt: -1 }` | `postModel.aggregate([{ $match: { userId } }, { $lookup: ... }])` | Compound index supporting **Scenario 2** `$lookup` aggregation join and user post queries. |

### Why Unnecessary Indexes Were Omitted
- **No `_id` indexes**: MongoDB automatically indexes `_id` for every collection. Adding `{ _id: 1 }` via `schema.index()` would create a redundant index.
- **No separate `{ userId: 1 }` index on notes/posts**: The compound index `{ userId: 1, createdAt: -1 }` has `userId` as its prefix, satisfying both single-field `{ userId: 1 }` queries and sorted compound queries.

---

## 6. Aggregation Pipeline Breakdown

### Scenario 1 — Group Users by Interests (`GET /api/v1/users/analytics/interests`)
- **Constraint**: Implemented using **exactly one `collection.aggregate()` call**.
- **Pipeline**:
  1. `$unwind: '$interests'` — Deconstructs the array field `interests` into individual documents.
  2. `$group: { _id: '$interests', totalUsers: { $sum: 1 }, users: { $push: { _id, name, email, role } } }` — Groups documents by interest value.
  3. `$sort: { _id: 1 }` — Sorts interest groups alphabetically.

### Scenario 2 — User Posts with `$lookup` (`GET /api/v1/posts/user/:userId`)
- **Constraint**: Implemented using a **single aggregation pipeline with `$lookup`**.
- **Pipeline**:
  1. `$match: { userId: userObjectId }` — Filters posts by author `userId`.
  2. `$sort: { createdAt: -1 }` — Sorts posts newest first.
  3. `$lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'author' }` — Joins post author details from the `users` collection.
  4. `$unwind: '$author'` — Flattens the joined `author` array into an object.
  5. `$project` — Excludes sensitive password and security token fields.

---

## 7. Interactive API Documentation (Swagger)

Start the server and visit:
👉 **[http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)**

# MSG API

> Express · TypeScript · Prisma · PostgreSQL · Zod · Vitest

A REST API for a messaging service supporting one-on-one chats, group chats, contacts, and user management.

Live: [mailboxapi.vercel.app](https://mailboxapi.vercel.app)

## Getting Started

### Prerequisites

- Node.js (see `package.json` engines, or use a recent LTS)
- PostgreSQL database
- A [Cloudinary](https://cloudinary.com) account (for image uploads)

### Installation

```bash
git clone https://github.com/nimbusphagia/MailboxAPI.git
cd MailboxAPI
npm install
```

`npm install` also runs `prisma generate` automatically via the `postinstall` script.

### Environment variables

Create a `.env` file in the project root:

```
DATABASE_URL=
CLIENT_URL=
JWT_SECRET=
NODE_ENV=
PORT=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

| Variable                 | Description                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`            | PostgreSQL connection string                                       |
| `CLIENT_URL`              | Origin allowed by CORS (your frontend URL)                         |
| `JWT_SECRET`              | Secret used to sign/verify auth JWTs                                |
| `NODE_ENV`                | `development` or `production`                                      |
| `PORT`                    | Port the server listens on (`development` only)                    |
| `CLOUDINARY_CLOUD_NAME`   | Cloudinary cloud name, for image uploads                           |
| `CLOUDINARY_API_KEY`      | Cloudinary API key                                                  |
| `CLOUDINARY_API_SECRET`   | Cloudinary API secret                                               |

### Database setup

```bash
npx prisma migrate deploy   # apply migrations
npm run seed                # optional: seed sample data
```

### Running the server

```bash
npm run dev     # development, with hot reload
npm run build   # compile to dist/
npm start        # run compiled build
```

### Running tests

```bash
npm test
```

---

## Authentication

[#authentication](#authentication)

Authentication uses a JWT stored in an HTTP-only cookie (`token`), set on login/signup. Public routes live under `/auth`. All `/api` routes require a valid cookie — requests without one return `401`.

---

## Endpoints

[#endpoints](#endpoints)

### Auth

[#auth](#auth)

| Method | Endpoint       | Description                         |
| ------ | -------------- | ------------------------------------ |
| POST   | `/auth/signup` | Register a new account              |
| POST   | `/auth/login`  | Log in and receive a session cookie |
| POST   | `/auth/logout` | Log out and clear the session cookie |

---

### Assets

[#assets](#assets)

| Method | Endpoint                      | Description                          |
| ------ | ------------------------------ | ------------------------------------- |
| GET    | `/api/assets/profile-pictures` | List available default profile pictures |

---

### Users

[#users](#users)

| Method | Endpoint                 | Description               |
| ------ | ------------------------ | -------------------------- |
| GET    | `/api/user`              | List all users            |
| GET    | `/api/user/me`           | Get the current user      |
| GET    | `/api/user/:id`          | Get a user by ID          |
| PATCH  | `/api/user/:id`          | Edit own profile (accepts an optional `image` file) |
| PATCH  | `/api/user/password/:id` | Change own password       |
| DELETE | `/api/user/:id`          | Delete own account        |

---

### Contacts

[#contacts](#contacts)

| Method | Endpoint                      | Description            |
| ------ | ------------------------------ | ----------------------- |
| GET    | `/api/user/contact`           | List own contacts      |
| GET    | `/api/user/contact/blocked`   | List blocked contacts  |
| GET    | `/api/user/contact/:contactId` | Get a contact by ID    |
| POST   | `/api/user/contact`           | Add a contact          |
| PATCH  | `/api/user/contact/:contactId` | Edit contact nickname  |
| PATCH  | `/api/user/contact/block/:contactId` | Toggle blocked status |
| DELETE | `/api/user/contact/:contactId` | Remove a contact        |

---

### Chats (DMs)

[#chats-dms](#chats-dms)

| Method | Endpoint             | Description        |
| ------ | --------------------- | ------------------- |
| GET    | `/api/chat`           | List own chats      |
| GET    | `/api/chat/:id`       | Get a chat by ID    |
| POST   | `/api/chat`           | Create a DM chat    |
| POST   | `/api/chat/archived`  | Archive/unarchive a chat |
| DELETE | `/api/chat/:id`       | Delete a chat        |

---

### Messages

[#messages](#messages)

| Method | Endpoint                       | Description                     |
| ------ | ------------------------------ | -------------------------------- |
| POST   | `/api/chat/message`            | Send a message (accepts an optional `image` file) |
| PUT    | `/api/chat/message/:messageId` | Edit a message (sender only)    |
| DELETE | `/api/chat/message/:messageId` | Delete a message (sender only)  |

Supported message types: `TEXT` (requires `content`) and `IMAGE` (requires an uploaded image file, stored via Cloudinary). An optional `replyToId` field can be used to thread replies.

---

### Groups

[#groups](#groups)

| Method | Endpoint                           | Description                                  |
| ------ | ----------------------------------- | ---------------------------------------------- |
| POST   | `/api/group`                       | Create a group (accepts an optional `image` file; current user becomes OWNER) |
| GET    | `/api/group`                       | List own groups                                |
| GET    | `/api/group/:id`                   | Get a group by ID                              |
| PUT    | `/api/group/:id`                   | Edit group name or image (OWNER only)          |
| DELETE | `/api/group/:id`                   | Delete the group (OWNER only)                  |
| DELETE | `/api/group/leave/:chatId`         | Leave a group                                  |
| POST   | `/api/group/member`                | Add a member (OWNER or ADMIN)                  |
| PATCH  | `/api/group/member/role/:memberId` | Change a member's role (OWNER only)             |
| DELETE | `/api/group/member/:chatId/:userId` | Remove a member (OWNER or ADMIN)               |

#### Role permissions

[#role-permissions](#role-permissions)

| Action               | OWNER | ADMIN | MEMBER |
| --------------------- | ----- | ----- | ------ |
| Send messages         | ✓     | ✓     | ✓      |
| Add / remove members  | ✓     | ✓     | —      |
| Edit group info       | ✓     | —     | —      |
| Change member roles   | ✓     | —     | —      |
| Delete group          | ✓     | —     | —      |

---

## Error format

[#error-format](#error-format)

```json
{ "message": "Description of what went wrong" }
```

| Status | Meaning                       |
| ------ | ------------------------------ |
| 400    | Validation error              |
| 401    | Not authenticated             |
| 403    | Not permitted                 |
| 404    | Not found or access denied    |
| 409    | Conflict (duplicate resource) |

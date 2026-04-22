# Messaging API
> Express · TypeScript · Prisma · PostgreSQL · Zod · Vitest

A REST API for a real-time messaging service supporting one-on-one chats, group chats, contacts, and user management.

## Authentication

Authentication uses session cookies. Public routes live under `/auth`. All `/api` routes require a valid session — requests without one return `401`.

---

## Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register a new account |
| POST | `/auth/login` | Log in and receive a session cookie |

---

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user` | List all users |
| GET | `/api/user/:id` | Get a user by ID |
| PATCH | `/api/user/:id` | Edit own profile |
| PATCH | `/api/user/password/:id` | Change own password |
| DELETE | `/api/user/:id` | Delete own account |

---

### Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/contact` | List own contacts |
| GET | `/api/user/contact/:id` | Get a contact by ID |
| POST | `/api/user/contact` | Add a contact |
| PATCH | `/api/user/contact/:id` | Edit contact nickname |
| PATCH | `/api/user/contact/block/:id` | Toggle blocked status |
| DELETE | `/api/user/contact/:id` | Remove a contact |

---

### Chats (DMs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat` | List own chats |
| GET | `/api/chat/:id` | Get a chat by ID |
| POST | `/api/chat` | Create a DM chat |
| DELETE | `/api/chat/:id` | Delete a chat |

---

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/message` | Send a message |
| PUT | `/api/chat/message/:messageId` | Edit a message (sender only) |
| DELETE | `/api/chat/message/:messageId` | Delete a message (sender only) |

Supported message types: `TEXT` (requires `content`) and `IMAGE` (requires `metadata` with image URL). An optional `replyToId` field can be used to thread replies.

---

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/group` | Create a group (current user becomes OWNER) |
| GET | `/api/group/:id` | Get a group by ID |
| PUT | `/api/group/:id` | Edit group name or image (OWNER only) |
| DELETE | `/api/group/:id` | Delete the group (OWNER only) |
| POST | `/api/group/member` | Add a member (OWNER or ADMIN) |
| PATCH | `/api/group/member/role/:memberId` | Change a member's role (OWNER only) |
| DELETE | `/api/group/member/:memberId` | Remove a member (OWNER or ADMIN) |

#### Role permissions

| Action | OWNER | ADMIN | MEMBER |
|--------|:-----:|:-----:|:------:|
| Send messages | ✓ | ✓ | ✓ |
| Add / remove members | ✓ | ✓ | — |
| Edit group info | ✓ | — | — |
| Change member roles | ✓ | — | — |
| Delete group | ✓ | — | — |

---

## Error format

```json
{ "message": "Description of what went wrong" }
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not permitted |
| 404 | Not found or access denied |
| 409 | Conflict (duplicate resource) |

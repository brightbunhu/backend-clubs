# Clubs Project Backend

A Node.js/Express backend for managing university clubs, events, users, and comments, with authentication, role-based access, and file uploads. Built with MongoDB and Mongoose.

---

## 📁 Folder Structure

```
Clubs-project/
│
├── config/                # Database connection config
│   └── db.js
│
├── controllers/           # Route handler logic for each resource
│   ├── clubController.js
│   ├── commentController.js
│   ├── eventController.js
│   └── userController.js
│
├── middlewares/           # Express middlewares (auth, upload, async)
│   ├── asyncHandler.js
│   ├── authmiddleware.js
│   └── upload.js
│
├── models/                # Mongoose schemas/models
│   ├── clubModel.js
│   ├── commentModel.js
│   ├── eventModel.js
│   └── userModel.js
│
├── routes/                # Express route definitions
│   ├── clubRoutes.js
│   ├── commentRoutes.js
│   ├── eventRoutes.js
│   └── userRoutes.js
│
├── utils/                 # Utility functions (e.g., JWT creation)
│   └── createToken.js
│
├── importSeedData.js      # Script to import initial clubs/events/users
├── index.js               # Main server entry point
├── package.json           # Project metadata and dependencies
├── README.md              # This file
└── uploads/               # (Created at runtime) Profile picture uploads
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB instance (local or cloud)

### Installation
1. Clone the repo:
   ```bash
   git clone <repo-url>
   cd Clubs-project
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root with:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000 # or any port
   ```
4. (Optional) Seed the database with sample clubs, events, and users:
   ```bash
   node importSeedData.js
   ```

### Running the Server
```bash
npm run dev
```
Server runs on `http://localhost:5000` by default.

---

## 🗄️ Database Models

### User
- `regNumber` (String, unique)
- `email` (String, unique)
- `name`, `surname`, `dob`
- `profilePicture` (String, path/URL)
- `password` (hashed)
- `roles` (Array: e.g., student, staff, club_leader, patron, sto, admin)
- `clubsJoined` (Array of Club references)

### Club
- `name` (String, unique)
- `description`
- `introducedAt` (Date)
- `profilePic` (String, path/URL)
- `patron` (User reference)
- `clubLeaders` (Array of User references)
- `members` (Array of User references)

### Event
- `title`, `description`, `date`
- `club` (Club reference)
- `createdBy` (User reference)
- `status` (pending/approved/rejected)
- `likes` (Array of User references)
- `comments` (Array of Comment references)
- `svpList` (Array of User references for attendance)

### Comment
- `eventId` (Event reference)
- `userId` (User reference)
- `content` (String)
- `timestamp` (Date)

---

## 🌐 API Routes

### User Routes (`/api/users`)
- `POST /register` — Register a new user (with profile picture upload)
- `POST /login` — Login (returns JWT)
- `POST /logout` — Logout
- `POST /promote` — Promote a user to a role (protected)
- `POST /demote` — Demote a user from a role (protected)

### Club Routes (`/api/clubs`)
- `GET /` — List all clubs
- `GET /:id` — Get club by ID
- `POST /` — Create club (admin/sto only, with profile pic upload)
- `PUT /:id` — Update club (admin/sto/patron/club_leader)
- `DELETE /:id` — Delete club (admin/sto/patron)
- `POST /:id/join` — Join a club (authenticated)
- `GET /:id/leaders` — List club leaders
- `GET /:id/members` — List club members (club_leader/patron/sto only)

### Event Routes (`/api/events`)
- `GET /` — List events (role-based visibility)
- `GET /:id` — Get event by ID
- `POST /` — Create event (club_leader/patron/sto)
- `PUT /:id` — Update event (club_leader/patron/sto)
- `DELETE /:id` — Delete event (club_leader/patron/sto)
- `POST /:id/approve` — Approve event (patron/sto)
- `POST /:id/reject` — Reject event (patron/sto)
- `POST /:id/like` — Like event (authenticated)
- `POST /:id/unlike` — Unlike event (authenticated)
- `POST /:id/svp` — Mark attendance (authenticated)
- `GET /:id/svp` — Get attendance list (club_leader/patron/sto)

### Comment Routes (`/api/comments`)
- `POST /:eventId` — Add comment to event (authenticated)
- `DELETE /:commentId` — Delete comment (club_leader/patron/sto)
- `GET /event/:eventId` — List comments for event

---

## 🔐 Authentication & Authorization
- **JWT-based authentication**: Users receive a token on login, sent in the `Authorization: Bearer <token>` header.
- **Role-based access**: Certain endpoints require specific roles (e.g., admin, sto, club_leader, patron).
- **Middleware**: `protect` checks JWT, `requireRoles` checks user roles.

---

## 🖼️ File Uploads
- Profile pictures are uploaded via `multer` and stored in `uploads/profile_pictures/`.
- Accessible at `/uploads/profile_pictures/<filename>`.
- Only image files up to 2MB are allowed.

---

## 🌱 Seeding Data
- Use `importSeedData.js` to import clubs, events, and create leader/patron users from `clubs (1).json` and `events (1).json`.
- Credentials for created users are saved in `imported_leaders_credentials.txt`.
- Run with:
  ```bash
  node importSeedData.js
  ```

---

## 🏗️ Blueprint / Architecture

1. **Request Flow**
   - Client sends HTTP request to `/api/...` endpoint.
   - Express routes forward to controllers.
   - Controllers handle business logic, interact with Mongoose models.
   - Middleware enforces authentication, authorization, and file uploads.
   - Responses are sent as JSON.

2. **Example: Creating an Event**
   - User (with `club_leader`, `patron`, or `sto` role) sends `POST /api/events` with event data.
   - `protect` middleware checks JWT, controller validates input and permissions.
   - Event is saved to MongoDB, response includes event data.

3. **Static Files**
   - Profile pictures are served statically from `/uploads/profile_pictures`.

---

## 🤝 Contributing
Pull requests welcome! Please open an issue first to discuss major changes.

## 📝 License
[MIT](LICENSE) (or specify your license)
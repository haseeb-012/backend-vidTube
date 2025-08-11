# VidTube Backend

A robust backend service for a video-sharing platform inspired by YouTube. This project provides a comprehensive API for managing users, videos, comments, playlists, subscriptions, and more.

## 📋 Features

- **User Management**
    - Registration and authentication
    - Profile management
    - Secure password handling
    - JWT-based authentication

- **Video Management**
    - Upload and stream videos
    - Video metadata (title, description)
    - View tracking
    - Toggle publish status

- **Social Features**
    - Comments on videos
    - Like/unlike videos, comments, and tweets
    - Subscribe to channels
    - Create and share tweets

- **Content Organization**
    - Create and manage playlists
    - Add/remove videos from playlists
    - User watch history

- **Channel Dashboard**
    - View channel statistics
    - Manage uploaded content

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **File Handling**: Multer
- **Security**: bcryptjs for password hashing
- **Other Tools**: 
    - mongoose-paginate-v2 for pagination
    - dotenv for environment variables

## 🏗️ Project Structure

```
src/
├── controllers/       # Business logic handlers
├── models/           # Mongoose schemas
├── routes/           # API routes
├── middlewares/      # Custom middlewares
├── utils/            # Helper functions
├── db/               # Database connection
├── .env              # Environment variables
└── index.js          # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account

### Installation

1. Clone the repository
     ```bash
     git clone <repository-url>
     cd Backend
     ```

2. Install dependencies
     ```bash
     npm install
     ```

3. Create a `.env` file in the `src` directory based on `.env.sample`
     ```
     PORT=8000
     CORS_ORIGIN=*
     MONGO_URI=<your-mongodb-connection-string>
     ACCESS_TOKEN_SECRET=<your-jwt-secret>
     ACCESS_TOKEN_EXPIRY=1d
     REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
     REFRESH_TOKEN_EXPIRY=7d
     CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
     CLOUDINARY_API_KEY=<your-cloudinary-api-key>
     CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
     ```

4. Start the development server
     ```bash
     npm run dev
     ```

5. The API will be available at `http://localhost:8000`

## 📝 API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login a user
- `POST /api/v1/users/logout` - Logout a user
- `POST /api/v1/users/refresh-token` - Refresh access token

### User Management
- `GET /api/v1/users/get-current-user` - Get current user details
- `POST /api/v1/users/change-password` - Change user password
- `PUT /api/v1/users/update-account` - Update account details
- `PATCH /api/v1/users/update-avatar` - Update user avatar
- `PATCH /api/v1/users/update-cover-image` - Update user cover image
- `GET /api/v1/users/channel/:username` - Get channel profile
- `GET /api/v1/users/watch-history` - Get user watch history

### Videos
- `GET /api/v1/videos` - Get all videos
- `POST /api/v1/videos` - Upload a new video
- `GET /api/v1/videos/:videoId` - Get a specific video
- `PATCH /api/v1/videos/:videoId` - Update a video
- `DELETE /api/v1/videos/:videoId` - Delete a video
- `PATCH /api/v1/videos/toggle/publish/:videoId` - Toggle publish status

### Comments
- `GET /api/v1/comments/:videoId` - Get all comments for a video
- `POST /api/v1/comments/:videoId` - Add a comment to a video
- `PATCH /api/v1/comments/c/:commentId` - Update a comment
- `DELETE /api/v1/comments/c/:commentId` - Delete a comment

### Likes
- `POST /api/v1/likes/toggle/v/:videoId` - Toggle like on a video
- `POST /api/v1/likes/toggle/c/:commentId` - Toggle like on a comment
- `POST /api/v1/likes/toggle/t/:tweetId` - Toggle like on a tweet
- `GET /api/v1/likes/videos` - Get all liked videos

### Playlists
- `POST /api/v1/playlists` - Create a new playlist
- `GET /api/v1/playlists/:playlistId` - Get a specific playlist
- `PATCH /api/v1/playlists/:playlistId` - Update a playlist
- `DELETE /api/v1/playlists/:playlistId` - Delete a playlist
- `PATCH /api/v1/playlists/add/:videoId/:playlistId` - Add video to playlist
- `PATCH /api/v1/playlists/remove/:videoId/:playlistId` - Remove video from playlist
- `GET /api/v1/playlists/user/:userId` - Get all playlists for a user

### Subscriptions
- `POST /api/v1/subscriptions/c/:channelId` - Toggle subscription to a channel
- `GET /api/v1/subscriptions/c/:channelId` - Get subscribed channels
- `GET /api/v1/subscriptions/u/:subscriberId` - Get channel subscribers

### Tweets
- `POST /api/v1/tweets` - Create a new tweet
- `GET /api/v1/tweets/user/:userId` - Get user tweets
- `PATCH /api/v1/tweets/:tweetId` - Update a tweet
- `DELETE /api/v1/tweets/:tweetId` - Delete a tweet

### Dashboard
- `GET /api/v1/dashboard/stats` - Get channel statistics
- `GET /api/v1/dashboard/videos` - Get channel videos

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- HTTP-only cookies for token storage
- Input validation
- Error handling middleware

## 📚 Utilities

- `ApiError` - Custom error handling
- `ApiResponse` - Standardized API responses
- `asyncHandler` - Async function wrapper for error handling
- `cloudinary` - File upload and management

## 🧪 Development

Run the server in development mode:

```bash
npm run dev
```

## 🚢 Production

Start the server in production mode:

```bash
npm start
```

## 📄 License

This project is licensed under the ISC License.

## ✍️ Author

Haseeb Sajjad (haseeb-012)
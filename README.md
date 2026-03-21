# ASK-Q

ASK-Q is a full-stack social platform designed for students to share posts, ask questions, and collaborate within their college community. It provides a specialized space for academic and campus-related discussions, allowing users to filter content by branch and year.

## 🚀 Features

- **User Authentication**: Secure signup and login using JWT.
- **College-Specific Filters**: View posts based on specific branches and academic years.
- **Post Creation**: Share thoughts, questions, or resources with optional file attachments (images, documents, etc.).
- **Interactive Comments**: Engage with other students through comments on posts.
- **Profile Management**: Update user details and manage your account.
- **Search Functionality**: Easily find relevant posts using keywords.
- **Security**: Password hashing and protected API routes.

## 🛠️ Tech Stack

### Frontend
- **React (^19.2.0)**: Modern UI library.
- **Vite**: Ultra-fast build tool and development server.
- **React Router (^7.13.1)**: Declarative routing for React.
- **Axios**: Promise-based HTTP client for API requests.
- **Lucide React**: Beautifully simple pixel-perfect icons.
- **CSS**: Vanilla CSS for styling.

### Backend
- **Node.js**: JavaScript runtime environment.
- **Express (^5.2.1)**: Fast, unopinionated, minimalist web framework.
- **MongoDB & Mongoose**: NoSQL database and object modeling.
- **JSON Web Token (JWT)**: For secure authentication.
- **Multer**: Middleware for handling file uploads.
- **Bcrypt**: For password security.
- **Nodemailer / SendGrid**: For email notifications.

## 🔄 Working Flow

1. **Authentication**: Users register with their college email. Upon login, a JWT is issued and stored on the client.
2. **Dashboard**: The main feed displays posts from all users. Users can apply filters (Branch, Year) or use the search bar to narrow down content.
3. **API Layer**: The React frontend communicates with the Express backend via RESTful endpoints (`/api/auth`, `/api/posts`).
4. **Data Management**: Post and user data are stored in MongoDB. Files uploaded are stored locally on the server (served via `/uploads`).
5. **Security**: Protected routes on both frontend and backend ensure only authorized users can create or interact with content.

## 📦 Setup and Installation

### Prerequisites
- Node.js installed
- MongoDB (local or Atlas)

### Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your configurations (MONGODB_URI, JWT_SECRET, etc.).
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```


# Twitter/X Clone Application

A full-stack social media application built with React and Node.js, featuring user authentication, posts, notifications, and social interactions.

## 🚀 Features

### Backend Features

-   **User Authentication**: Signup, login, logout with JWT tokens
-   **User Management**: Profile management, follow/unfollow users, suggested users
-   **Posts**: Create, delete, like/unlike, comment on posts
-   **Social Feed**: View all posts, following posts, liked posts, user-specific posts
-   **Notifications**: Real-time notifications with management capabilities
-   **Protected Routes**: Secure API endpoints with authentication middleware

### Frontend Features

-   **Modern React UI**: Built with React 19 and TypeScript
-   **Responsive Design**: TailwindCSS with DaisyUI components
-   **State Management**: TanStack Query for server state management
-   **Routing**: React Router for navigation
-   **Toast Notifications**: User feedback with react-hot-toast
-   **Icon Library**: React Icons for UI elements

## 🛠️ Tech Stack

### Backend

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB with Mongoose ODM
-   **Authentication**: JWT (JSON Web Tokens)
-   **Password Hashing**: bcryptjs
-   **File Upload**: Cloudinary integration
-   **CORS**: Cross-origin resource sharing enabled

### Frontend

-   **Framework**: React 19 with TypeScript
-   **Build Tool**: Vite
-   **Styling**: TailwindCSS 4.x with DaisyUI
-   **State Management**: TanStack React Query
-   **Routing**: React Router DOM 7.x
-   **UI Components**: Custom components with modern design


``

## 🔗 API Endpoints

### Authentication Routes (`/api/auth`)

-   `GET /me` - Get current user info (protected)
-   `POST /signup` - User registration
-   `POST /login` - User login
-   `POST /logout` - User logout

### User Routes (`/api/users`)

-   `GET /profile/:username` - Get user profile (protected)
-   `GET /suggested` - Get suggested users (protected)
-   `POST /follow/:id` - Follow/unfollow user (protected)
-   `POST /update` - Update user profile (protected)

### Post Routes (`/api/posts`)

-   `GET /all` - Get all posts (protected)
-   `GET /following` - Get posts from followed users (protected)
-   `GET /likes/:id` - Get liked posts by user (protected)
-   `GET /user/:username` - Get posts by specific user (protected)
-   `POST /create` - Create new post (protected)
-   `DELETE /:id` - Delete post (protected)
-   `POST /like/:id` - Like/unlike post (protected)
-   `POST /comment/:id` - Comment on post (protected)

### Notification Routes (`/api/notifications`)

-   `GET /` - Get user notifications (protected)
-   `DELETE /` - Delete all notifications (protected)
-   `DELETE /:id` - Delete specific notification (protected)

## ⚙️ Installation & Setup

### Prerequisites

-   Node.js (v16 or higher)
-   MongoDB database
-   Cloudinary account (for image uploads)

### Backend Setup

1.  **Clone the repository**
    
    ```bash
    git clone <repository-url>
    cd project-2
    
    ```
    
2.  **Install backend dependencies**
    
    ```bash
    npm install
    
    ```
    
3.  **Environment Variables** Create a `.env` file in the root directory:
    
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    NODE_ENV=development
    
    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    
    ```
    
4.  **Start the backend server**
    
    ```bash
    npm run dev
    
    ```
    

### Frontend Setup

1.  **Navigate to frontend directory**
    
    ```bash
    cd frontend
    
    ```
    
2.  **Install frontend dependencies**
    
    ```bash
    npm install
    
    ```
    
3.  **Start the development server**
    
    ```bash
    npm run dev
    
    ```
    
4.  **Build for production**
    
    ```bash
    npm run build
    
    ```
    

## 🔒 Security Features

-   **JWT Authentication**: Secure token-based authentication
-   **Protected Routes**: Middleware protection for sensitive endpoints
-   **Password Hashing**: bcryptjs for secure password storage
-   **CORS Configuration**: Proper cross-origin resource sharing setup
-   **Input Validation**: Server-side validation for all inputs

## 📱 Frontend Features

-   **Responsive Design**: Mobile-first approach with TailwindCSS
-   **Modern UI Components**: DaisyUI component library integration
-   **Type Safety**: Full TypeScript support for better development experience
-   **Performance Optimized**: Vite build tool for fast development and builds
-   **State Management**: Efficient server state caching with TanStack Query

## 🚀 Deployment

### Backend Deployment

-   Configure environment variables for production
-   Set up MongoDB database (MongoDB Atlas recommended)
-   Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment

-   Build the application: `npm run build`
-   Deploy to platforms like Vercel, Netlify, or static hosting services

## 🤝 Contributing

1.  Fork the repository
2.  Create a feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🛟 Support

For support and questions, please open an issue in the repository or contact the development team.

----------

**Note**: Make sure to configure all environment variables before running the application. The app requires a MongoDB database and Cloudinary account for full functionality.

# StudyHub — Frontend

Next.js frontend for StudyHub collaborative study platform.

## 🔗 Live URLs
- Frontend: https://frontend-final-fullstack.vercel.app
- Backend: https://backend-final-fullstack.onrender.com

## 🛠 Tech Stack
- Next.js 14 (App Router)
- React 18
- Plain CSS
- UploadThing (file uploads)
- WebSocket (real-time chat)
- Jest + React Testing Library (testing)

## 📁 Project Structure
```text
frontend/src/
├── app/
│   ├── login/           # Login page
│   ├── register/        # Register page
│   ├── dashboard/       # Dashboard page
│   ├── rooms/           # Rooms list + room detail with chat
│   ├── notes/           # Notes list + note editor
│   ├── profile/         # User profile + avatar upload
│   └── api/uploadthing/ # UploadThing API route
├── components/
│   ├── Navbar.js        # Navigation bar
│   ├── ChatBox.js       # Real-time chat component
│   ├── OnlineUsers.js   # Online users list
│   └── Toast.js         # Toast notifications
├── context/
│   ├── AuthContext.js   # Authentication state
│   └── SocketContext.js # WebSocket connection
├── lib/
│   ├── api.js           # API helper functions
│   └── uploadthing.js   # UploadThing config
└── tests/
└── Navbar.test.js   # React component test
```

## ⚙️ Environment Variables
Create a `.env` file in the root:
NEXT_PUBLIC_API_URL=https://backend-final-fullstack.onrender.com/api (use your url in #Versel for backend) 
NEXT_PUBLIC_WS_URL=wss://backend-final-fullstack.onrender.com/ws (use your url in #Versel for backend) 
UPLOADTHING_TOKEN=your_uploadthing_token (you can get your token in this site #https://uploadthing.com)

## 🚀 Setup & Run
```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Run in production
npm start

# Run tests
npm test
```

## Pages
|      Route    |             Description              |
|---------------|--------------------------------------|
| `/`           | Home page                            |
| `/login`      | Sign in                              |
| `/register`   | Create account                       |
| `/dashboard`  | Overview of rooms and notes          |
| `/rooms`      | Browse and create study rooms        |
| `/rooms/[id]` | Room with live chat and online users |
| `/notes`      | Personal notes with search           |
| `/notes/[id]` | Note editor with file attachments    |
| `/profile`    | Edit profile and upload avatar       |

## Features
- JWT authentication (register, login, logout)
- Real-time chat with WebSocket
- Online users list
- Study rooms (public and private with join requests) with search and filter
- Personal notes with search and filter
- File uploads with UploadThing (avatars + note attachments)
- Responsive design

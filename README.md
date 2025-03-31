# ChatSync - Modern Real-Time Chat Application

ChatSync is a modern, feature-rich chat application built with Next.js 13, TypeScript, and Tailwind CSS. It offers a clean, minimalist design while providing powerful communication features for both individual and group conversations.


## ✨ Features

### Real-Time Messaging
- Instant message delivery
- Typing indicators
- Read receipts
- Message status updates
- Emoji reactions to messages

### Rich Media Support
- 🎤 Voice messages with real-time recording
- 📸 Image sharing with preview
- 📎 File attachments (PDF, DOC, etc.)
- 🖼️ Image gallery view
- ⬇️ One-click media downloads

### Social Features
- 👥 Add friends via email
- 📨 Friend request system with notifications
- ✅ Accept/decline friend requests with visual feedback
- 💬 Start conversations with newly accepted friends
- 🔔 Global notification system for important events

### Group Chat Features
- Create and manage group conversations
- Member status indicators (online/offline)
- Member count and activity tracking
- Group-specific settings and preferences

### Modern UI/UX
- 🌓 Dark/Light theme support
- 📱 Responsive design (mobile & desktop)
- ⚡ Smooth animations and transitions
- 🎯 Minimalist, clean interface
- 🔍 Chat search functionality

### Technical Features
- Server-Side Rendering (SSR)
- Client-side state management
- Optimistic updates
- Lazy loading for media
- TypeScript type safety
- LocalStorage persistence for chats and user data

## 🚀 Getting Started

### Prerequisites
- Node.js 16.8 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chatsync.git
cd chatsync
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
# On Windows - to avoid permission issues
$env:NEXT_TELEMETRY_DISABLED=1; npm run dev

# On macOS/Linux
NEXT_TELEMETRY_DISABLED=1 npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Troubleshooting

If you encounter permission issues with the `.next/trace` directory on Windows:
1. Stop the development server
2. Delete the `.next` directory: `rm -r -fo .next`
3. Restart with telemetry disabled: `$env:NEXT_TELEMETRY_DISABLED=1; npm run dev`

## 🛠️ Tech Stack

- **Framework:** Next.js 13
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Icons:** Heroicons
- **State Management:** React Hooks
- **Media Handling:** Browser APIs (MediaRecorder, File API)
- **Storage:** LocalStorage for data persistence

## 📁 Project Structure

```
src/
├── app/                # Next.js 13 app directory
│   └── page.tsx       # Main application layout
├── components/         # React components
│   ├── chat-area.tsx  # Main chat interface
│   ├── sidebar.tsx    # Chat list and navigation
│   ├── providers.tsx  # Theme and other providers
│   ├── friends/       # Friend-related components
│   │   ├── AddFriend.tsx      # Add friend form
│   │   └── FriendRequests.tsx # Friend request manager
│   ├── groups/        # Group-related components
│   ├── notifications/ # Notification system components
│   └── ...           # Other components
├── lib/               # Utility functions
│   └── store.ts      # Data storage and management
├── providers/         # Context providers
│   └── AuthProvider.tsx # Authentication management
├── styles/           # Global styles
└── types/            # TypeScript types
```

## 🔑 Using the App

1. **Register/Login**: Sign up with your name, email, and password
2. **Add Friends**: Use the Add Friend button to send friend requests
3. **Accept Friend Requests**: Check the sidebar for pending friend requests
4. **Start Conversations**: After accepting a request, start chatting immediately
5. **Create Groups**: Use the Create Group button to make group chats
6. **Send Messages**: Text, voice messages, images, and files

## 📱 Mobile Support

ChatSync is fully responsive and optimized for mobile devices:
- Swipe gestures for navigation
- Mobile-optimized media capture
- Touch-friendly interface
- Adaptive layouts

## 📤 Pushing to GitHub

To push your changes to GitHub:

```bash
# Initialize Git repository if not already done
git init

# Add remote repository
git remote add origin https://github.com/yourusername/chatsync.git

# Add all files
git add .

# Commit changes
git commit -m "Initial commit with chat application"

# Push to GitHub
git push -u origin main
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Heroicons](https://heroicons.com/)

---

Made with ❤️ by Sandipan 

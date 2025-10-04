# � MedTracker - Smart Medication Management System

A comprehensive medication tracking and reminder system built with Next.js, featuring AI-powered health tips, real-time notifications, and progress analytics.

## 🌟 Features

### 📋 Core Functionality
- **Medication Management**: Add, edit, and delete medications with dosage and scheduling
- **Smart Reminders**: Customizable notification system with overdue alerts
- **Progress Tracking**: Detailed adherence analytics and streak monitoring
- **Real-time Sync**: Cross-tab synchronization for seamless user experience

### � Notification System
- **Browser Notifications**: Native browser push notifications
- **Service Worker Integration**: Background notification processing
- **Multiple Reminder Types**: Pre-medication, on-time, and overdue reminders
- **One-click Actions**: Mark as taken or dismiss directly from notifications
- **Bulk Management**: Delete all notifications with single click

### 🤖 AI-Powered Features
- **Health Tips**: Personalized health advice using Ollama AI
- **Medication Insights**: Context-aware recommendations
- **Daily Health Tips**: Automated daily wellness content

### 📊 Analytics & Progress
- **Adherence Tracking**: Percentage-based medication compliance
- **Streak Monitoring**: Track consecutive days of perfect adherence
- **Visual Charts**: Interactive progress visualization with Recharts
- **Time-based Filtering**: Week, month, and all-time statistics

### 🚨 Emergency Features
- **Emergency Contacts**: Quick access to healthcare providers
- **Critical Alerts**: High-priority notifications for important medications

## � Tech Stack

### Frontend
- **Next.js 15.5.2**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern component library
- **Recharts**: Data visualization

### Backend
- **MongoDB**: NoSQL database with Mongoose ODM
- **NextAuth.js**: Authentication and session management
- **TanStack Query**: Server state management with caching

### Notifications
- **Service Workers**: Background processing
- **Web Push API**: Browser notifications
- **Real-time Sync**: Cross-tab communication

### AI Integration
- **Ollama**: Local AI model for health tips
- **Custom Prompts**: Medication-specific advice generation

## 📁 Project Structure

```
MED/
├── new-dashboard-app/          # Main Next.js application
│   ├── src/
│   │   ├── app/               # App Router pages and API routes
│   │   │   ├── api/           # Backend API endpoints
│   │   │   ├── login/         # Authentication pages
│   │   │   ├── register/      # User registration
│   │   │   └── globals.css    # Global styles
│   │   ├── components/        # React components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── pages/         # Page components
│   │   │   └── *.tsx          # Feature components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility libraries
│   │   └── shared/            # Shared utilities
│   ├── public/                # Static assets
│   └── package.json           # Dependencies
└── landing-page/              # Marketing landing page
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Ollama (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd India-Accelerator-OpenXAI-2025/MED/new-dashboard-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env.local` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/medtracker
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   OLLAMA_HOST=http://localhost:11434
   ```

4. **Setup MongoDB**
   - Install and start MongoDB
   - Database will be created automatically

5. **Setup Ollama (Optional)**
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Pull a model (e.g., llama2)
   ollama pull llama2
   ```

6. **Run the application**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Open http://localhost:3000
   - Register a new account or login

## 📱 Usage Guide

### Getting Started
1. **Register/Login**: Create account or sign in
2. **Add Medications**: Use the "+" button to add your medications
3. **Set Schedules**: Configure dosage times and frequency
4. **Enable Notifications**: Allow browser notifications for reminders

### Managing Medications
- **Add New**: Click "Add Medication" and fill in details
- **Edit Existing**: Click the edit icon on any medication card
- **Delete**: Use the delete button (with confirmation)
- **Mark as Taken**: Click the check button or use notification actions

### Notification Settings
- **Enable/Disable**: Toggle notifications in settings
- **Reminder Times**: Set custom reminder intervals (15 min, 30 min, etc.)
- **Quiet Hours**: Configure do-not-disturb periods
- **Sound & Vibration**: Customize notification preferences

### Progress Tracking
- **Dashboard View**: Quick overview of today's medications
- **Progress Page**: Detailed analytics and charts
- **Time Filters**: View weekly, monthly, or all-time statistics
- **Achievements**: Track streaks and milestones

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/session` - Current session

### Medications
- `GET /api/medications` - List user medications
- `POST /api/medications` - Add new medication
- `PUT /api/medications/[id]` - Update medication
- `DELETE /api/medications/[id]` - Delete medication

### Medication Logs
- `GET /api/medication-logs` - Get medication history
- `POST /api/medication-logs/mark-taken` - Mark medication as taken

### Notifications
- `GET /api/notifications` - List notifications
- `POST /api/notifications/delete-all` - Delete all notifications
- `POST /api/notifications/mark-read` - Mark as read

### Health Tips
- `POST /api/health-tips` - Generate AI health tips

## 🧩 Key Features Explained

### Real-time Synchronization
- **Cross-tab Communication**: Changes sync across browser tabs
- **Optimistic Updates**: Immediate UI feedback
- **Conflict Resolution**: Handles concurrent modifications

### Smart Notification System
- **Duplicate Prevention**: Prevents multiple logs for same medication
- **Overdue Management**: Escalating reminders for missed doses
- **Context Awareness**: Stops notifications when medication is taken

### Progress Analytics
- **Adherence Calculation**: Percentage-based compliance tracking
- **Streak Monitoring**: Consecutive perfect days
- **Visual Charts**: Interactive progress visualization
- **Time-based Analysis**: Weekly, monthly, and all-time views

## � Security Features

- **Secure Authentication**: NextAuth.js with secure sessions
- **Data Validation**: Input validation and sanitization
- **Protected Routes**: Authentication-required endpoints
- **User Isolation**: Data scoped to authenticated users

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Modern glass-morphism design
- **Accessibility**: ARIA labels and keyboard navigation
- **Progressive Enhancement**: Works without JavaScript for core features

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint checking
npm run type-check   # TypeScript checking
```

### Code Structure
- **Hooks**: Custom React hooks for shared logic
- **Components**: Reusable UI components
- **Services**: Business logic and API integration
- **Types**: TypeScript interfaces and types

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenXAI 2025**: India Accelerator program
- **Next.js Team**: For the amazing framework
- **shadcn/ui**: For beautiful components
- **Ollama**: For local AI capabilities
- **MongoDB**: For flexible data storage

## 📞 Support

For support, email [ankan@ankanroy.in](mailto:ankan@ankanroy.in) or create an issue in the repository.

---

**Built with ❤️ for better medication adherence and health outcomes** 

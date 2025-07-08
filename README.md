# Car Rental Admin Dashboard

A comprehensive Next.js admin dashboard for managing user-generated car rental listings. Built with TypeScript, Tailwind CSS, and featuring server-side rendering, authentication, and audit trails.

## 🚗 Features

### Core Features
- **🔐 Authentication System**: Secure login with JWT tokens
- **📊 Dashboard**: Server-side rendered dashboard with paginated listings
- **✅ Approval Workflow**: Approve, reject, or edit car rental listings
- **📝 CRUD Operations**: Full create, read, update, delete functionality
- **🔍 Search & Filter**: Search listings and filter by status (pending, approved, rejected)
- **📱 Responsive UI**: Beautiful, modern interface built with Tailwind CSS

### Advanced Features
- **📋 Audit Trail**: Complete logging system tracking all admin actions
- **⚡ Performance Optimized**: Efficient re-rendering and pagination
- **🛡️ Protected Routes**: Middleware-based authentication
- **💾 SQLite Database**: Local database with sample data
- **🎨 Modern UI Components**: Modals, notifications, and interactive elements

## 🛠️ Technical Stack

- **Frontend**: Next.js 14+ with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS
- **Database**: SQLite with custom ORM layer
- **Authentication**: JWT with secure HTTP-only cookies
- **State Management**: React Context API
- **Icons**: Lucide React
- **Build Tool**: Turbopack for fast development

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and setup**:
   ```bash
   # Dependencies are already installed
   # Database will be created automatically on first run
   ```

2. **Environment Setup**:
   ```bash
   # Environment variables are already configured in .env.local
   # Default JWT secret is set (change in production)
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Open [http://localhost:3000](http://localhost:3000)
   - Login with demo credentials: `admin` / `admin123`

## 📋 Demo Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin123`

## 🗄️ Database Schema

The application uses SQLite with the following tables:
- **users**: Admin user accounts
- **car_listings**: Car rental listings with status tracking
- **audit_logs**: Complete audit trail of all actions

Sample data is automatically seeded on first run.

## 🎯 Usage Guide

### Dashboard Features
1. **View Listings**: Browse all car rental submissions
2. **Approve/Reject**: Review and change listing status
3. **Edit Listings**: Modify listing details
4. **Search**: Find specific listings by title, brand, model, or location
5. **Filter**: View listings by status (all, pending, approved, rejected)

### Audit Trail
- Track all admin actions with timestamps
- View detailed change logs
- Monitor system activity

## 🔧 API Routes

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Listings Management
- `GET /api/listings` - Get paginated listings with filters
- `GET /api/listings/[id]` - Get specific listing
- `PUT /api/listings/[id]` - Update listing
- `POST /api/listings/[id]/approve` - Approve listing
- `POST /api/listings/[id]/reject` - Reject listing with reason

### Audit Trail
- `GET /api/audit` - Get paginated audit logs

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── page.tsx          # Login page
├── components/            # React components
├── contexts/             # React contexts
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   └── database.ts       # Database service
└── types/                # TypeScript definitions
```

## 🔒 Security Features

- JWT-based authentication with HTTP-only cookies
- Protected routes with middleware
- Admin-only access control
- Secure password hashing with bcrypt
- CSRF protection through SameSite cookies

## 🎨 UI/UX Features

- Clean, professional admin interface
- Responsive design for mobile and desktop
- Interactive modals for editing and rejecting listings
- Real-time notifications
- Loading states and error handling
- Accessible components with proper ARIA labels

## 📊 Performance Optimizations

- Server-side rendering for better SEO and performance
- Efficient pagination to handle large datasets
- Optimized re-rendering with React hooks
- Image optimization with Next.js Image component
- Proper error boundaries and loading states

## 🚀 Deployment

The application is ready for deployment on Vercel or any Node.js hosting platform:

1. **Environment Variables**: Update JWT_SECRET for production
2. **Database**: SQLite file will persist data between deployments
3. **Build**: Run `npm run build` for production build

## 🧪 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📝 License

This project is built for educational and assessment purposes.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**

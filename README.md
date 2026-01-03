# Expense Management System

A comprehensive expense management application built with Next.js, MongoDB, and NextAuth.

## Features

### 👤 User Management
- User registration & login (JWT/Auth)
- Role-based access (Admin / User)
- Secure authentication with encrypted passwords

### 🧾 Expense Tracking
- Add, edit, delete expenses
- Categories (Food, Travel, Rent, Office, Entertainment, Healthcare, Shopping, Utilities, Other)
- Date-wise and month-wise expenses
- Search and filter functionality

### 📊 Analytics & Reports
- Monthly & yearly expense summary
- Category-wise expense charts
- Interactive charts using Recharts
- Download reports (PDF / Excel)

### 🔍 Filters & Search
- Filter by date range, category, amount
- Search expenses by keyword

### 💳 Budget Management
- Set monthly budget
- Real-time budget tracking
- Alerts when budget exceeds
- Visual progress indicators

### ☁️ Data Security
- Secure authentication with NextAuth
- Encrypted passwords with bcrypt
- User-specific data isolation
- JWT-based session management

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** MongoDB
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **PDF Generation:** jsPDF
- **Excel Generation:** xlsx
- **Date Handling:** date-fns

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Update the values with your MongoDB connection string and NextAuth secret

```bash
cp .env.local.example .env.local
```

4. Generate a NextAuth secret:
```bash
openssl rand -base64 32
```
Add this to your `.env.local` file as `NEXTAUTH_SECRET`

5. Update `.env.local` with your MongoDB URI:
```env
MONGODB_URI=mongodb://localhost:27017/expense-management
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-management
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.js    # NextAuth configuration
│   │   │   └── register/route.js         # User registration
│   │   ├── expenses/
│   │   │   └── [id]/route.js             # Expense CRUD operations
│   │   ├── budgets/route.js              # Budget management
│   │   ├── analytics/route.js            # Analytics data
│   │   └── reports/route.js              # Report generation
│   ├── dashboard/
│   │   ├── page.js                       # Dashboard home
│   │   ├── expenses/
│   │   │   ├── page.js                   # Expenses list
│   │   │   ├── new/page.js               # Add expense
│   │   │   └── [id]/edit/page.js         # Edit expense
│   │   ├── analytics/
│   │   │   ├── page.js                   # Analytics dashboard
│   │   │   └── reports/page.js           # Reports download
│   │   └── budget/page.js                # Budget management
│   ├── login/page.js                     # Login page
│   ├── register/page.js                  # Registration page
│   └── page.js                           # Landing page
├── components/
│   ├── Layout.js                         # Dashboard layout wrapper
│   ├── Navbar.js                         # Navigation bar
│   └── SessionProvider.js                # NextAuth session provider
└── lib/
    ├── mongodb.js                        # MongoDB connection
    ├── db.js                             # Database helpers
    └── auth.js                           # NextAuth configuration
```

## Usage

1. **Register/Login:** Create a new account or sign in with existing credentials
2. **Add Expenses:** Navigate to Expenses and click "Add Expense"
3. **View Analytics:** Check the Analytics page for visual insights
4. **Set Budget:** Go to Budget page to set monthly spending limits
5. **Download Reports:** Access Reports from the Analytics page to download PDF/Excel files

## Environment Variables

Required environment variables in `.env.local`:

- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB` - Database name (optional, defaults to 'expense-management')
- `NEXTAUTH_URL` - Application URL (default: http://localhost:3000)
- `NEXTAUTH_SECRET` - Secret key for JWT encryption

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT-based authentication
- User-specific data isolation at database level
- Secure session management
- Input validation on API routes

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## License

MIT

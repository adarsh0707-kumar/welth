# Welth 💰

A modern, AI-powered personal finance management application built with Next.js. Welth helps you track expenses, analyze spending patterns, and achieve your financial goals with intelligent insights.

**Live Demo:** [https://welth-c7zv.onrender.com/](https://welth-c7zv.onrender.com/)

![Welth Dashboard](https://via.placeholder.com/1200x600/3B82F6/FFFFFF?text=Welth+-+Smart+Personal+Finance+Management) *<!-- Replace with actual screenshot -->*

## ✨ Features

### 🔐 Authentication & Security
- **Secure Authentication** powered by Clerk
- **Rate Limiting & Protection** with Arcjet
- **Session Management** with secure tokens

### 💸 Financial Management
- **Expense Tracking** with intuitive categorization
- **Income Management** for complete financial picture
- **Transaction History** with advanced filtering
- **Financial Analytics** with Recharts visualizations
- **AI-Powered Insights** using Google Generative AI

### 🎨 User Experience
- **Dark/Light Mode** with next-themes
- **Responsive Design** for all devices
- **Modern UI Components** with Radix UI
- **Real-time Notifications** with Sonner toasts
- **Accessible Design** following WCAG guidelines

### 🔧 Advanced Features
- **Email Integration** with Resend and React Email
- **Background Jobs** with Inngest
- **Database Management** with Prisma ORM
- **Form Handling** with React Hook Form and Zod validation
- **Date Management** with date-fns

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 15.5.5 with Turbopack
- **UI Library:** React 19.1.0
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI, Lucide React
- **Forms:** React Hook Form with Zod validation
- **Charts:** Recharts
- **Notifications:** Sonner

### Backend
- **Runtime:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Clerk
- **AI Integration:** Google Generative AI
- **Email:** Resend with React Email
- **Background Jobs:** Inngest
- **Security:** Arcjet

### Development
- **Build Tool:** Turbopack
- **Linting:** ESLint
- **Styling:** Tailwind CSS 4 with PostCSS

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Clerk account for authentication
- Google AI API key (optional, for AI features)
- Resend account (optional, for email features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/adarsh0707-kumar/welth.git
   cd welth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/welth"

   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Google AI
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key

   # Email
   RESEND_API_KEY=re_...

   # Arcjet
   ARCJET_KEY=aj_key_...

   # Inngest
   INNGEST_SIGNING_KEY=your_signing_key
   INNGEST_EVENT_KEY=your_event_key

   # Next.js
   NEXTAUTH_SECRET=your_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # Seed database (if available)
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run email` - Start email development server

## 📁 Project Structure

```
welth/
├── app/                    # Next.js 15 app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Main application
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Radix UI components
│   ├── forms/            # Form components
│   └── charts/           # Chart components
├── lib/                  # Utility libraries
│   ├── db.ts            # Database configuration
│   ├── utils.ts         # Utility functions
│   └── validations/     # Zod schemas
├── prisma/              # Database schema
│   └── schema.prisma    # Prisma schema
├── emails/              # React Email templates
└── public/              # Static assets
```

## 🔌 API Integration

### Authentication (Clerk)
The application uses Clerk for authentication with pre-built components and secure session management.

### Database (Prisma)
Prisma ORM with PostgreSQL for robust data management with type safety.

### AI Features (Google Generative AI)
- Financial insights and recommendations
- Spending pattern analysis
- Personalized financial advice

### Email (Resend)
- Transaction notifications
- Weekly financial summaries
- Account alerts

## 🎨 UI Components

Built with Radix UI primitives and custom Tailwind CSS classes:

- **Form Components:** Input, Select, Checkbox, Date Picker
- **Feedback Components:** Toast, Progress, Tooltip
- **Navigation Components:** Dropdown, Dialog, Popover
- **Layout Components:** Card, Sheet, Progress

## 📊 Database Schema

Key models include:
- `User` - User profiles and preferences
- `Account` - Bank and financial accounts
- `Transaction` - Income and expense records
- `Category` - Transaction categorization
- `Budget` - Monthly budgeting

## 🔒 Security Features

- **Authentication:** Clerk with secure session management
- **Rate Limiting:** Arcjet for API protection
- **Input Validation:** Zod schemas for all forms
- **CORS Protection:** Next.js built-in security
- **Environment Variables:** Secure credential management

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Render (Current)
The application is currently deployed on Render with automatic deployments from the main branch.

### Environment Variables for Production
Ensure all environment variables are set in your production environment, including database URLs and API keys.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

1. **Prisma Client Generation**
   ```bash
   npx prisma generate
   ```

2. **Database Connection**
   - Verify DATABASE_URL in .env.local
   - Check PostgreSQL is running

3. **Authentication Issues**
   - Verify Clerk keys are correct
   - Check callback URLs in Clerk dashboard

4. **Build Issues**
   ```bash
   npm run build
   # Check for any TypeScript or import errors
   ```

## 📞 Support

- Create an [issue](https://github.com/adarsh0707-kumar/welth/issues) for bugs and feature requests
- Check our [documentation](https://github.com/adarsh0707-kumar/welth/wiki) for detailed guides


## 👨‍💻 Author

Adarsh Kumar

GitHub: [@adarsh0707-kumar](https://github.com/adarsh0707-kumar)

LinkedIn: [@adarsh-kumar-657315251](https://www.linkedin.com/in/adarsh-kumar-657315251/)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Clerk](https://clerk.com/) for authentication
- [Google AI](https://ai.google.dev/) for generative AI capabilities

---

**⭐ If you find this project helpful, please give it a star on GitHub!**


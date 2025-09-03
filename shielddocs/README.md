# ShieldDocs - Secure Document Management

A modern, full-stack document management system with bank-grade security, AI-powered insights, and seamless collaboration features.

## ✨ Features

### 🔐 Security & Authentication
- **Bank-grade encryption** (AES-256) for all documents
- **Multi-factor authentication** with OAuth support (Google, GitHub)
- **Role-based access control** (Admin, Editor, Viewer)
- **GDPR & HIPAA compliant** with comprehensive audit trails

### 📄 Document Management
- **Drag & drop upload** with progress tracking
- **Version control** and real-time collaborative editing
- **Smart search** with AI-powered keyword extraction
- **Document classification** and automatic tagging

### 🤝 Collaboration
- **Real-time sharing** with granular permissions
- **Comment system** and annotation tools
- **Team workspaces** with shared folders
- **Activity feeds** and notifications

### 📊 Analytics & Insights
- **Usage analytics** with interactive charts
- **AI-powered insights** and document recommendations
- **Security monitoring** and risk alerts
- **Storage optimization** suggestions

### 🎨 Modern UI/UX
- **Responsive design** with mobile-first approach
- **Dark mode** support with smooth transitions
- **Neumorphic design** elements for premium feel
- **Accessibility compliant** (WCAG 2.1)

## 🚀 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** + **Zod** for validation
- **Recharts** for data visualization

### Backend
- **FastAPI** (Python) for API
- **PostgreSQL** for database
- **Redis** for caching
- **AWS S3** for file storage
- **OpenAI API** for AI features

### Security
- **JWT** authentication
- **bcrypt** password hashing
- **AES-256** encryption
- **Rate limiting** and CORS protection

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- PostgreSQL 13+
- Redis 6+

### Frontend Setup
```bash
# Navigate to frontend directory
cd shielddocs

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd shielddocs/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

## 🔧 Environment Variables

### Frontend (.env.local)
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
OPENAI_API_KEY=your-openai-api-key
BACKEND_URL=http://localhost:8000
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost/shielddocs
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
```

## 📁 Project Structure

```
shielddocs/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── documents/         # Document management
│   ├── analytics/         # Analytics and insights
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── forms/            # Form components
│   └── charts/            # Chart components
├── lib/                   # Utility functions
├── types/                 # TypeScript types
├── hooks/                 # Custom React hooks
└── backend/               # FastAPI backend
    ├── app/               # Main application
    ├── models/            # Database models
    ├── routes/            # API routes
    └── utils/             # Backend utilities
```

## 🎯 Key Features Implementation

### 1. Authentication & Onboarding
- ✅ Secure login/signup with email + OAuth
- ✅ Role-based access control
- ✅ Smooth onboarding walkthrough

### 2. Core Document Flow
- ✅ Upload, encrypt, and store documents
- ✅ Version control & collaborative editing
- ✅ Quick share with permissions

### 3. Data Insights Dashboard
- ✅ Real-time usage analytics
- ✅ AI-powered insights
- ✅ Interactive charts with Recharts

### 4. Mobile-First Modern UI
- ✅ Responsive design with Tailwind CSS
- ✅ Dark mode & accessibility
- ✅ Neumorphic design elements

### 5. External API Integrations
- ✅ Cloud storage APIs (AWS S3)
- ✅ AI APIs (OpenAI for insights)
- ✅ OAuth providers (Google, GitHub)

## 🔒 Security Features

- **End-to-end encryption** for document storage
- **Secure file upload** with virus scanning
- **Access logging** and audit trails
- **Data retention** policies
- **Compliance reporting** (GDPR, HIPAA)

## 📈 Performance

- **Lazy loading** for large document lists
- **Image optimization** with Next.js
- **Caching** with Redis
- **CDN** integration for global delivery
- **Database indexing** for fast queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@shielddocs.com or join our Slack channel.

---

Built with ❤️ by the ShieldDocs Team

# Vibefy - Product Management Platform

A comprehensive product management platform designed for modern product teams. Built with React, TypeScript, and Supabase, Vibefy provides everything you need to manage products from discovery to delivery.

## 🚀 Features

### 📋 Project Management
- **Kanban Boards**: Visual task management with drag-and-drop functionality
- **Sprint Planning**: Agile sprint management with burndown charts
- **Issue Tracking**: Comprehensive issue lifecycle management
- **Real-time Updates**: Live collaboration with presence indicators

### 📊 Product Analytics
- **Business Value Metrics**: Track and measure product impact
- **Roadmap Health**: Monitor project progress and health indicators
- **OKR Trends**: Visualize objectives and key results over time
- **Performance Dashboards**: Comprehensive analytics and reporting

### 💬 Customer Feedback
- **Centralized Management**: Collect and organize customer feedback
- **Theme Analysis**: Automatic categorization and insights
- **Sentiment Tracking**: Monitor customer satisfaction trends
- **Feedback Integration**: Connect feedback to product decisions

### 🧪 Hypothesis & Experiments
- **Scientific Approach**: Structured hypothesis testing framework
- **Experiment Tracking**: Monitor A/B tests and experiments
- **Data-Driven Decisions**: Evidence-based product development
- **Learning Documentation**: Capture insights and learnings

### 🗺️ Roadmap Planning
- **Visual Roadmaps**: Interactive timeline and quarter views
- **Milestone Tracking**: Monitor progress toward key objectives
- **Resource Planning**: Allocate resources and track dependencies
- **Stakeholder Communication**: Share progress with stakeholders

### 🎯 OKR Management
- **Objectives & Key Results**: Structured goal-setting framework
- **Progress Tracking**: Monitor OKR progress with visual indicators
- **Alignment**: Ensure team alignment with company objectives
- **Performance Reviews**: Regular check-ins and adjustments

### ⚖️ Prioritization Tools
- **RICE Scoring**: Reach, Impact, Confidence, Effort framework
- **Value vs Effort Matrix**: Visual prioritization tool
- **Stakeholder Input**: Collect and weigh stakeholder feedback
- **Data-Driven Decisions**: Use metrics to inform prioritization

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework

### UI Components
- **shadcn/ui**: High-quality component library
- **Radix UI**: Accessible component primitives
- **Recharts**: Data visualization and charts
- **@dnd-kit/core**: Drag and drop functionality

### Backend & Database
- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL**: Robust relational database
- **Row Level Security**: Database-level security
- **Real-time Subscriptions**: Live data updates

### State Management
- **TanStack Query**: Server state management
- **React Context**: Client state management
- **Zustand**: Lightweight state management (where needed)

### Development Tools
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Vitest**: Unit testing framework
- **Testing Library**: Component testing utilities

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**: Required for running the application
- **npm or yarn**: Package manager
- **Supabase account**: For backend services

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vibefy
   ```

2. **Quick Setup (Recommended)**
   ```bash
   # Automated setup with pre-configured development credentials
   npm run setup:dev
   ```
   
   This command will:
   - Install dependencies
   - Create `.env.local` with development credentials
   - Set up the database with sample data
   - Configure everything for local development

3. **Manual Setup (Alternative)**

   **Install dependencies:**
   ```bash
   npm install
   ```

   **Set up environment variables:**
   ```bash
   # For development (pre-configured credentials)
   cp .env.example .env.local
   
   # For production (use your own credentials)
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

   **Set up the database:**
   ```bash
   npm run setup:db        # Creates all tables
   npm run populate:data   # Adds sample data
   ```

4. **Create admin user (Optional)**
   ```bash
   npm run create:admin
   ```
   
   This creates a test admin user with default credentials for local development.

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run setup:dev       # Quick development setup (recommended)

# Testing
npm run test            # Run all tests
npm run test:ui         # Visual test interface
npm run test:run        # Run tests once
npm run test:coverage   # Run tests with coverage

# Database
npm run setup:db        # Set up database schema
npm run populate:data  # Add sample data
npm run create:admin    # Create admin user
npm run verify:setup    # Verify database setup

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # Run TypeScript checks
```

## 🗄️ Database Architecture

The application uses Supabase (PostgreSQL) with a well-structured schema:

### Core Tables
- **`user_profiles`**: User information, roles, and preferences
- **`organizations`**: Company/organization data and settings
- **`projects`**: Project management and metadata
- **`issues`**: Task/issue tracking with full lifecycle support
- **`sprints`**: Sprint management and planning
- **`comments`**: Issue comments and discussions
- **`attachments`**: File attachments and media
- **`notifications`**: User notifications and alerts

### Feature-Specific Tables
- **`okrs`**: Objectives and Key Results
- **`feedback`**: Customer feedback and insights
- **`hypotheses`**: Product hypotheses and experiments
- **`roadmap_items`**: Roadmap planning and milestones
- **`prioritization_scores`**: RICE and prioritization data

### Security Features
- **Row Level Security (RLS)**: Database-level access control
- **Role-based permissions**: Granular permission system
- **Audit trails**: Track changes and user actions
- **Data encryption**: Sensitive data protection

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── shared/         # Shared components across features
│   ├── auth/           # Authentication components
│   ├── board/          # Kanban board components
│   ├── projects/       # Project management components
│   ├── sprints/        # Sprint management components
│   ├── reports/        # Analytics and reporting components
│   ├── roadmap/        # Roadmap planning components
│   ├── okr/            # OKR management components
│   ├── feedback/       # Customer feedback components
│   ├── hypotheses/     # Hypothesis and experiment components
│   ├── notifications/ # Notification components
│   └── prioritization/ # Prioritization tools
├── hooks/              # Custom React hooks
├── contexts/           # React Context providers
├── pages/              # Page components and routing
├── types/              # TypeScript type definitions
├── integrations/       # External service integrations
├── lib/                # Utility functions and helpers
└── test/               # Test utilities and setup
```

## 🔧 Development

### Code Quality Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with custom rules
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for quality checks
- **Conventional Commits**: Standardized commit messages

### Testing Strategy
- **Unit Tests**: Component and hook testing
- **Integration Tests**: Feature workflow testing
- **E2E Tests**: End-to-end user journey testing
- **Coverage**: Minimum 80% test coverage required

### Performance Optimizations
- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo and useMemo usage
- **Virtual Scrolling**: Large list performance
- **Image Optimization**: WebP format and lazy loading

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow
1. **Fork the repository** and create a feature branch
2. **Follow coding standards** (TypeScript, ESLint, Prettier)
3. **Write tests** for new features and bug fixes
4. **Update documentation** as needed
5. **Submit a pull request** with a clear description

### Code Standards
- Use **Conventional Commits** for commit messages
- Maintain **80%+ test coverage**
- Follow **TypeScript strict mode**
- Use **semantic versioning** for releases

### Pull Request Process
- Ensure all tests pass
- Update documentation if needed
- Request review from maintainers
- Address feedback promptly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Charts and visualizations with [Recharts](https://recharts.org/)

---

**Vibefy** - Empowering product teams to build better products through data-driven decisions and collaborative workflows.
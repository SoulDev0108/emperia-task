# Product Management Full-Stack Application

A modern, scalable full-stack application for managing products with real-time data synchronization from external APIs.

## 🚀 Features

### Backend (FastAPI)
- **RESTful API** with comprehensive CRUD operations
- **Async/await** support for high performance
- **PostgreSQL** database with SQLAlchemy ORM
- **External API Integration** with DummyJSON and FakeStore APIs
- **Advanced Filtering & Search** with pagination and sorting
- **Rate Limiting** and security middleware
- **Structured Logging** with JSON formatting
- **CORS Support** for frontend integration
- **Health Checks** and monitoring endpoints
- **Database Migrations** with Alembic

### Frontend (React + TypeScript)
- **Modern UI** with Tailwind CSS and Headless UI
- **Responsive Design** for all device sizes
- **Real-time Search** and filtering
- **Product Grid/List** view toggle
- **Advanced Filters** (category, brand, price, rating)
- **Pagination** with customizable page sizes
- **Product Details** modal with full information
- **Loading States** and error handling
- **Dark/Light Mode** toggle

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   FastAPI       │    │   PostgreSQL    │
│   (React)       │◄──►│   Backend       │◄──►│   Database      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   External      │
                       │   APIs          │
                       │   (DummyJSON,   │
                       │    FakeStore)   │
                       └─────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Relational database
- **Alembic** - Database migration tool
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **Structlog** - Structured logging

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Headless UI** - Accessible components
- **React Query** - Data fetching
- **Vite** - Build tool

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone git@github.com:SoulDev0108/emperia-task.git
cd emperia-task
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp env.example .env
# Edit .env with your database credentials

# Set up database
# Create PostgreSQL database named 'product_db'
# Update DATABASE_URL in .env file

# Run database migrations
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head

# Seed database with sample data
python scripts/seed_database.py

# Start the server
uvicorn app.main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Frontend**: http://localhost:5173

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/product_db
DATABASE_URL_SYNC=postgresql://user:password@localhost:5432/product_db

# Security
SECRET_KEY=your-secret-key-here-change-in-production

# External APIs
DUMMY_API_URL=https://dummyjson.com/products

# CORS
ALLOWED_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

## 📚 API Endpoints

### Products
- `GET /api/v1/products` - List products with filtering
- `POST /api/v1/products` - Create new product
- `GET /api/v1/products/{id}` - Get product by ID
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Delete product

### Utilities
- `GET /api/v1/products/categories/list` - Get all categories
- `GET /api/v1/products/brands/list` - Get all brands
- `GET /api/v1/products/price-range` - Get price range
- `POST /api/v1/products/sync/{source}` - Sync from external API

### Health & Info
- `GET /health` - Health check
- `GET /` - API information

## 🔍 Features in Detail

### Advanced Filtering
- **Category & Brand** filtering
- **Price Range** filtering
- **Rating** filtering
- **Stock Availability** filtering
- **Full-text Search** across title, description, category, and brand

### Sorting Options
- Sort by: id, title, price, rating, stock, created_at, updated_at
- Sort order: ascending or descending

### Pagination
- Configurable page size (1-100 items)
- Page navigation with metadata
- Efficient database queries

### External API Sync
- **DummyJSON API** - Electronics, clothing, and more
- **FakeStore API** - E-commerce products
- Automatic duplicate detection
- Incremental updates

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📦 Deployment

### Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment

1. **Backend**: Deploy to your preferred hosting (Heroku, AWS, etc.)
2. **Frontend**: Build and deploy to static hosting (Vercel, Netlify, etc.)
3. **Database**: Use managed PostgreSQL service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the code examples in the repository

## 🔮 Roadmap

- [ ] User authentication and authorization
- [ ] Shopping cart functionality
- [ ] Order management system
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced caching with Redis
- [ ] WebSocket support for real-time updates
- [ ] Export functionality (CSV, PDF)
- [ ] Bulk operations
- [ ] Image upload and management
- [ ] SEO optimization
- [ ] Performance monitoring
- [ ] Automated testing pipeline
- [ ] CI/CD deployment

---

**Built with ❤️ using FastAPI and React** 
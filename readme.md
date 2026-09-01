# SportMed Shop - Sport Injury Equipment E-commerce

A full-stack e-commerce application for selling sport injury recovery equipment, built with Django REST Framework backend and React frontend.

## Tech Stack

### Backend
- Python 3.12, Django 6.0.2, Django REST Framework 3.16.1
- SQLite3 (development)
- djangorestframework-simplejwt for JWT authentication
- Pillow for image handling

### Frontend
- React 18 with Vite
- React Router for navigation
- Axios for API requests

## Features

### Authentication (OTP-based)
- Phone number registration with OTP verification
- OTP-based login (no password required for login)
- Password reset via OTP
- JWT token authentication for API access

### Products
- Product catalog with categories
- Filter by injury type (knee, ankle, back, neck, shoulder, wrist, elbow, hip)
- Search, filter by price, category, brand, size
- Product images and detailed descriptions
- Stock management

### Shopping Cart
- Add/remove/update items
- Persistent cart for authenticated users

### Orders
- Order creation from cart
- Order history and tracking
- Order cancellation (for pending/confirmed orders)
- Automatic stock management

### Reviews
- Product reviews with ratings
- Verified purchase badge
- One review per product per user

## Repository Layout

```
drfecommerce/
├── drfecommerce/          # Django project settings
│   ├── settings/
│   ├── urls.py
│   └── ...
├── accounts/              # User authentication & OTP
├── products/              # Product catalog
├── cart/                  # Shopping cart
├── orders/                # Order management
├── reviews/               # Product reviews
├── frontend/              # React frontend
│   ├── src/
│   │   ├── api/           # API client & endpoints
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth & Cart contexts
│   │   ├── pages/         # Page components
│   │   └── ...
│   └── ...
├── requirements.txt
└── manage.py
```

## Local Setup

### Backend Setup

```bash
cd drfecommerce
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Open `http://127.0.0.1:8000/`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/otp/send/` | Send OTP to phone number |
| POST | `/api/auth/otp/verify/` | Verify OTP code |
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/password/reset/` | Reset password via OTP |
| GET/PATCH | `/api/auth/profile/` | Get/update user profile |
| POST | `/api/token/refresh/` | Refresh JWT token |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/categories/` | List all categories |
| GET | `/api/products/` | List products (with filters) |
| GET | `/api/products/:slug/` | Product detail |
| GET | `/api/products/featured/` | Featured products |
| GET | `/api/products/injury_types/` | List injury types |

### Query Params for Products
- `?search=<text>` - Search by name, description, brand
- `?category=<slug>` - Filter by category
- `?injury_type=<type>` - Filter by injury type
- `?brand=<brand>` - Filter by brand
- `?size=<size>` - Filter by size
- `?min_price=<price>&max_price=<price>` - Price range
- `?in_stock=true` - Only in-stock items
- `?ordering=<field>` - Sort results

### Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart/` | View cart |
| POST | `/api/cart/add/` | Add item to cart |
| PATCH | `/api/cart/update/` | Update item quantity |
| DELETE | `/api/cart/remove/` | Remove item from cart |
| DELETE | `/api/cart/clear/` | Clear cart |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/` | List user orders |
| POST | `/api/orders/create/` | Create order from cart |
| GET | `/api/orders/:order_number/` | Order detail |
| POST | `/api/orders/:order_number/cancel/` | Cancel order |

### Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/product/:slug/` | List product reviews |
| POST | `/api/reviews/product/:slug/create/` | Create review |
| PATCH | `/api/reviews/:id/update/` | Update review |
| DELETE | `/api/reviews/:id/delete/` | Delete review |

## OTP Authentication Flow

### Registration
1. Send OTP: `POST /api/auth/otp/send/` with `{"phone": "+1234567890", "otp_type": "register"}`
2. Verify OTP: `POST /api/auth/otp/verify/` with `{"phone": "+1234567890", "code": "123456", "otp_type": "register"}`
3. Complete registration: `POST /api/auth/register/` with user details

### Login
1. Send OTP: `POST /api/auth/otp/send/` with `{"phone": "+1234567890", "otp_type": "login"}`
2. Verify OTP: `POST /api/auth/otp/verify/` with `{"phone": "+1234567890", "code": "123456", "otp_type": "login"}`
3. Returns JWT tokens on successful verification

### Password Reset
1. Send OTP: `POST /api/auth/otp/send/` with `{"phone": "+1234567890", "otp_type": "reset_password"}`
2. Reset password: `POST /api/auth/password/reset/` with phone, code, and new password

## Running Tests

```bash
cd drfecommerce
pytest
```

Tests cover:
- OTP authentication (send, verify, register, login)
- Product listing, filtering, and search
- Cart operations (add, update, remove, clear)
- Order creation and cancellation
- Review creation and listing

## Models

### User (accounts)
- Custom user model with phone as username
- OTP codes for verification

### Product (products)
- Categories for organization
- Products with injury type classification
- Multiple images per product

### Cart (cart)
- One cart per user
- Cart items with quantity

### Order (orders)
- Order with shipping details
- Order items (snapshot of product at time of purchase)
- Status tracking

### Review (reviews)
- User reviews with ratings
- Verified purchase tracking

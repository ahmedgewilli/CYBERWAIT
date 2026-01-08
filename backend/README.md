# CyberWait Backend API

This is the backend server for the CyberWait restaurant ordering system.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up PostgreSQL Database

1. Install PostgreSQL if you haven't already: https://www.postgresql.org/download/

2. Create a new database:
```bash
createdb cyberwait
```

Or using PostgreSQL command line:
```sql
CREATE DATABASE cyberwait;
```

3. Run the SQL migration file to create tables and insert sample data:
```bash
psql -U postgres -d cyberwait -f database.sql
```

Or manually copy and paste the SQL from `database.sql` into your PostgreSQL client.

### 3. Configure Environment Variables

Create a `.env` file in the `backend` folder:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=cyberwait
DB_PASSWORD=your_postgres_password
DB_PORT=5432
PORT=5000
```

Replace `your_postgres_password` with your actual PostgreSQL password.

### 4. Start the Server

For development (with auto-reload):
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Menu
- `GET /api/menu` - Get all menu items

### Orders
- `POST /api/orders` - Create a new order
  ```json
  {
    "cart": [...],
    "paymentMethod": "visa",
    "total": 45.50
  }
  ```
- `GET /api/orders/:id` - Get order by ID

### Tracking
- `GET /api/tracking/:id/status` - Get order status
- `PUT /api/tracking/:id/status` - Update order status
  ```json
  {
    "status": "preparing"
  }
  ```

## Database Schema

- **menu_items**: Stores menu items (id, name, category, price, description, image)
- **orders**: Stores order information (id, order_number, total, payment_method, card_last4, card_expiry, status, created_at)
- **order_items**: Stores individual items in each order (id, order_id, menu_item_id, quantity, price)


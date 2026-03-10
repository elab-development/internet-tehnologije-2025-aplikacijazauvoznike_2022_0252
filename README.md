# Importers App

Importers App is a web application developed as part of the **Internet Technologies** course.  
The application enables management of product offers and collaborations between **importers** and **suppliers**, as well as system administration.

The system supports three types of users:

- **ADMIN** – management of users and collaborations
- **IMPORTER** – viewing and comparing product offers, managing containers
- **SUPPLIER** – managing product offers

## Main Features

- user registration and login
- product offer management
- product category management
- container management
- product comparison
- administration of users and collaborations
- current time display
- price conversion into different currencies

The API is documented using **Swagger (OpenAPI)** documentation.

---

# Technologies

The application was developed using the following technologies:

- **Next.js**
- **React**
- **TypeScript**
- **PostgreSQL**
- **Drizzle ORM**
- **Swagger / OpenAPI**
- **Docker**
- **Docker Compose**

External API services used:

- **TimeAPI** – retrieving the current time
- **ExchangeRate API** – currency exchange rates

---

# Project Structure

```
app/
├── admin
├── api
│   ├── admin
│   ├── auth
│   ├── categories
│   ├── containerItems
│   ├── exchange
│   ├── importer
│   ├── supplier
│   ├── swagger
│   └── time
├── api-docs
├── dashboard
├── importer
├── login
├── register
├── supplier

components/
db/
lib/
middleware.ts
```

- **app/** – Next.js pages and API routes  
- **api/** – backend API endpoints implemented with Next.js route handlers  
- **api-docs/** – Swagger UI documentation page  
- **components/** – reusable React components  
- **db/** – database schema, migrations and configuration (Drizzle ORM)  
- **lib/** – helper utilities (authentication)  
- **middleware.ts** – authentication middleware and request handling  

---

# Running the Application Locally

### 1. Clone the repository

```bash
git clone https://github.com/elab-development/internet-tehnologije-2025-aplikacijazauvoznike_2022_0252.git
cd internet-tehnologije-2025-aplikacijazauvoznike_2022_0252
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

Create a `.env` file in the root directory using the following example:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/iteh
API_URL=http://localhost:3000
JWT_SECRET=arsa
JWT_EXPIRES=7d
```

### 4. Start PostgreSQL

Run a PostgreSQL container:

```bash
docker run --name importers-postgres \
-e POSTGRES_USER=postgres \
-e POSTGRES_PASSWORD=postgres \
-e POSTGRES_DB=iteh \
-p 5432:5432 \
-v importers_pgdata:/var/lib/postgresql/data \
-d postgres:17
```

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. Seed the database

```bash
npm run db:seed
```

### 7. Start the development server

```bash
npm run dev
```

### 8. Open the application

Application:

```
http://localhost:3000
```

Swagger API documentation:

```
http://localhost:3000/api-docs
```

OpenAPI JSON specification:

```
http://localhost:3000/api/swagger
```

---

# Running with Docker

The application can also be started using **Docker and Docker Compose**.

### 1. Create a `.env` file

Use the following configuration:

```env
DATABASE_URL=postgres://postgres:postgres@db:5432/iteh
API_URL=http://localhost:3000
JWT_SECRET=arsa
JWT_EXPIRES=7d
```

### 2. Start the containers

```bash
docker compose up --build
```

This command starts the following services:

- **app** – Next.js application  
- **db** – PostgreSQL database  

### 3. Run database migrations

```bash
docker compose exec app npm run db:migrate
```

### 4. Seed the database

```bash
docker compose exec app npm run db:seed
```

### 5. Open the application

```
http://localhost:3000
```

Swagger documentation:

```
http://localhost:3000/api-docs
```

### 6. Stop the containers

```bash
docker compose down
```

---

# API Documentation

The API is documented using **Swagger (OpenAPI)**.

Swagger UI:

```
http://localhost:3000/api-docs
```

OpenAPI JSON:

```
http://localhost:3000/api/swagger
```

Swagger allows developers to view all API endpoints, their parameters and responses, and test API requests directly from the browser.
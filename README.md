# Medical Appointment API 🏥

A secure, containerized RESTful API built to manage doctors, patients, and scheduling for a medical clinic. This project demonstrates backend architecture best practices, including relational data modeling, cryptographic password hashing, and stateless authentication.

## 🚀 Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL
* **ORM:** Prisma (v7)
* **Authentication:** JSON Web Tokens (JWT) & Bcryptjs
* **Infrastructure:** Docker & Docker Compose

## ✨ Key Features

* **Containerized Environment:** Fully dockerized API and PostgreSQL database for instant, reproducible local development without installing local dependencies.
* **Secure Authentication:** End-to-end credential protection using `bcryptjs` for salt/hashing passwords and stateless `JWT` middleware to protect sensitive routes.
* **Relational Data Modeling:** Complex SQL joins handled efficiently via Prisma ORM, linking Doctors, Patients, and Appointments with strict referential integrity.
* **Database Seeding:** Automated data seeding script to instantly populate the database with mock clinics, users, and schedules.

## 🛠️ Local Setup & Installation

**Prerequisites:** Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your machine.

**1. Clone the repository**
```bash
git clone https://github.com/churroxd8/medical-appointment-api.git
cd medical-appointment-api
```

**2. Spin up the containers**
```bash
docker-compose up -d
```

**3. Run database migrations**
Apply the Prisma v7 schema to your running PostgreSQL container:
```bash
docker exec -it medical_api npx prisma migrate dev
```

**4. Seed the database**
Populate the database with the initial test data (including Dr. Doe):
```bash
docker exec -it medical_api node seed.js
```

## 📖 API Reference

### Auth

* **POST** `/api/login`
    * **Body:** `{ "email": "jane.doe@example.com", "password": "SecurePassword123!" }`
    * **Description:** Authenticates a doctor and returns a JWT access token.

### Doctors

* **GET** `/api/doctors/:id/appointments`
    * **Headers:** `Authorization: Bearer <your_jwt_token>`
    * **Description:** Protected route. Returns the logged-in doctor's profile along with a chronologically sorted list of their upcoming appointments and associated patient details.
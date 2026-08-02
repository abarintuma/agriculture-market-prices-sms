 Agri-Market SMS

Agri-Market SMS is a full-stack application that enables agricultural market prices monitoring and SMS updates for farmers. The system combines a FastAPI backend, a Next.js dashboard, PostgreSQL persistence, live weather integration, and Twilio SMS delivery.

 Key Features

- Register farmers and manage recipient directories
- Record and display daily market prices for monitored crops
- Fetch live weather summaries for SMS broadcasts
- Send market price + weather alerts via Twilio SMS
- Deploy locally with Docker Compose for frontend, backend, and PostgreSQL

 Architecture

- backend — FastAPI application providing REST endpoints, database models, SMS broadcast logic, and weather integration
- frontend — Next.js app with dashboard pages for farmers, prices, and SMS broadcasts
- docker-compose.yml — Compose stack for PostgreSQL, backend, and frontend services

 Technology Stack

- Backend: Python 3.14, FastAPI, SQLAlchemy, Pydantic, Twilio, Uvicorn
- Frontend: Next.js, TypeScript, Tailwind CSS
- Database: PostgreSQL 16
- Deployment: Docker, Docker Compose

 Getting Started

 Clone the repository

git clone https://github.com/abarintuma/agri-market-sms.git
cd agri-market-sms

 Environment Variables

Create a .env file at the repository root with the following values:

env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=agri_market_sms
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
OPENWEATHER_API_KEY=your_openweather_api_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=twilio_phone_number


Note: The backend uses DATABASE_URL for the PostgreSQL connection string. The frontend uses NEXT_PUBLIC_API_URL during Docker builds.

Run with Docker Compose

bash
docker-compose up --build


- Backend API: http://localhost:8000
- Backend docs: http://localhost:8000/docs
- Frontend dashboard: http://localhost:3000

Development

 Backend

cd backend
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install uv
uv pip install --system -r pyproject.toml
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000


 Frontend

cd frontend
npm install
npm run dev


 API Overview

 Farmers

- POST /api/v1/farmers/ — Register a new farmer
- GET /api/v1/farmers/ — Retrieve registered farmers

 Prices

- POST /api/v1/prices/ — Record a new crop price
- GET /api/v1/prices/latest — Get latest market prices

 SMS

- POST /api/v1/sms/broadcast — Send a broadcast SMS to active farmers

 Frontend Pages

- / — Dashboard overview with farmer count, prices, and broadcast controls
- /farmers — Farmer directory and registration form
- /prices — Crop and market price management
- /sms — SMS broadcast composer and history view

 Notes

- SMS delivery uses Twilio. Configure a valid Twilio phone number and credentials.
- Weather summaries use OpenWeatherMap and default to Kampala, Uganda.
- The project ships with a Docker-based PostgreSQL service exposed on port 5433.

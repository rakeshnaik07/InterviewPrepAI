# InterviewPrep AI

An AI-powered interview preparation tool. Paste a job description (and optionally a resume + short self-description), and get back a personalized report: a match score against the role, 15 technical and 15 behavioral interview questions with guidance on how to answer them, identified skill gaps, and a day-by-day 7-day preparation plan — plus a tailored resume PDF you can download.

## How it works

1. Submit a job description, an optional self-description, and an optional resume (PDF).
2. The backend extracts text from the resume, sends everything to Gemini with a structured output schema, and generates a full interview report.
3. The report is saved and shown on a dedicated page — questions, skill gaps, and the prep plan, with a button to generate and download a tailored resume PDF for that specific job.
4. Past reports are listed on a dashboard for later reference.

## Tech stack

**Frontend:** React (Vite), Tailwind CSS, React Router, Axios
**Backend:** Node.js, Express 5, MongoDB (Mongoose)
**AI:** Google Gemini (`@google/genai`), Zod for structured output validation, automatic retry across models on transient failures
**PDF handling:** `pdf-parse` for resume text extraction, Puppeteer for resume PDF generation
**Auth:** JWT stored in httpOnly cookies

## Key design decisions

- **Authentication** uses httpOnly cookies rather than tokens in localStorage — the frontend never reads the token directly; it calls a `get-me` endpoint to determine auth state on load.
- **Report generation is a single blocking request.** Generating a report involves two AI calls (questions, and report metadata) run concurrently to reduce wait time, with automatic retry and model fallback if either call fails or returns malformed data. The request can take up to a minute on a cold or retried attempt — the UI reflects this with a full-screen loading state rather than a background "pending" status, since no partial report is ever persisted.
- **Schema-validated AI output.** Every AI response is validated against a strict schema before being saved; malformed responses (e.g. a wrong data shape from the model) trigger a retry rather than silently saving incomplete data.

## Project structure

```
InterviewPrepAI/
  Backend/
    src/
      controllers/
      models/
      routes/
      middlewares/
      services/        # AI generation logic
      config/
    server.js
  Frontend/
    src/
      features/
        auth/
        interview/
      api/
      routes/
      components/
```

## Running locally

**Backend**
```
cd Backend
npm install
```
Create a `.env` file in `Backend/`:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_gemini_api_key
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
PORT=3000
```
```
npm run dev
```

**Frontend**
```
cd Frontend
npm install
```
Create a `.env` file in `Frontend/`:
```
VITE_API_BASE_URL=http://localhost:3000
```
```
npm run dev
```

## API overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out, blacklist the token |
| GET | `/api/auth/get-me` | Get the current logged-in user |
| POST | `/api/interview/` | Generate a new interview report (multipart: job description, self description, optional resume PDF) |
| GET | `/api/interview/` | List all reports for the logged-in user |
| GET | `/api/interview/report/:interviewId` | Get a single report by ID |
| POST | `/api/interview/resume/pdf/:interviewReportId` | Generate and download a tailored resume PDF for a report |

## Status

Actively built and deployed as a personal project. Frontend and backend logic, including authentication and the data-fetching layer, were built and reviewed line-by-line as a learning exercise; UI styling was AI-assisted.

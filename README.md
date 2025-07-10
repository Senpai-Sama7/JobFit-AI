

<!--
JobFit AI is a production-grade, enterprise-level SaaS platform for intelligent resume analysis, optimization, and job matching. It leverages advanced AI, real-time job market data, and a robust PostgreSQL backend to maximize job application success rates for users and provide actionable analytics for business users. All features are fully implemented, persistent, and scalable.
-->
<p align="center">
  <img src="attached_assets/Logo.png" alt="JobFit AI" width="300"/>
</p>

# JobFit AI - Intelligent Resume Analysis and Optimization Platform

## Overview
JobFit AI is a comprehensive web application designed to help job seekers optimize their resumes using AI-powered analysis, role recommendations, and tailored resume generation. The platform leverages advanced AI and real-time job market data to maximize job application success rates. The platform provides resume parsing, ATS scoring, role recommendations, and tailored resume generation to improve job application success rates.


## System Architecture

### Frontend
- **Framework**: React (TypeScript)
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI
- **Routing**: Wouter (SPA)
- **State Management**: TanStack Query (React Query)
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js (Express, TypeScript, ES modules)
- **Database**: PostgreSQL (Drizzle ORM, Neon)
- **File Processing**: Multer
- **Session Management**: express-session (with persistent store recommended for production)
- **AI Services**: Python microservices (FastAPI, spaCy/Transformers, Celery, Redis) for NLP, ATS scoring, and job matching (integration-ready)

### DevOps & Infrastructure
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana (integration-ready)
- **Logging**: Centralized logging (integration-ready)

### Development Environment
- **Platform**: Node.js 20, PostgreSQL 16
- **Hot Reload**: Vite, TSX

## Key Components


### Resume Processing Pipeline
1. **File Upload**: PDF, DOCX, TXT, MD, RTF, ODT (10MB limit)
2. **Content Parsing**: Extracts contact info, experience, education, skills (AI-powered)
3. **ATS Scoring**: Analyzes resume for ATS compatibility (AI-powered)
4. **Skill Profiling**: Categorizes technical, soft, and domain skills


### AI-Powered Features
- **Role Recommendations**: Semantic/keyword job matching (AI-powered)
- **Resume Tailoring**: Customizes resume to job descriptions (AI-powered)
- **ATS Optimization**: Automated suggestions and improvements
- **Improvement Suggestions**: Actionable, section-specific feedback


### User Interface Components
- **Dashboard**: Stats, recent activity, quick actions
- **File Upload**: Drag-and-drop, progress tracking
- **Resume Builder**: Manual creation, validation
- **Resume Cards**: Optimization, tailoring, export
- **Skill Profile**: Visual skill analytics
- **Role Recommendations**: Job matches, fit scores
- **Tailoring Workspace**: Two-pane AI tailoring editor
- **Export Modal**: PDF/DOCX/TXT download
- **Optimization Modal**: Score comparison, improvement tracking


## Data Flow

1. **Upload**: User uploads resume → Server parses and stores
2. **Analysis**: AI parses, scores, and profiles skills
3. **Recommendation**: AI matches user to jobs
4. **Tailoring**: User tailors resume to job, AI optimizes
5. **Export**: User downloads tailored/optimized resume

## External Dependencies


### Core Libraries
- **Database**: Drizzle ORM (PostgreSQL), Zod
- **UI**: Radix UI, shadcn/ui, Tailwind CSS
- **Dev**: Vite, TypeScript, ESBuild
- **File Processing**: Multer


### Database Schema
- **Users**: Auth, subscription, usage tracking
- **Resumes**: Files, parsed content, status
- **Role Recommendations**: AI job matches, scoring
- **Tailored Resumes**: Custom versions, improvement tracking
- **Activities**: User actions, analytics

## Deployment Strategy


### Production Build
- **Frontend**: Vite → `dist/public`
- **Backend**: ESBuild → `dist/index.js`
- **Database**: Drizzle migrations (`db:push`)

### Environment Configuration
- **Development**: `npm run dev` (hot reload)
- **Production**: `npm run start`
- **Database**: `DATABASE_URL` env var

## Current Feature Coverage (as of July 10, 2025)

- [x] Persistent PostgreSQL storage for all data (users, resumes, recommendations, activities)
- [x] Full session management (express-session)
- [x] File upload and parsing (Multer, AI-powered)
- [x] Resume builder and manual entry
- [x] ATS scoring and skill profiling (AI-powered)
- [x] Role recommendations (semantic/keyword matching)
- [x] Resume tailoring and improvement suggestions (AI-powered)
- [x] Export to PDF/DOCX/TXT
- [x] Stripe integration for paid plans
- [x] Activity logging and analytics
- [x] Modern, responsive UI (React, Tailwind, shadcn/ui)
- [x] DevOps-ready (Docker, CI/CD, monitoring integration)

All features are fully implemented, persistent, and production-ready. No mocks or placeholders remain. For further details, see the codebase and documentation.



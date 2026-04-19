# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Goat farm management system (Quản Lý Đàn Dê) — a full-stack app to track goats, their status, weight, lineage, and action history.

## Architecture

Two-tier application:

- **`goat/`** — Java 21 + Spring Boot 4.x REST API on port 8080, backed by local MongoDB (`mongodb+srv://hoang:%40Hoang17102003@cluster0.t6ogryb.mongodb.net/goat?appName=Cluster0`)
- **`goat-ui/`** — React 19 + TypeScript + Vite frontend on port 5173, communicating with the backend via `goat-ui/src/api.ts`

### Backend structure (`com.farm.goat`)

| Package       | Role                                                            |
| ------------- | --------------------------------------------------------------- |
| `controller/` | REST endpoints (GoatController)                                 |
| `service/`    | Business logic (GoatService)                                    |
| `model/`      | MongoDB documents (Goat, GoatLog)                               |
| `repository/` | Spring Data MongoDB repositories                                |
| `dto/`        | Request body DTOs (Create, Sell, Dead, Slaughter, UpdateWeight) |
| `config/`     | CORS configuration                                              |

### Frontend structure (`goat-ui/src/`)

| File/Dir   | Role                                           |
| ---------- | ---------------------------------------------- |
| `App.tsx`  | Router with 3 routes: `/`, `/new`, `/goat/:id` |
| `pages/`   | GoatListPage, GoatFormPage, GoatDetailPage     |
| `api.ts`   | All fetch calls to the backend                 |
| `types.ts` | TypeScript interfaces and label mappings       |

## Commands

### Backend

```bash
cd goat
./gradlew bootRun     # start dev server (port 8080)
./gradlew build       # build JAR
./gradlew test        # run tests
```

### Frontend

```bash
cd goat-ui
npm run dev       # start Vite dev server (port 5173)
npm run build     # production build
npm run lint      # ESLint check
npm run preview   # preview production build
```

## Docker

Docker Hub username: `trankimhoang00246`
Images: `trankimhoang00246/goat-be` (backend), `trankimhoang00246/goat-ui` (frontend)

### Build & push images

```bash
# Backend
cd goat
docker build -t trankimhoang00246/goat-be:latest .
docker push trankimhoang00246/goat-be:latest

# Frontend
cd goat-ui
docker build -t trankimhoang00246/goat-ui:latest .
docker push trankimhoang00246/goat-ui:latest
```

### Run with Docker Compose

```bash
# Pull latest images and start (from project root)
docker compose up -d

# Stop
docker compose down
```

Frontend: http://localhost:8742
Backend: http://localhost:8743

> Nginx trong frontend container proxy `/api` sang `backend:8080` nên không cần expose backend ra ngoài để frontend gọi.

## run 
```bash
./deploy.sh
```

## Key Domain Concepts

- Each goat has a unique **code** (mã số), but **code is reusable across goats** — the same code can be assigned to a new goat after the previous one with that code is no longer alive (SOLD/DEAD/SLAUGHTERED)
- All inter-goat references (e.g. fatherId, motherId) must use the MongoDB **`_id`** field, never the code
- Goat types: Male (Đực) / Female (Cái), with subtypes Buôn (trading) / Giống (breeding)
- Goat lifecycle actions: **UpdateWeight**, **Sell**, **Dead**, **Slaughter** — each logged in GoatLog
- Goats can be created standalone or linked to parent goats (birth registration)
- **Capital** (vốn) is tracked per goat

## Notes

- No CSS framework — all styling is inline
- MongoDB runs locally with no authentication
- Frontend proxies API calls to `http://localhost:8080` (configured in `api.ts`)

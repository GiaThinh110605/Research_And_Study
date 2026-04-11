# UniStudy Engineering Standards (Senior Level)

This document outlines the coding standards and architectural rules for the UniStudy project. All developers (human or AI) must adhere to these guidelines to maintain a high-quality codebase.

---

## 🏗 Architecture

### Frontend (React + TypeScript)
- **Directory Structure**:
  - `src/components`: UI components. Sub-divide into `layout/`, `common/`, and feature folders.
  - `src/pages`: Top-level page components. Should focus on data fetching and layout composition.
  - `src/services`: API calls and external integrations (e.g., `auth.ts`).
- **State Management**: Use React Hooks. Avoid excessive prop drilling.
- **Styling**: Tailwind CSS. Respect the design system (Rounded: 2xl/3xl, Primary: #3B66F5).

### Backend (FastAPI + Python)
- **Directory Structure**:
  - `app/api`: Route handlers grouped by version/module.
  - `app/models`: Database engine-specific models (SQLAlchemy).
  - `app/schemas`: Pydantic models for data validation.
  - `app/core`: Configuration, security, and shared utilities.
  - `app/middleware`: Global request/response handlers.
- **Dependency Injection**: Use FastAPI `Depends()` for services like authentication and DB sessions.

---

## 🛠 Coding Best Practices

### 1. Naming Conventions
- **Variable/Functions**: `camelCase` for JS/TS, `snake_case` for Python.
- **Classes/Components**: `PascalCase`.
- **Files**: `PascalCase.tsx` for React components, `snake_case.py` for Python modules.

### 2. Typing & Safety
- **Typescript**: No `any`. Use interfaces for objects and props.
- **Python**: Use type hints (e.g., `def get_user(id: int) -> User:`) and Pydantic for run-time validation.

### 3. Error Handling
- **Frontend**: Use Try-Catch for API calls, show user-friendly error notifications (though minimal placeholders are acceptable in initial stages).
- **Backend**: Raise `HTTPException` with clear detail messages and correct status codes.

---

## 🔒 Security
- **Authentication**: All protected routes must use the `AuthMiddleware` or appropriate FastAPI dependency.
- **CORS**: Must be configured as the outermost middleware to ensure headers are present even on error responses.
- **Environment**: Sensitive data (keys, secrets) MUST stay in `.env` and never be committed.

---

## 🚀 Git & CI/CD
- **Branching**: `main` is protected. Use feature branches (e.g., `feat/`, `fix/`).
- **Commits**: `type: description` format (e.g., `feat: implement lecturer tests view`).
- **Tests**: Run `pytest` and `npm test` before pushing significant changes.

---

## 🎨 UI/UX Excellence
- **Design Language**: Premium, academic, clean.
- **Interactivity**: Use hover effects, smooth transitions, and Loading states.
- **Responsiveness**: Ensure layouts work on major screen sizes.

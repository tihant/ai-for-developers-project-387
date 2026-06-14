FROM node:22-alpine AS build
WORKDIR /app

COPY backend/package*.json backend/
RUN cd backend && npm ci

COPY frontend/package*.json frontend/
RUN cd frontend && npm ci

COPY backend/ backend/
RUN cd backend && npx tsc

COPY frontend/ frontend/
RUN cd frontend && VITE_API_URL=/ npx vite build

FROM node:22-alpine
WORKDIR /app

COPY backend/package*.json backend/
RUN cd backend && npm ci --omit=dev

COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/frontend/dist ./frontend/dist

ENV PORT=4010
EXPOSE ${PORT}

CMD ["node", "backend/dist/index.js"]

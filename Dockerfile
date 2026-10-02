FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY codigo/frontend/package*.json ./
RUN npm install
COPY codigo/frontend/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=frontend-builder /app/frontend/dist ./codigo/frontend/dist

EXPOSE 8000

CMD ["sh", "-c", "python -m uvicorn codigo.backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

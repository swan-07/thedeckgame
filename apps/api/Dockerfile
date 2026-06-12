FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Copy the whole app first: building the package needs the `app/` source tree
# present, so pyproject.toml alone is not enough.
COPY . .
RUN pip install --no-cache-dir .

EXPOSE 8000

# Run migrations, then start the server. $PORT is provided by the host (Render).
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

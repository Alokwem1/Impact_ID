###############################
# 🐍 Base Builder Stage
###############################
FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1 \
	PIP_NO_CACHE_DIR=1 \
	PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# System deps (add gcc/libpq-dev if compiling psycopg extras later)
RUN apt-get update && apt-get install -y --no-install-recommends \
	curl ca-certificates bash tini \
	&& rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --user -r requirements.txt

###############################
# 🏁 Final Runtime Stage
###############################
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1 \
	PATH="/root/.local/bin:$PATH" \
	APP_HOME=/app

WORKDIR $APP_HOME

# Add non-root user
RUN useradd -u 1001 -m impact && mkdir -p $APP_HOME && chown -R impact:impact $APP_HOME

# Copy installed site-packages & project
COPY --from=builder /root/.local /root/.local
COPY . .

# Create logs directory (non-fatal if absent) and set permissions
RUN mkdir -p logs && chown -R impact:impact logs

EXPOSE 8000
USER impact

# Optional: healthcheck can be added by docker-compose to keep Dockerfile generic

ENTRYPOINT ["tini", "--"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
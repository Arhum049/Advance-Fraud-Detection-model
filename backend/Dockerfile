# Use official Python slim image
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first to leverage Docker layer caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code
COPY . .

# Expose the default port 8000
EXPOSE 8080

# Start the uvicorn server.
# Binds to 0.0.0.0 to be accessible outside the container.
# Uses the PORT environment variable if provided, otherwise defaults to 8000.
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8080}"]

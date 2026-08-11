# IVTS Backend Technology Stack Summary

This document summarizes the core technologies, tools, and libraries utilized in the IVTS backend ecosystem, based on the `docker-compose.yml` and Node.js `package.json` configurations.

## 1. Infrastructure & Containerization
- **Docker & Docker Compose**: The entire system is containerized and orchestrated using Docker Compose. It manages the lifecycle of the databases, backend services, frontend, mobile web build, and media server.
- **MediaMTX**: A ready-to-use, real-time media server and proxy used for handling CCTV streams. It supports WebRTC, HLS, RTSP, and RTMP protocols.

## 2. Databases & Caching
- **MongoDB**: The primary NoSQL database used for storing core application data (users, vehicles, requests, emergency reports).
- **PostgreSQL (with pgvector)**: A relational database primarily used by the AI-tracking module. The `pgvector` extension indicates it handles vector embeddings or complex spatial data.
- **Redis**: An in-memory data structure store used for caching, session management, and real-time pub/sub messaging (often paired with Socket.io).

## 3. Backend Runtime & Frameworks
- **Node.js**: The JavaScript runtime environment powering the backend application.
- **Express.js**: The web application framework used to build and route the RESTful API endpoints.
- **Socket.io**: Enables real-time, bidirectional, event-based communication between the server and web/mobile clients.

## 4. Data Access & Modeling
- **Mongoose**: An elegant MongoDB object modeling tool (ODM) that provides schema validation, querying, and business logic hooks.
- **pg**: A non-blocking PostgreSQL client for Node.js.

## 5. Security & Authentication
- **JSON Web Token (JWT)**: Used for stateless authentication and securing API endpoints.
- **Google Auth Library**: Used to integrate Google OAuth2 authentication as a fallback or alternative login method.
- **Cors & Express Rate Limit**: Middleware for securing cross-origin requests and protecting the API against brute-force/DDoS attacks.

## 6. Media & File Processing
- **FFmpeg (`fluent-ffmpeg`, `@ffmpeg-installer/ffmpeg`)**: A powerful multimedia framework used to record, convert, and stream audio and video (likely interacting with CCTV streams).
- **Multer**: Middleware used for handling `multipart/form-data`, which is necessary for parsing file uploads (e.g., identity documents, vehicle images).

## 7. Utility & Operations
- **Axios**: A promise-based HTTP client used for server-to-server communication (e.g., bridging requests to the Python AI tracking service).
- **Winston & Winston-MongoDB**: A versatile logging library configured to output logs to both the console and the MongoDB database for persistence and auditing.
- **Nodemailer**: A module for sending email notifications directly from the Node.js application.
- **Swagger UI Express**: Used to serve auto-generated API documentation visually in the browser.
- **js-yaml**: Used for parsing YAML configuration files (e.g., camera and route segment configurations).

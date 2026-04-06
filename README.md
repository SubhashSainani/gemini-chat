# 🚀 NexusAI Cloud Architecture

NexusAI is a full-stack, multimodal generative AI chat application engineered for real-time performance and absolute security. By harnessing Google's Gemini Vision API and leveraging a reactive Spring Boot backend, the platform streams AI responses instantly while gracefully handling file analyses, dynamic session routing, and rigorous load management. 

It is containerized entirely with Docker and orchestrated securely across a robust AWS free-tier cloud ecosystem utilizing GitHub Actions CI/CD to facilitate zero-touch deployments.

![NexusAI App Interface](screenshots/app_ui_demo.png) *(Note: Please add a screenshot of the main chat UI here)*

---

## 🛠️ Technology Stack
- **Frontend:** React, Vite, Bootstrap, Markdown Rendering (Syntax Highlighting)
- **Backend:** Java 17, Spring Boot 3, Spring WebFlux, Spring Security, JWT (Auth0)
- **Database:** PostgreSQL (Spring Data JPA)
- **Resilience:** Resilience4j (Rate Limiting), Global Exception Handling
- **DevOps & Cloud:** Docker, GitHub Actions, AWS EC2 (Dockerized Runtime), AWS RDS (Postgres), AWS S3 (Static React Hosting), AWS CloudFront (CDN & API Reverse Proxy), AWS ECR, AWS IAM.

![AWS Architecture Diagram](screenshots/aws_architecture.png) *(Note: Optionally add an architecture block diagram or a screenshot of your GitHub Actions deploying successfully)*

---

## 🔥 Key Features
- **Server-Sent Events (SSE) Streaming:** Utilizes a highly optimized line-buffer parsing algorithm to stream `text/event-stream` payloads without TCP fragmentation or Markdown corruption.
- **Multimodal Context AI:** Full drag-and-drop support for file and image payloads instantly converted to Base64 buffers.
- **Stateless Authentication:** Spring Security intercept pipeline executing JWT cryptographic verification natively blocking unauthorized REST access globally.
- **Reverse Proxy CDN Mapping:** Leverages AWS CloudFront custom origin paths (`/api/*`) to bypass complex Mixed-Content security locks and securely proxy the EC2 Bare-Metal containers over a unified SSL certificate.
- **Microservice Containerization:** Fully abstracted Dockerfile decoupling the Java compiler stage from the runtime architecture to minimize AWS deployment footprint.

---

## 💻 Local Development Setup

### 1. Backend (Spring Boot)
Ensure you have Java 17+ and Maven installed.
```bash
cd Backend
# Add your local variables to application.properties
mvn clean install
mvn spring-boot:run
```

### 2. Frontend (React)
Ensure Node.js is installed.
```bash
cd Frontend/gemini-chat-frontend
npm install
# Set VITE_API_URL=http://localhost:8080 in a local .env file
npm run dev
```

---

## ☁️ AWS Cloud Production Deployment
The production environment of this repository relies natively on AWS Elastic Container Registry (ECR). The entire platform relies on the following automated CI/CD steps governed by `.github/workflows`:
1. Commits to the `main` branch trigger React `vite build`.
2. Static bundles are pipelined directly to an AWS S3 Bucket, instantly invalidating the CloudFront edge caches.
3. The Java framework is packaged exclusively through Docker's multi-stage builds.
4. The backend image is pushed to AWS ECR, where a target AWS EC2 instance pulls the runtime natively over port 80 via dynamic IAM Role policies!

![CloudFront Behavior Configuration](screenshots/cloudfront_setup.png) *(Note: Take a screenshot of your CloudFront Origins / Behaviors screen)*

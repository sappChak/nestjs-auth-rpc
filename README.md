# NestJS REST API Gateway + RabbitMQ RPC Microservices

This project is a monorepo containing a REST API gateway with RPC back-end microservices, all written using the NestJS Framework and TypeScript. It is designed to demonstrate a microservices architecture using RabbitMQ for inter-service communication and PostgreSQL for data persistence.

## Architecture Overview

The REST API acts as a gateway/proxy for the different microservices it exposes. The controllers of the REST API make calls to the RPC servers/microservices in the back-end. The RPC microservices handle the requests to connect to databases or any other service needed to serve the requests.

## Design Patterns Implemented

1. **Microservice Architecture**: Each service is independently deployable and scalable.
2. **Subdomain Decomposition**: Services are decomposed based on business subdomains.
3. **Externalized Configuration**: Configuration is externalized to support different environments.
4. **Remote Procedure Invocation (RPI)**: Services communicate via RPC using RabbitMQ.
5. **API Gateway**: A single entry point for all client requests, routing them to the appropriate microservice.
6. **Database per Service**: Each microservice has its own database to ensure loose coupling.

## Layers

### API Layer

[NestJS + Express](https://nestjs.com/) acts as the API Layer for the architecture. It listens for client requests and calls the appropriate back-end microservice to fulfill them.

### Microservice Layer

[RabbitMQ](https://www.rabbitmq.com/) is the message broker chosen for the microservices communication. Remote Procedure Calls (RPC) are used as the communication style between the client (REST API) and the server (RPC microservices). Services communicate between themselves too.

### Persistence Layer

[PostgreSQL](https://www.postgresql.org/) is used as the database, and [TypeORM](https://typeorm.io/) is used as the Object-Relational Mapper (ORM).

## Deployment

Deployment is containerized using Docker. A Docker Compose file, along with Dockerfiles for each project, are provided to run the entire setup on any machine. For production, it's recommended to use [Kubernetes](https://kubernetes.io/) for deploying such a microservices architecture. [Istio](https://istio.io/) is used for service discovery, distributed tracing, and other observability requirements.

## How to Run

### System Requirements

- [Docker](https://docs.docker.com/install/) - latest
- [Docker Compose](https://docs.docker.com/compose/install/) - latest

### Steps to Run

1. Clone the repository:

   ```sh
   git clone git@github.com:sappChak/nest-auth-rpc.git
   cd nest-auth-rpc
   ```

2. Build and start the services using Docker Compose:

   ```sh
   docker compose up --build
   ```

3. Once the services are up, the API Gateway will be listening on [http://localhost:8080](http://localhost:8080).

4. To test the API, head to the Swagger UI running at [http://localhost:8080/api/docs](http://localhost:8080/api/docs).

## Project Structure

```
/nest-auth-rpc
├── docker-entrypoint-initdb.d
│   ├── token
│   └── user
├── apps
│   ├── gateway
│   │   ├── src
│   │   │   ├── controllers
│   │   │   ├── modules
│   │   │   └── main.ts
│   │   ├── test
│   │   ├── Dockerfile
│   │   └── README.md
│   ├── user
│   │   ├── src
│   │   │   ├── controllers
│   │   │   ├── services
│   │   │   ├── modules
│   │   │   └── main.ts
│   │   ├── test
│   │   ├── Dockerfile
│   │   └── README.md
│   ├── token
│   │   ├── src
│   │   │   ├── controllers
│   │   │   ├── services
│   │   │   ├── modules
│   │   │   └── main.ts
│   │   ├── test
│   │   ├── Dockerfile
│   │   └── README.md
│   ├── auth
│   │   ├── src
│   │   │   ├── controllers
│   │   │   ├── services
│   │   │   ├── modules
│   │   │   └── main.ts
│   │   ├── test
│   │   ├── Dockerfile
│   │   └── README.md
├── libs
│   ├── shared
│   │   ├── src
│   │   │   ├── config
│   │   │   ├── constants
│   │   │   ├── guards
│   │   │   ├── interceptors
│   │   │   ├── rmq
│   │   │   └── types
│   │   └── README.md
├── docker-compose.yml
└── README.md
```

### Roadmap

#### General

- [ ] Develop Kubernetes manifests
- [ ] Configure CI/CD pipeline
- [ ] Implement integration tests
- [x] Pre-populate tables if they don't exist

#### API Gateway

- [ ] Add user authentication
- [x] Implement authorization mechanisms
- [ ] Improve error handling

#### Microservices

- [ ] Implement health checks
- [ ] Add caching solutions
- [ ] Enhance error handling mechanisms

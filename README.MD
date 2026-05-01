# ✈️ AI Travel Planner

Aplicación web para planificar viajes grupales con IA. Cada participante comparte sus preferencias y presupuesto, y Claude genera un itinerario consensuado para todo el grupo. El grupo vota las actividades y la IA regenera incorporando el feedback automáticamente.

**Proyecto de portafolio · Next.js + NestJS + Claude API**

---

## Stack

Next.js 15 · NestJS · PostgreSQL · Prisma · Claude API · Zod · BullMQ · Docker

---

## Setup local

**Requisitos:** Node.js 20+, pnpm, Docker Desktop

```bash
# Clonar
git clone https://github.com/craguila14/ai-travel-planner
cd ai-travel-planner

# Instalar dependencias
pnpm install

# Variables de entorno
cp apps/api/.env.example apps/api/.env
# Editar .env con tu ANTHROPIC_API_KEY

# Levantar Postgres y Redis
docker-compose up -d

# Migrar base de datos
cd apps/api && npx prisma migrate dev && cd ../..

# Correr en desarrollo
pnpm api:dev   # Backend en localhost:3000
pnpm web:dev   # Frontend en localhost:3001
```

---

Construido por [Constanza Águila](https://github.com/craguila14)
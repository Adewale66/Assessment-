# Technical Assessment

## Getting Started

### Installation

_To run the web application run the following commands._

```bash
bun install
```

_Copy and fill env file._

```bash
touch .env
cat .env.example >> .env
```

### Migrations

_Run prisma migrations._

```bash
bunx prisma migrate dev
```

## Development

To start the development server run:

```bash
bun run dev
```

Open http://localhost:8080/docs with your browser to see the result.

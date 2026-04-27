import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Pasta inteira: inclui `models/*.prisma`. Só `schema.prisma` deixa o client sem modelos (`tx.user` undefined).
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});

FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate

RUN pnpm run build
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
EXPOSE 3000

CMD ["sh", "./entrypoint.sh"]
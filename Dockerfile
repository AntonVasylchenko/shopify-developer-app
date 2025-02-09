# Використовуємо Node.js 18 на Alpine Linux
FROM node:18-alpine

# Встановлюємо необхідні пакети
RUN apk add --no-cache openssl

# Відкриваємо порт для додатку (можна змінити, якщо потрібно)
EXPOSE 3000

# Встановлюємо робочу директорію
WORKDIR /app

# Встановлюємо змінні середовища
ENV NODE_ENV=production

# Копіюємо package.json та package-lock.json (якщо є)
COPY package.json package-lock.json* ./

# Встановлюємо залежності без devDependencies
RUN npm ci --omit=dev && npm cache clean --force

# Якщо @shopify/cli не потрібен у продакшені – видаляємо його
# Якщо потрібен – закоментуй цей рядок
RUN npm remove @shopify/cli || true

# Копіюємо всі файли проєкту
COPY . .

# Виводимо список файлів для перевірки
RUN ls -la

# Запускаємо білд проєкту
RUN rm -rf node_modules package-lock.json && npm install && npm cache clean --force && npm run build

# Команда для старту контейнера
CMD ["npm", "run", "docker-start"]

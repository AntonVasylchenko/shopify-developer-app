# Використовуємо легкий образ Node.js 18
FROM node:18-alpine

# Встановлюємо необхідні системні пакети
RUN apk add --no-cache openssl

# Встановлюємо робочу директорію
WORKDIR /app

# Встановлюємо змінні середовища
ENV NODE_ENV=production

# Копіюємо package.json та package-lock.json (щоб уникнути зайвого встановлення залежностей)
COPY package.json package-lock.json ./

# Встановлюємо всі залежності (повний набір)
RUN npm ci && npm cache clean --force

# Копіюємо решту файлів у контейнер
COPY . .

# Виводимо список файлів для перевірки
RUN ls -la

# Запускаємо білд проєкту
RUN npm run build

# Видаляємо dev-залежності після білду (для зменшення розміру контейнера)
RUN npm prune --omit=dev

# Відкриваємо порт додатку (змінюй за потреби)
EXPOSE 3000

# Запускаємо додаток
CMD ["npm", "run", "docker-start"]

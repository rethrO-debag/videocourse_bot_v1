FROM node:18-alpine

WORKDIR /app

# Копируем зависимости и устанавливаем их
COPY package*.json ./
RUN npm install --production

# Копируем исходный код и видео
COPY . .
COPY ./videos /app/videos

# Устанавливаем права на запись для видео (если нужно)
RUN chmod -R a+w /app/videos

# Запуск приложения
CMD ["node", "app.mjs"]
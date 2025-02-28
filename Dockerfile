FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /var/otel-triage && chmod 777 /var/otel-triage
EXPOSE 8989
CMD ["node", "app.js"]

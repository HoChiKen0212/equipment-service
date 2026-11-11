FROM node:24-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --registry=https://registry.npmjs.org
COPY . .
RUN npm run build
ENV HOST=0.0.0.0
CMD ["npm","start"]

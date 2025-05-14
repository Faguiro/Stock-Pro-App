# Etapa de build
FROM node:20 AS builder

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Etapa final (servidor nginx)
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Remove config default do nginx e adiciona o seu
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

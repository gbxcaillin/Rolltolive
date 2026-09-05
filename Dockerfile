FROM node:20-alpine
WORKDIR /app
COPY server ./server
COPY public ./public
ENV PORT=8787 PUBLIC_DIR=/app/public
EXPOSE 8787
CMD ["node", "server/relay.js"]

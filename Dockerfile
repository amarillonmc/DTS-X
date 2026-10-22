FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund \
    && node -e "require('fs-ext-extra-prebuilt')" \
    && npm cache clean --force
COPY engine ./engine
COPY runtime ./runtime
COPY scripts ./scripts
COPY public ./public
COPY upstream ./upstream
COPY server.mjs ./
RUN mkdir -p /app/var && chown -R node:node /app/var
USER node
ENV HOST=0.0.0.0 PORT=3000 NODE_ENV=production
EXPOSE 3000
VOLUME ["/app/var"]
CMD ["node", "server.mjs"]

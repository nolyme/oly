# CONTAINER
FROM node:8.1-alpine
RUN mkdir -p /app
WORKDIR /app

# DEPENDENCIES
COPY package.json yarn.lock /app/
RUN yarn --prod
RUN yarn clean

# SOURCES
COPY lib /app/lib/
COPY www /app/www/

# CONFIGURATION
ENV NODE_ENV=production
ENV HTTP_SERVER_HOST=0.0.0.0
ENV HTTP_SERVER_PORT=3000

# RUN
EXPOSE 3000
CMD [ "npm", "start" ]

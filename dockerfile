# TBD
FROM node:18.18.2-buster-slim
WORKDIR /code
ENV DATABASE_URL "mysql://kseadmin:ksepasswd@127.0.0.1:3306/KSE"
ENV MAX_MOCK_COUNT 100
EXPOSE 888
COPY . .
RUN npm install && npm run build
CMD npm run run:prod

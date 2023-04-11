FROM node:18-alpine

WORKDIR /server

COPY ./package*.json yarn.lock ./

RUN yarn --frozen-lockfile

COPY . .

# RUN echo "NODE_ENV=production" > ./utils/firebase-auth/credentials.json

EXPOSE 3001

CMD ["yarn", "start"]
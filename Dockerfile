FROM --platform=linux node:18.15.0-alpine

WORKDIR /server

COPY ./package*.json yarn.lock ./

RUN yarn --frozen-lockfile

COPY . .

EXPOSE 3001

CMD ["yarn", "start"]

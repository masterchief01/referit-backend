FROM --platform=linux node:18.15.0-alpine

WORKDIR /server

COPY ./package.json yarn.lock ./

RUN rm -rf node_modules

RUN yarn --frozen-lockfile

COPY . .

EXPOSE 5001

CMD ["yarn", "start"]

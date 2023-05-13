FROM --platform=linux node:18.15.0-alpine

WORKDIR /server

COPY ./package.json yarn.lock ./

RUN rm -rf node_modules

RUN npm install

COPY . .

EXPOSE 5001

CMD ["npm", "run", "start"]

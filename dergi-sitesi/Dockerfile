# # you can find your node version with: node --version
# FROM node:15-alpine

# # Create app directory
# WORKDIR /dergi-sitesi

# # Install app dependencies
# COPY package*.json ./

# # Install dependecies
# RUN npm install --production

# # Bundle app
# COPY . .

# # Define your port
# EXPOSE 3000

# # Tell Docker how to run your app
# CMD [ "node", "app.js" ]


FROM node:slim as builder
WORKDIR /dergi-sitesi
COPY . .
RUN npm install --production
RUN npm install -g @zeit/ncc
RUN ncc build app.js -o dist

FROM node:slim
WORKDIR /dergi-sitesi
COPY --from=builder /app/dist/index.js .
CMD ["node", "app.js"]
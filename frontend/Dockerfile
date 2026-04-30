FROM node:18

WORKDIR /app

# copy from frontend folder
COPY frontend/package*.json ./

RUN npm install

# copy full frontend code
COPY frontend/ .

RUN npm run build

RUN npm install -g serve

CMD ["serve", "-s", "dist"]

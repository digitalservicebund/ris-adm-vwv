FROM node:23.11.0

ARG VITE_AUTH_URL
ARG VITE_AUTH_CLIENT_ID
ARG VITE_AUTH_REALM

# make the 'app' folder the current working directory
WORKDIR /frontend

# copy both 'package.json' and 'package-lock.json' (if available)
COPY /frontend/package*.json ./

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY /frontend/. .

# build app for production with minification
RUN VITE_AUTH_URL=$VITE_AUTH_URL \
    VITE_AUTH_CLIENT_ID=$VITE_AUTH_CLIENT_ID \
    VITE_AUTH_REALM=$VITE_AUTH_REALM \
    npm run build

EXPOSE 5173
CMD [ "npm", "run", "dev", "--", "--host" ]

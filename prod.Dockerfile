FROM node:23.11.0 AS builder

# make the 'app' folder the current working directory
WORKDIR /frontend

# copy both 'package.json' and 'package-lock.json' (if available)
COPY /frontend/package*.json ./

# install project dependencies
RUN npm ci --omit=dev

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY /frontend/. .

# build production app
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN\
    SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) \
    npm run build

FROM cgr.dev/chainguard/nginx:latest@sha256:63784cda035da57f536a01e16aeaff55f617e3081fb2c43e301a3f7956b3e978
EXPOSE 8081
COPY --from=builder /frontend/dist /var/lib/nginx/html
COPY nginx.conf /etc/nginx/conf.d/ris-adm-vwv.conf
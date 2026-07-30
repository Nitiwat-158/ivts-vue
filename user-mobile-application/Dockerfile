ARG FLUTTER_IMAGE=ghcr.io/cirrusci/flutter:3.27.4
ARG NGINX_IMAGE=nginx:1.27-alpine@sha256:65645c7bb6a0661892a8b03b89d0743208a18dd2f3f17a54ef4b76fb8e2f2a10

FROM ${FLUTTER_IMAGE} AS build

WORKDIR /app

COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get

COPY . .

ARG API_BASE_URL=/api/v1/mobile
ENV API_BASE_URL=${API_BASE_URL}

RUN flutter build web --release --dart-define=API_BASE_URL=${API_BASE_URL}

FROM ${NGINX_IMAGE} AS server-runner

COPY nginx.server.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build/web /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

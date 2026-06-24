FROM nginx:1.27-alpine

RUN apk upgrade --no-cache \
    && apk add --no-cache openssl

COPY gateway/nginx.conf /etc/nginx/nginx.conf
COPY gateway/default.conf /etc/nginx/conf.d/default.conf
COPY gateway/entrypoint.sh /entrypoint.sh

RUN sed -i 's/\r$//' /entrypoint.sh \
    && chmod +x /entrypoint.sh \
    && mkdir -p /etc/nginx/certs

ENTRYPOINT ["/entrypoint.sh"]

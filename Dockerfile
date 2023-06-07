FROM node:16-alpine
# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json yarn.lock ./

ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1
ENV CFLAGS="-I/usr/include:/usr/include/ffi:/usr/include/libxml2:/usr/include/glib-2.0"
ENV CPPFLAGS="-I/usr/include:/usr/include/ffi:/usr/include/libxml2:/usr/include/glib-2.0"


RUN yarn config set network-timeout 600000 -g && yarn install
ENV PATH /opt/node_modules/.bin:$PATH

WORKDIR /opt/app
RUN chown -R node:node /opt/app
USER node
COPY . .
RUN ["yarn", "build"]
EXPOSE 1337
CMD ["yarn", "develop"]
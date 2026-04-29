FROM koa:base
COPY package.json /koa/
COPY src /koa/src
RUN chmod -R 0777 /koa/src
USER node
CMD sh start.sh
FROM mhart/alpine-node

# Required ENV variables:
# - API_TOKEN_SECRET (secret shared with floq-api)
# - FLOQ_ACCEPTED_EMAIL_DOMAIN (e.g. 'blankoslo.no')

RUN mkdir -p /blank-logogen
WORKDIR /blank-logogen
COPY src /blank-logogen/src
COPY package.json /blank-logogen/
RUN apk add --no-cache git
RUN npm install

EXPOSE 3003

CMD [ "npm",  "start" ]

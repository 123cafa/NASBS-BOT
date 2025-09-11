FROM node:latest
LABEL authors="uwainium"

# Create the directory!
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

# Our precious bot
COPY . /usr/src/bot

RUN npm install

# Start me!
CMD ["npm", "run", "start"]
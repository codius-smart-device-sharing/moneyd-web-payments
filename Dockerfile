# Moneyd requires NodeJS 8.9.0 and above
FROM node:10.15.0

# The working/home directory of our application inside the container
WORKDIR /

# Add the contents of our current directory into the /app folder of our container
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY /distlib /distlib

# Install dependencies from package.json using npm
RUN npm install --only=production
# RUN npm audit fix

# Install global moneyd packages into the docker container
RUN npm -g config set user root
RUN npm install -g moneyd moneyd-uplink-xrp ilp-connector

# Link to the global packages
RUN npm link moneyd moneyd-uplink-xrp ilp-connector

# Make port 8081 available to the outside world -- 5000 as well for the SPSP pointer
EXPOSE 8081
EXPOSE 9229
EXPOSE 5000

# Run the command 'npm start' which will start our server.js file
CMD [ "node", "./distlib/src/server/index.js"]
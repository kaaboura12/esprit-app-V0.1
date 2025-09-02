# Use Node 20 LTS Alpine image
FROM node:20-alpine

WORKDIR /app

# Accept build arguments
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG MAIL_USER
ARG GMAIL_APP_PASSWORD
ARG JWT_SECRET

# Set environment variables from build arguments
ENV SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV SUPABASE_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV GMAIL_USER=$MAIL_USER
ENV GMAIL_APP_PASSWORD=$GMAIL_APP_PASSWORD
ENV JWT_SECRET=$JWT_SECRET
ENV NODE_ENV=production

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["npm", "start"]

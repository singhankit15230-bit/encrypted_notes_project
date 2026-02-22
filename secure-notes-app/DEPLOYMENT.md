# Deployment Guide

## Prerequisites
- Node.js 16+ installed
- MongoDB 5+ installed or MongoDB Atlas account
- Domain name (for production)
- SSL certificate (for HTTPS)

## Local Development Deployment

### Quick Start
```bash
# Terminal 1 - Backend
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev

# Terminal 2 - Frontend
cd client
npm install
npm run dev
```

Access at: http://localhost:3000

## Production Deployment Options

### Option 1: Traditional VPS (Ubuntu/Debian)

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

#### 2. Clone and Setup Application
```bash
# Clone repository
cd /var/www
sudo git clone <your-repo-url> secure-notes-app
sudo chown -R $USER:$USER secure-notes-app
cd secure-notes-app

# Backend setup
cd server
npm install --production
cp .env.example .env

# Generate secure keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Paste output as ENCRYPTION_KEY in .env

# Edit .env for production
nano .env
```

**Production .env:**
```env
PORT=5000
NODE_ENV=production

MONGODB_URI=mongodb://localhost:27017/secure-notes-db

JWT_SECRET=<your-generated-jwt-secret>
JWT_EXPIRE=7d

ENCRYPTION_KEY=<your-generated-encryption-key>

MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

#### 3. Build Frontend
```bash
cd ../client
npm install
npm run build
```

#### 4. Configure PM2
```bash
cd ../server

# Start application with PM2
pm2 start server.js --name secure-notes-api
pm2 startup
pm2 save
```

#### 5. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/secure-notes
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        root /var/www/secure-notes-app/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Increase upload size
    client_max_body_size 10M;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/secure-notes /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Setup SSL with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo systemctl restart nginx
```

#### 7. Setup Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Option 2: Docker Deployment

#### 1. Create Dockerfiles

**server/Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

**client/Dockerfile:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**client/nginx.conf:**
```nginx
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://server:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    client_max_body_size 10M;
}
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: secure-notes-mongo
    restart: always
    environment:
      MONGO_INITDB_DATABASE: secure-notes-db
    volumes:
      - mongodb_data:/data/db
    networks:
      - secure-notes-network

  server:
    build: ./server
    container_name: secure-notes-server
    restart: always
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/secure-notes-db
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - PORT=5000
    depends_on:
      - mongodb
    volumes:
      - uploads_data:/app/uploads
    networks:
      - secure-notes-network

  client:
    build: ./client
    container_name: secure-notes-client
    restart: always
    ports:
      - "80:80"
    depends_on:
      - server
    networks:
      - secure-notes-network

volumes:
  mongodb_data:
  uploads_data:

networks:
  secure-notes-network:
    driver: bridge
```

#### 3. Create .env for Docker
```bash
# .env in root directory
JWT_SECRET=your-generated-jwt-secret-here
ENCRYPTION_KEY=your-generated-encryption-key-here
```

#### 4. Deploy with Docker Compose
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 3: Cloud Platform (Heroku)

#### 1. Prepare Application
```bash
# Add Procfile in server directory
echo "web: node server.js" > server/Procfile

# Update server package.json
# Add to scripts: "start": "node server.js"
```

#### 2. Deploy Backend
```bash
cd server
heroku create your-app-name-api
heroku addons:create mongolab
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set ENCRYPTION_KEY="your-encryption-key"
heroku config:set NODE_ENV=production
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

#### 3. Deploy Frontend
```bash
cd ../client

# Update vite.config.js
# Set API URL to your Heroku backend

# Build
npm run build

# Deploy to Vercel/Netlify/Heroku
```

### Option 4: Cloud Platform (AWS)

#### Components
- **EC2**: Application server
- **RDS/DocumentDB**: Database
- **S3**: Static file storage (alternative to local uploads)
- **CloudFront**: CDN
- **Route 53**: DNS
- **Certificate Manager**: SSL certificates

#### Basic Setup
1. Launch EC2 instance (Ubuntu)
2. Follow VPS deployment steps
3. Use DocumentDB instead of local MongoDB
4. Configure security groups
5. Set up load balancer
6. Configure auto-scaling

### Option 5: MongoDB Atlas (Database)

#### Setup
1. Create account at mongodb.com/cloud/atlas
2. Create cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string
6. Update MONGODB_URI in .env

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/secure-notes-db?retryWrites=true&w=majority
```

## Post-Deployment Checklist

### Security
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Firewall configured
- [ ] MongoDB authentication enabled
- [ ] Strong passwords used
- [ ] Encryption keys backed up
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Security headers configured

### Performance
- [ ] PM2 process manager running
- [ ] Nginx configured as reverse proxy
- [ ] Gzip compression enabled
- [ ] Static assets cached
- [ ] Database indexes created
- [ ] Log rotation configured

### Monitoring
- [ ] PM2 monitoring active
- [ ] Error logging configured
- [ ] Uptime monitoring
- [ ] Backup strategy implemented
- [ ] Alert notifications configured

### Testing
- [ ] All endpoints tested
- [ ] File upload/download tested
- [ ] Authentication tested
- [ ] Mobile responsiveness tested
- [ ] Performance tested
- [ ] Security scan completed

## Maintenance

### Updates
```bash
# Backend updates
cd server
git pull
npm install
pm2 restart secure-notes-api

# Frontend updates
cd ../client
git pull
npm install
npm run build
sudo systemctl reload nginx
```

### Backups
```bash
# MongoDB backup
mongodump --db secure-notes-db --out /backup/$(date +%Y%m%d)

# Encrypted files backup
tar -czf /backup/uploads-$(date +%Y%m%d).tar.gz /var/www/secure-notes-app/server/uploads
```

### Monitoring
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs secure-notes-api

# Monitor resources
pm2 monit

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

## Troubleshooting

### Application won't start
```bash
pm2 logs secure-notes-api --lines 100
```

### Database connection issues
```bash
sudo systemctl status mongod
mongo --eval "db.adminCommand('ping')"
```

### File upload issues
```bash
ls -la /var/www/secure-notes-app/server/uploads
sudo chown -R $USER:$USER uploads/
```

### High memory usage
```bash
pm2 restart secure-notes-api
```

## Scaling

### Horizontal Scaling
- Use load balancer (Nginx, AWS ELB)
- Run multiple application instances
- Shared MongoDB instance
- Shared file storage (S3, NFS)

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add database indexes
- Enable caching (Redis)

---

**Need Help?** Open an issue or contact support.

# IVTS (Agreement Management System)

IVTS is an IAM-integrated agreement management system for MFU. It includes:
- **Backend-node**: Node.js API handling IVTS registry records, Redis, and MongoDB integration.
- **Frontend-vue**: Vue.js SPA for dashboard, IVTS registry, account directory, settings, and permission management.
- **IAM Integration**: Delegated authentication and permission filtering.

---

## 🔌 Runtime Ports & URLs

* **Frontend Local**: `http://127.0.0.1:8084`
* **Backend Host Port**: `8095`
* **Production Domain**: `https://ivts.mfu.ac.th`

---

## 🛠️ Environment Configuration Setup

Because the app uses different runtime networks depending on *how* it is executed, you must configure `backend-node/.env.local` based on your active development workflow:

### Option A: Running via Docker Containers (`./server.sh deploy`)
When running inside Docker containers, the backend cannot use `127.0.0.1` to access your host machine's databases. Find your physical machine IPv4 address via `ipconfig` (e.g., `172.25.33.138`) and configure your file:
```ini
MONGODB=mongodb://<YOUR_WSL_OR_HOST_IPV4_ADDRESS>:27017/IVTS
REDIS_HOST=<YOUR_WSL_OR_HOST_IPV4_ADDRESS>
REDIS_PORT=6379
```

```bash
docker run -d -p 27017:27017 --name ivts-local-mongo mongo:6.0
docker run -d -p 6379:6379 --name ivts-local-redis redis:alpine
```

```sh
cd backend-node
npm install
npm run register:iam:local
npm run bootstrap:local
```

# Execute from project root folder

```bash
APP_ENV=local ./server.sh deploy
```

```bash
cd backend-node
npm run start:local
```
#To kill port
```bash
netstat -ano | findstr : PORT
taskkill /F /PID ID
```

```bash
cd frontend-vue
npm install        # Required on first run to register vue-cli-service
npm run serve:local
```

---
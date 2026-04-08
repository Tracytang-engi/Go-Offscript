# Deploying Go Off Script Backend to Render

## One-time setup

### 1. Create a free PostgreSQL database on Render
1. Go to https://render.com → New → PostgreSQL
2. Name: `go-off-script-db`
3. Copy the **External Database URL** (looks like `postgresql://user:pass@host/dbname`)

### 2. Deploy the backend
1. Push your code to GitHub (or connect repo directly)
2. Render → New → Web Service → connect your repo
3. Set **Root Directory**: `backend`
4. Render auto-detects from `render.yaml`:
   - Build command: `npm install && npx prisma generate && npm run build`
   - Start command: `npm start`

### 3. Set environment variables in Render Dashboard → Environment
```
DATABASE_URL         = <paste External Database URL from step 1>
JWT_SECRET           = any-long-random-string-you-choose
PERPLEXITY_API_KEY   = <your perplexity api key>
PERPLEXITY_GROUP_ID  = <your perplexity group id>
CLOUDINARY_CLOUD_NAME = <your cloudinary cloud name>
CLOUDINARY_API_KEY    = <your cloudinary api key>
CLOUDINARY_API_SECRET = <your cloudinary api secret>
NODE_ENV             = production
```

### 4. After deploy, update mobile app URL
In `mobile/src/lib/api/client.ts`, change:
```ts
export const API_BASE_URL = 'https://YOUR-APP-NAME.onrender.com/api';
```

### 5. Verify
Visit `https://YOUR-APP-NAME.onrender.com/health` — should return `{"status":"ok"}`

---
## Cloudinary (free tier — needed for CV and screenshot uploads)
1. Create free account at https://cloudinary.com
2. Dashboard shows: Cloud Name, API Key, API Secret
3. Add all three to Render environment variables above

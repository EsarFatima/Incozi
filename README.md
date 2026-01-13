Local backend + DB for forms

Steps to run locally:

1. Install Node dependencies

```bash
npm install
```

2. Start the server (dev with auto-reload if you installed dev deps)

```bash
npm run start
# or
npm run dev
```

3. Open the site in your browser:

http://localhost:3000/index.html

Notes:
- The server serves files from the project root and provides `/api/subscribe` and `/api/contact` endpoints.
- Data is stored in `data.db` (SQLite) created in the project root.
- For production, secure the admin endpoints and use environment-specific configuration, backups, and HTTPS.

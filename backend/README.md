# WhatsApp Backend API

This is the backend API server for the WhatsApp Twilio integration.

## Deployment on Vercel

### Step 1: Deploy the Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Deploy to Vercel:
   ```bash
   npx vercel
   ```

4. Set environment variables in Vercel dashboard:
   - `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
   - `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token  
   - `TWILIO_WHATSAPP_NUMBER`: Your Twilio WhatsApp number (format: whatsapp:+15557781885)

### Step 2: Update Frontend Environment Variables

After backend deployment, update your frontend `.env` file with:
```
VITE_API_URL=https://your-backend-deployment.vercel.app
```

### Environment Variables Required

Create these environment variables in your Vercel project:

- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID from your Twilio Console
- `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token from your Twilio Console  
- `TWILIO_WHATSAPP_NUMBER`: Your Twilio WhatsApp sandbox number (format: whatsapp:+15557781885)

### API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /send-whatsapp` - Send WhatsApp message

### Testing

Test the deployment:
```bash
curl https://your-backend-deployment.vercel.app/health
```

## Local Development

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Twilio credentials in `.env`

3. Start the server:
   ```bash
   npm start
   ```

The server will run on http://localhost:5000

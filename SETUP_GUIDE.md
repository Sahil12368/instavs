# Instagram Auto Reply MVP - Setup Guide

## 📋 Prerequisites

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (local or cloud) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)
3. **Meta Developer Account** - [Facebook Developers](https://developers.facebook.com/)
4. **Instagram Business Account** (not personal)

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
cd instagram-auto-reply/backend
npm install

cd ../frontend
npm install
```

### 2. Set Up Environment Variables

Copy `env.example` to `.env` in the backend folder:

```bash
cd backend
copy env.example .env
```

Edit the `.env` file with your credentials (see Meta setup below).

### 3. Start MongoDB

**Local Install:**
```bash
# Windows - run MongoDB service
net start MongoDB

# OR just run mongod
mongod
```

**MongoDB Atlas (Cloud):**
- Create a free cluster at https://www.mongodb.com/atlas
- Get your connection string (replace `<password>` with your database user password)
- Update `MONGODB_URI` in `.env`

### 4. Start the Backend

```bash
cd backend
npm run dev
```

Server starts at `http://localhost:5000`

### 5. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend starts at `http://localhost:3000`

---

## 🔧 Meta Developer App Setup (Important!)

### Step 1: Create a Meta App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Choose **"Business"** as the app type
4. Fill in the details and create the app

### Step 2: Add Instagram API Product

1. In your new app, go to **"Add Product"** 
2. Find **"Instagram"** and click **"Set Up"**
3. Enable **"Instagram Graph API"** and **"Instagram Basic Display"**

### Step 3: Configure App Settings

1. Go to **Settings** → **Basic**
2. Copy your **App ID** and **App Secret** to `.env`
3. Set `META_APP_ID` and `META_APP_SECRET`

### Step 4: Add Platform (Website)

1. Go to **Settings** → **Basic** → **Add Platform**
2. Choose **"Website"**
3. Set **Site URL** to `http://localhost:5000`

### Step 5: Configure OAuth Redirect

1. Go to **"Instagram"** → **"API Setup"** (under Products)
2. Scroll to **"Valid OAuth Redirect URIs"**
3. Add: `http://localhost:5000/api/auth/instagram/callback`
4. Click **Save**

### Step 6: Configure Webhook

1. Go to **"Instagram"** → **"Webhooks"**
2. Click **"Subscribe to this object"** (or manage subscription)
3. Set:
   - **Callback URL**: `https://YOUR_PUBLIC_URL/api/webhook/instagram`
   - **Verify Token**: `<your_webhook_verify_token>` (same as in `.env`)
4. **Important**: For local development, you need a public URL. Use:
   - [ngrok](https://ngrok.com/): `ngrok http 5000`
   - [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
   - Any other tunneling service

### Step 7: Set App in Development Mode

1. Go to **Settings** → **Basic**
2. Make sure **"App Mode"** is set to **"Development"**
3. Add test users if needed (for testing)

### Step 8: Get Your Instagram Business Account ID

After connecting via OAuth, you can find your Instagram Account ID:
1. Go to **"Instagram"** → **"API Setup"**
2. Under **"Instagram Business Account ID"**, you'll see the connected account
3. Also stored in MongoDB after successful connection

---

## 📁 Project Structure

```
instagram-auto-reply/
├── backend/
│   ├── models/
│   │   ├── AutoReplyRule.js      # Rule schema
│   │   ├── Message.js            # Message schema
│   │   └── InstagramAccount.js   # Account schema
│   ├── routes/
│   │   ├── authRoutes.js         # OAuth routes
│   │   ├── rulesRoutes.js        # CRUD for rules
│   │   └── messagesRoutes.js     # Message endpoints
│   ├── controllers/
│   │   ├── authController.js     # OAuth logic
│   │   ├── rulesController.js    # Rule CRUD logic
│   │   └── messagesController.js # Message retrieval logic
│   ├── services/
│   │   ├── instagramService.js   # Meta Graph API calls
│   │   ├── autoReplyService.js   # Auto-reply matching logic
│   │   └── socketService.js      # Real-time updates
│   ├── webhooks/
│   │   └── instagramWebhook.js   # Webhook verification & handling
│   ├── server.js                 # Main entry point
│   ├── package.json
│   └── .env                      # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   │   ├── ConnectionCard.jsx # Instagram connection card
│   │   │   └── AddRuleModal.jsx  # Rule creation/editing modal
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Main dashboard page
│   │   │   ├── Messages.jsx      # Incoming messages page
│   │   │   └── Rules.jsx         # Rules management page
│   │   ├── services/
│   │   │   ├── api.js            # API client
│   │   │   └── socket.js         # Socket.io client
│   │   ├── App.jsx               # Root component
│   │   ├── main.jsx              # Entry point
│   │   └── index.css             # Styles (Tailwind)
│   ├── package.json
│   └── vite.config.js            # Vite config with proxy
│
└── SETUP_GUIDE.md                # This file
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/auth/instagram` | Get OAuth URL |
| GET | `/api/auth/instagram/callback` | OAuth callback |
| GET | `/api/auth/instagram/status` | Connection status |
| POST | `/api/auth/instagram/disconnect` | Disconnect account |
| GET | `/api/webhook/instagram` | Webhook verification (GET) |
| POST | `/api/webhook/instagram` | Webhook events (POST) |
| GET | `/api/rules` | Get all rules |
| POST | `/api/rules` | Create rule |
| PUT | `/api/rules/:id` | Update rule |
| DELETE | `/api/rules/:id` | Delete rule |
| PATCH | `/api/rules/:id/toggle` | Toggle rule status |
| GET | `/api/messages` | Get messages |
| GET | `/api/messages/stats` | Get statistics |

---

## 🧪 Testing the Webhook

Once your app is running and exposed via ngrok:

1. Go to Meta Developer → Instagram → Webhooks
2. Click **"Test"** button next to your webhook
3. Select **"comments"** or **"messages"** as the field
4. Click **"Send to My Server"**
5. Check your backend console for the event
6. Check the frontend Messages page for the received message

---

## 🐳 MongoDB Schema Overview

### AutoReplyRule
```
{
  type: "comment" | "dm",      // Type of trigger
  keyword: String,              // Keyword to match
  replyText: String,            // Auto-reply message
  isActive: Boolean,            // Rule enabled/disabled
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```
{
  type: "comment" | "dm",      // Message type
  instagramMessageId: String,   // Instagram's message ID
  fromUsername: String,         // Sender's username
  fromUserId: String,           // Sender's user ID
  text: String,                 // Message content
  mediaId: String | null,       // Post ID (for comments)
  autoReply: {
    sent: Boolean,              // Auto-reply sent?
    replyText: String,          // What was replied
    ruleId: ObjectId,           // Which rule triggered
    sentAt: Date
  },
  receivedAt: Date
}
```

### InstagramAccount
```
{
  instagramAccountId: String,   // IG Business Account ID
  username: String,             // IG username
  name: String,                 // Display name
  profilePictureUrl: String,    // Profile pic URL
  accessToken: String,          // Long-lived token
  tokenExpiresAt: Date,         // Token expiry
  isConnected: Boolean,         // Active connection
  connectedAt: Date,
  lastSyncedAt: Date
}
```

---

## 🔒 Environment Variables Reference

```
# Required
PORT=5000
MONGODB_URI=mongodb://localhost:27017/instagram-auto-reply
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here
META_WEBHOOK_TOKEN=choose_a_random_token_here
FRONTEND_URL=http://localhost:3000
REDIRECT_URI=http://localhost:5000/api/auth/instagram/callback

# Optional (set after connecting)
INSTAGRAM_ACCOUNT_ID=your_ig_account_id
```

---

## 🎯 Features Implemented

- [x] Simple dashboard with stats
- [x] Connect Instagram Business account via OAuth
- [x] Instagram webhook events (comments & DMs)
- [x] Auto-reply to comments based on keywords
- [x] Auto-reply to DMs based on keywords
- [x] View messages in real-time dashboard
- [x] Add/Edit/Delete auto-reply rules
- [x] MongoDB for data persistence
- [x] Real-time updates via Socket.io
- [x] Mobile-responsive UI
- [x] Environment variables support
- [x] Proper error handling

---

## ❗ Troubleshooting

### Webhook not receiving events
- Make sure your server is publicly accessible (ngrok)
- Verify webhook token matches in Meta Dashboard
- Check that your app is subscribed to the correct webhook fields
- Instagram webhooks only work with **Business** accounts

### OAuth failing
- Ensure redirect URI matches exactly in Meta Dev settings
- App must be in "Development" mode
- You need to add test users or submit for review

### MongoDB connection error
- Make sure MongoDB is running (`mongod` or use Atlas)
- Check your connection string in `.env`

### Socket.io not connecting
- Ensure both frontend and backend are running
- Check the proxy settings in `vite.config.js`

---

## 📝 Notes

- This is an MVP - for production, add authentication, rate limiting, and proper error handling
- Instagram's API has rate limits - be mindful of how many replies you send
- The app uses long-lived tokens (60 days) - you'll need to refresh them periodically
- For full public use, submit your app for Meta App Review

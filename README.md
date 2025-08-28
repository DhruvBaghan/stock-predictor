# AI Stock Predictor 📈

A secure, AI-powered stock prediction app that provides intelligent analysis and buy/sell/hold recommendations.

## 🚀 Features

- Real-time stock data fetching
- AI-powered analysis and recommendations
- Secure API key management
- Responsive design
- Professional trading-style interface

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd stock-predictor
npm install
```

### 2. Get Your API Keys

#### Polygon.io API Key (Required)
1. Go to [polygon.io](https://polygon.io/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes 5 API calls per minute

#### Hugging Face API Key (Optional)
1. Go to [huggingface.co](https://huggingface.co/)
2. Sign up and go to Settings > Access Tokens
3. Create a new token
4. This enhances AI analysis quality

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file and add your keys
POLYGON_API_KEY=your_actual_polygon_api_key_here
HUGGING_FACE_TOKEN=your_actual_hugging_face_token_here
PORT=3000
```

### 4. Run Locally

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Visit `http://localhost:3000` to see your app!

## 🌐 Deploy to Vercel (Recommended)

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up
2. Connect your GitHub repository
3. Import your project
4. In the deployment settings, add your environment variables:
   - `POLYGON_API_KEY`: Your Polygon.io API key
   - `HUGGING_FACE_TOKEN`: Your Hugging Face token

### 3. Your app will be live at: `https://your-app-name.vercel.app`

## 🔒 Security Features

- ✅ API keys hidden in backend environment variables
- ✅ No sensitive data exposed to frontend
- ✅ CORS protection enabled
- ✅ Input validation and error handling
- ✅ Rate limiting considerations

## 📁 Project Structure

```
stock-predictor/
├── frontend/           # Client-side files
│   ├── index.html     # Main HTML
│   ├── style.css      # Styling
│   └── script.js      # Frontend logic
├── backend/           # Server-side files
│   ├── server.js      # Express server
│   └── package.json   # Dependencies
├── .env              # API keys (local only)
├── .env.example      # Template
├── .gitignore        # Ignored files
├── vercel.json       # Deployment config
└── README.md         # This file
```

## 🚨 Important Security Notes

- Never commit your `.env` file to Git
- Always use environment variables for API keys
- The frontend never sees your API keys
- All API calls go through your secure backend

## 🔧 Troubleshooting

### API Key Issues
- Ensure your Polygon.io key is valid and has calls remaining
- Check that environment variables are properly set
- Verify the `.env` file is in the root directory

### Deployment Issues
- Make sure environment variables are set in Vercel dashboard
- Check the Vercel function logs for errors
- Ensure all dependencies are listed in package.json

## 📊 API Usage

The app uses your API quotas efficiently:
- Polygon.io: 1 call per stock ticker per report
- Hugging Face: 1 call per report generation
- Falls back to local analysis if AI API fails

## ⚠️ Disclaimer

This app is for educational purposes only. Always do your own research before making investment decisions. This is not financial advice.

## 🆘 Support

If you need help:
1. Check the console for error messages
2. Verify your API keys are correct
3. Ensure you have API quota remaining
4. Check the GitHub issues for common problems
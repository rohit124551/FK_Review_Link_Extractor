# FK Review Link Extractor - Netlify Edition

Convert Flipkart product links to review links instantly with a beautiful UI and local history tracking.

## Features

✨ **Modern UI** - Clean, responsive design with gradient backgrounds  
🔐 **URL Validation** - Only accepts Flipkart links  
📋 **Local History** - Saves generated links in browser storage  
⚡ **Netlify Serverless** - Backend API runs on Netlify Functions  
🚀 **One-Click Deploy** - Ready for Netlify deployment

## Project Structure

```
.
├── index.html              # Frontend UI with history feature
├── package.json            # Project dependencies
├── netlify.toml            # Netlify configuration
└── netlify/
    └── functions/
        └── resolve.js      # Serverless API for resolving short links
```

## Setup & Deployment

### Local Development

```bash
# Install dependencies
npm install

# Run locally with Netlify
npm run dev
```

Visit `http://localhost:8888` in your browser.

### Deploy to Netlify

**Option 1: GitHub Integration (Recommended)**
1. Push this repository to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Click "Deploy" (Netlify auto-detects the configuration)

**Option 2: Direct Deployment**
```bash
npm install -g netlify-cli
netlify deploy
```

## How It Works

1. **Frontend**: User pastes a Flipkart link in the input field
2. **Validation**: Checks if it's a valid Flipkart URL
3. **Short Link Resolution** (if needed): Uses Netlify Function to resolve `dl.flipkart.com` short links
4. **URL Conversion**: Converts product URL to review URL
5. **History**: Saves the generated link locally in browser

## API Endpoint

- **Endpoint**: `/.netlify/functions/resolve`
- **Method**: GET
- **Query Parameter**: `url` (the Flipkart short link)
- **Response**: `{ finalUrl: "resolved_url" }`

## Browser Compatibility

- Chrome, Firefox, Safari, Edge (all modern versions)
- Requires JavaScript enabled
- LocalStorage support for history feature

## License

MIT

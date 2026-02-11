# FK Review Link Extractor - Netlify Edition

Convert Flipkart product links to review links instantly with a beautiful UI and local history tracking.

## Features

✨ **Modern UI** - Clean, responsive design with gradient backgrounds  
🔐 **URL Validation** - Only accepts full product links with `pid` and `lid` parameters  
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

1. **Input Validation**: User pastes a Flipkart link
   - Must start with `https://www.flipkart.com/`
   - Must contain `pid` (product ID) parameter
   - Must contain `lid` (listing ID) parameter
2. **URL Conversion**: Converts product URL to review URL by replacing `/p/` with `/product-reviews/`
3. **Query Parameters**: Adds parameters for reviews: `aid=overall&certifiedBuyer=false&sortOrder=MOST_RECENT`
4. **History**: Saves the generated link locally in browser

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

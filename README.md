# Emory Search - Elastic Search UI

A modern, responsive search interface for Emory University content, powered by Elasticsearch and built with the official Elastic Search UI library.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp env.example .env
```

Edit `.env` with your Elasticsearch configuration:
```env
REACT_APP_ELASTICSEARCH_ENDPOINT=https://your-deployment.es.us-east-1.aws.cloud.es.io
REACT_APP_ELASTICSEARCH_API_KEY=your_api_key_here
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Architecture

This application uses a **direct connection** to Elasticsearch with no backend required:

```
┌─────────────────┐    Direct Connection    ┌─────────────────┐
│   React Frontend │ ◄─────────────────────► │ Elasticsearch    │
│   (Port 3000)    │                         │   Cloud          │
└─────────────────┘                         └─────────────────┘
```

## 📦 Dependencies

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Elastic Search UI** - Official Elasticsearch search interface
- **Elasticsearch Connector** - Direct Elasticsearch connection

## 🎯 Features

### 🔍 Search Capabilities
- **Full-text search** across both `search-emory-main` and `search-emory-news` indices
- **Search-as-you-type** for instant results
- **Autocomplete suggestions** from titles and content
- **Fuzzy matching** for typo tolerance

### 🏷️ Faceted Search
- **Content Type** - Filter between Main Site and News content
- **Built-in filtering** with Search UI components

### 📄 Results Management
- **Pagination** with configurable page sizes
- **Sorting** by relevance
- **Result highlighting** for search terms
- **Click tracking** for analytics

### 🎨 Custom Result Display
Each result shows:
- **Title** with clickable link
- **Content type** (Main Site or News)
- **Date** when content was last crawled
- **Body content** preview
- **Meta keywords** as tags

## 🔧 Configuration

### Search Fields
The application searches across these fields:
```javascript
search_fields: {
  title: {},
  body_content: {}
}
```

### Result Fields
Displays these fields from Elasticsearch:
```javascript
result_fields: {
  title: { raw: {} },
  body_content: { raw: {} },
  url: { raw: {} },
  meta_keywords: { raw: {} },
  last_crawled_at: { raw: {} },
  domains: { raw: {} },
  url_host: { raw: {} },
  _index: { raw: {} }
}
```

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Project Structure
```
emory-search/
├── src/
│   ├── App.tsx          # Main application component
│   ├── App.css          # Custom styles
│   ├── main.tsx         # React entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Environment Variables
For production deployment, set these environment variables:
- `VITE_ELASTICSEARCH_ENDPOINT` - Your Elasticsearch endpoint
- `VITE_ELASTICSEARCH_API_KEY` - Your Elasticsearch API key

## 🔒 Security

### Development
- Uses `ElasticsearchAPIConnector` for direct connection
- API key is exposed to browser (fine for development)

### Production
For production deployment, consider using:
- `ApiProxyConnector` with a proxy server
- Server-side API key management
- CORS configuration for your domain

## 📊 Elasticsearch Indices

The application searches across two indices:
- **`search-emory-main`** - Main Emory University website content
- **`search-emory-news`** - News and announcements content

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details. 
# Production Deployment Guide

## Build for Production
```bash
npm run build
```

## Preview Production Build
```bash
npm run preview
```

## Deploy to Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

## Deploy to Netlify
1. Build the project: `npm run build`
2. Drag `dist` folder to Netlify drop zone
3. Or use Netlify CLI: `netlify deploy --prod --dir=dist`

## Environment Variables (for production)
- `VITE_GROQ_API_KEY` - For real AI integration
- `VITE_WALMART_API_KEY` - For real product data
- `VITE_STRIPE_PUBLIC_KEY` - For real payments

## Performance Optimizations
- Images are optimized with proper dimensions
- Code splitting implemented via React.lazy
- CSS is bundled and minified
- Framer Motion animations are optimized

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

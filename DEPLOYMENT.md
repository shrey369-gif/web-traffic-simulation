# Deployment Guide

## TrafficSim - Vercel Deployment

This guide covers deployment of the TrafficSim procedural traffic simulation engine to Vercel.

### Pre-Deployment Checklist

- [ ] All environment variables are set in Vercel dashboard
- [ ] Build verification passes: `npm run verify-build`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Production build successful: `npm run build`
- [ ] Java backend service configured (optional, for advanced features)
- [ ] API routes respond correctly

### Environment Variables Required

```
NEXT_PUBLIC_JAVA_BACKEND_URL=https://your-java-backend.com (optional)
NEXT_PUBLIC_ENABLE_EXPORT=true
```

### Critical Upgrades Implemented

#### 1. Java Fallback Service Layer (CRITICAL)
- Health check endpoint: `/api/health`
- Simulation API endpoint: `/api/simulate` 
- Graceful fallback to client-side if backend unavailable
- Backend status indicator on dashboard

#### 2. Export Features (HIGH)
- JSON export for scenario configurations
- MATLAB-compatible export format
- CSV export for analytics data
- Downloadable files via UI export menu

#### 3. SSR & Deployment Fixes (CRITICAL)
- Proper Next.js configuration for Vercel
- SSR-safe components with 'use client' directives
- Dynamic imports for Three.js/React Three Fiber
- Environment variable handling

#### 4. UI/UX Improvements (MEDIUM)
- Animated counter components for KPI display
- Skeleton loaders for better perceived performance
- Main navigation component with active state
- Improved Insights page with live metrics
- Backend status indicator

### Build & Deploy

#### Local Testing
```bash
# Install dependencies
pnpm install

# Verify build
npm run verify-build

# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

#### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect Next.js configuration
3. Set environment variables in project settings
4. Deploy - the build will automatically:
   - Run verification checks
   - Compile TypeScript
   - Generate optimized production bundle
   - Deploy to edge network

### API Endpoints

#### Health Check
```
GET /api/health
Response: { status: 'ok', available: true, timestamp: number }
```

#### Simulation (Future - Java Backend)
```
POST /api/simulate
Body: { 
  gridSize: { cols, rows },
  gridRandomness: number,
  vehicleDensity: number,
  ...
}
Response: { 
  vehicles: [],
  statistics: {},
  ...
}
```

### Monitoring

- Check logs in Vercel dashboard under "Logs"
- Backend health status visible in dashboard
- API errors logged to console and Vercel error tracking
- Performance metrics available in Vercel Analytics

### Troubleshooting

**Problem: Java backend not responding**
- Solution: App automatically falls back to client-side simulation
- Check NEXT_PUBLIC_JAVA_BACKEND_URL is correct
- Verify backend service is running

**Problem: Large bundle size**
- Solution: Three.js is already tree-shaken in production
- Dynamic imports reduce initial JS payload
- Monitor with `npm run analyze` if available

**Problem: WebGL not rendering**
- Solution: Check browser console for Three.js errors
- Verify hardware acceleration is enabled
- Try on different device/browser

### Performance Optimization

- Production builds disable source maps
- Component-level code splitting via dynamic imports
- Optimized image handling with next/image
- CSS-in-JS properly scoped per component
- Zustand store prevents unnecessary re-renders

### Security Headers

The following security headers are set automatically:
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- API cache headers: public, max-age=60

### Support

For issues or questions:
1. Check the project Issues
2. Review logs in Vercel dashboard
3. Test locally with `npm run dev`
4. Check network tab for API failures

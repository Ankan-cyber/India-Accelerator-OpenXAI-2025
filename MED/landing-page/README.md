# PillPal Landing Page

This is a static Next.js landing page for the PillPal medication management application.

## Project Structure

```
landing-page/
├── src/
│   ├── app/           # Next.js app directory
│   └── components/    # React components
├── out/               # Static export output
└── public/            # Static assets
```

## Development

```bash
cd landing-page
npm run dev
```

The landing page runs on port 3001 to avoid conflicts with the main dashboard app (port 5000).

## Static Export

```bash
cd landing-page
npm run build
```

This creates a static export in the `out/` folder that can be deployed to any static hosting service.

## Features

- Responsive design optimized for all devices
- Modern animations with Framer Motion
- SEO optimized with proper meta tags
- Static export ready for deployment
- Separate from the main dashboard application
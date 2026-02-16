# Mapbox 3D Terrain Integration Notes

This file documents the changes and configuration needed to run the 3D terrain map using Mapbox.

## What Was Added/Updated
- The admin Overview page now loads the Mapbox token from `localStorage` first, then falls back to `VITE_MAPBOX_TOKEN` if present.
- The 3D terrain map component (`TerrainMap`) continues to use Mapbox GL with the terrain DEM source and sky layer.

## Required Setup
1. Create a Mapbox access token at `mapbox.com` (public token is fine).
2. Add the token to a root `.env` file:
```
VITE_MAPBOX_TOKEN=your_public_mapbox_token_here
```
3. Restart the frontend dev server so Vite picks up the new env var.

## Optional Notes
- You can also paste a token directly into the token input field in the Overview page; it is stored in `localStorage` as `mapboxToken`.
- The map uses the `mapbox://styles/mapbox/outdoors-v12` style with terrain exaggeration enabled.

## Files Involved
- `src/pages/admin/Overview.jsx`
- `src/components/TerrainMap.jsx`

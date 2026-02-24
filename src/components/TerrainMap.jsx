import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Uganda airports data
const airports = [
  { name: 'Entebbe', code: 'EBB', passengers: '1,892,450', coords: [32.4435, 0.0424], isHub: true },
  { name: 'Gulu', code: 'GUL', passengers: '28,450', coords: [32.2722, 2.8056] },
  { name: 'Arua', code: 'ARU', passengers: '15,230', coords: [30.9170, 3.0500] },
  { name: 'Soroti', code: 'SRT', passengers: '18,200', coords: [33.6228, 1.7275] },
  { name: 'Kidepo', code: 'KDP', passengers: '8,540', coords: [33.7486, 3.9167] },
  { name: 'Kasese', code: 'KSE', passengers: '12,100', coords: [30.1000, 0.1833] },
];

// Entebbe is the hub - all routes connect to it
const hubCoords = [32.4435, 0.0424];
const activeDestination = airports.find((airport) => airport.code === 'GUL') || airports.find((airport) => !airport.isHub);
const activeRouteCoords = [hubCoords, activeDestination.coords];

const TerrainMap = ({ accessToken, onTokenNeeded, mapRef, containerRef }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const styleElRef = useRef(null);
  const flightMarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const animationStartRef = useRef(0);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (containerRef) {
      containerRef.current = mapContainer.current;
    }
  }, [containerRef]);

  useEffect(() => {
    if (!accessToken) {
      onTokenNeeded?.();
      return;
    }

    if (map.current) return;

    mapboxgl.accessToken = accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [32.5, 1.5], // Center on Uganda
      zoom: 6.5,
      pitch: 52, // Tilt for 3D effect
      bearing: -10,
      antialias: true
    });

    map.current.on('load', () => {
      const currentStyle = map.current.getStyle();
      currentStyle.layers.forEach((layer) => {
        if (layer.type === 'symbol') {
          map.current.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });

      map.current.setFog({
        range: [0.5, 8],
        color: '#021114',
        'high-color': '#0a2c2f',
        'space-color': '#020608',
        'star-intensity': 0.07
      });

      // Add terrain source
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });

      // Add 3D terrain
      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.25 });

      // Add sky layer for atmosphere
      map.current.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'gradient',
          'sky-gradient': [
            'interpolate',
            ['linear'],
            ['sky-radial-progress'],
            0.8,
            '#021015',
            1,
            '#010609'
          ],
          'sky-gradient-center': [0, 0],
          'sky-gradient-radius': 90
        }
      });

      // Add flight routes
      const routeFeatures = airports
        .filter(a => !a.isHub)
        .map(airport => ({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [hubCoords, airport.coords]
          },
          properties: {
            name: airport.name
          }
        }));

      map.current.addSource('routes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: routeFeatures
        }
      });

      // Add route lines with glow effect
      map.current.addLayer({
        id: 'routes-glow',
        type: 'line',
        source: 'routes',
        paint: {
          'line-color': '#2cff72',
          'line-width': 11,
          'line-opacity': 0.42,
          'line-blur': 7
        }
      });

      map.current.addLayer({
        id: 'routes-line',
        type: 'line',
        source: 'routes',
        paint: {
          'line-color': '#effff5',
          'line-width': 2.8,
          'line-opacity': 0.95
        }
      });

      map.current.addLayer({
        id: 'routes-dashed',
        type: 'line',
        source: 'routes',
        paint: {
          'line-color': '#39ff7a',
          'line-width': 1.8,
          'line-opacity': 0.9,
          'line-dasharray': [0.8, 2.4]
        }
      });

      map.current.addSource('active-route', {
        type: 'geojson',
        lineMetrics: true,
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: activeRouteCoords
              },
              properties: {}
            }
          ]
        }
      });

      map.current.addLayer({
        id: 'active-route-glow',
        type: 'line',
        source: 'active-route',
        paint: {
          'line-color': '#9bff8a',
          'line-width': 14,
          'line-opacity': 0.45,
          'line-blur': 8
        }
      });

      map.current.addLayer({
        id: 'active-route-line',
        type: 'line',
        source: 'active-route',
        paint: {
          'line-width': 3.5,
          'line-opacity': 0.98,
          'line-color': [
            'interpolate',
            ['linear'],
            ['line-progress'],
            0,
            '#f7fff8',
            0.6,
            '#9bff8a',
            1,
            '#39ff7a'
          ]
        }
      });

      map.current.addSource('airports-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: airports.map((airport) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: airport.coords
            },
            properties: {
              isHub: airport.isHub ? 1 : 0
            }
          }))
        }
      });

      map.current.addLayer({
        id: 'airports-glow',
        type: 'circle',
        source: 'airports-points',
        paint: {
          'circle-radius': ['case', ['==', ['get', 'isHub'], 1], 24, 13],
          'circle-color': '#2cff72',
          'circle-opacity': 0.3,
          'circle-blur': 0.9
        }
      });

      map.current.addLayer({
        id: 'airports-core',
        type: 'circle',
        source: 'airports-points',
        paint: {
          'circle-radius': ['case', ['==', ['get', 'isHub'], 1], 7, 4.5],
          'circle-color': ['case', ['==', ['get', 'isHub'], 1], '#7dff68', '#63ffc3'],
          'circle-stroke-color': '#eafff3',
          'circle-stroke-width': 1.4
        }
      });

      setMapLoaded(true);
      if (mapRef) {
        mapRef.current = map.current;
      }
    });

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (flightMarkerRef.current) {
        flightMarkerRef.current.remove();
        flightMarkerRef.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [accessToken, onTokenNeeded]);

  // Add markers after map loads
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add airport markers
    airports.forEach(airport => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'airport-marker';
      el.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        ">
          <div style="
            width: ${airport.isHub ? '24px' : '16px'};
            height: ${airport.isHub ? '24px' : '16px'};
            background: radial-gradient(circle at 35% 35%, #eafff3, #32ff75 40%, #1b7a4d 100%);
            border: 1px solid #c8ffdc;
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 16px #38ff7f80;
            ${airport.isHub ? 'animation: pulse 2s infinite;' : ''}
          ">
            <svg width="${airport.isHub ? '12' : '0'}" height="${airport.isHub ? '12' : '0'}" fill="#062012" viewBox="0 0 24 24" style="${airport.isHub ? '' : 'display:none;'}">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
          ${airport.isHub || airport.code === activeDestination.code ? `<div style="
            margin-top: 8px;
            background: rgba(5, 21, 25, 0.88);
            color: #dcffe8;
            border: 1px solid rgba(63, 255, 133, 0.35);
            padding: 6px 11px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 700;
            text-align: center;
            box-shadow: 0 8px 20px rgba(20, 245, 118, 0.15);
            white-space: nowrap;
          ">
            ${airport.isHub ? `${airport.name} • Departure 6:30 PM` : `${airport.name} • Arrival 8:15 PM`}
          </div>` : ''}
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat(airport.coords)
        .addTo(map.current);
      markersRef.current.push(marker);
    });

    const flightEl = document.createElement('div');
    flightEl.innerHTML = `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 999px;
        background: radial-gradient(circle at 35% 35%, #f7fff8, #9bff8a 45%, #2f9b4f 100%);
        border: 1px solid #d5ffe1;
        box-shadow: 0 0 24px rgba(120, 255, 155, 0.95), 0 0 44px rgba(45, 255, 124, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg class="flight-plane-icon" width="18" height="18" fill="#052113" viewBox="0 0 24 24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>
    `;

    const flightMarker = new mapboxgl.Marker(flightEl)
      .setLngLat(hubCoords)
      .addTo(map.current);
    flightMarkerRef.current = flightMarker;

    const dx = activeDestination.coords[0] - hubCoords[0];
    const dy = activeDestination.coords[1] - hubCoords[1];
    const heading = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    const planeIcon = flightEl.querySelector('.flight-plane-icon');
    if (planeIcon) {
      planeIcon.style.transform = `rotate(${heading}deg)`;
    }

    const durationMs = 6000;
    const animateFlight = (timestamp) => {
      if (!animationStartRef.current) {
        animationStartRef.current = timestamp;
      }
      const elapsed = (timestamp - animationStartRef.current) % durationMs;
      const progress = elapsed / durationMs;
      const lng = hubCoords[0] + (activeDestination.coords[0] - hubCoords[0]) * progress;
      const lat = hubCoords[1] + (activeDestination.coords[1] - hubCoords[1]) * progress;
      flightMarker.setLngLat([lng, lat]);
      animationFrameRef.current = requestAnimationFrame(animateFlight);
    };
    animationFrameRef.current = requestAnimationFrame(animateFlight);

    // Add CSS for pulse animation
    if (styleElRef.current) {
      styleElRef.current.remove();
    }
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.18); }
      }
    `;
    document.head.appendChild(styleEl);
    styleElRef.current = styleEl;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      animationStartRef.current = 0;
      if (flightMarkerRef.current) {
        flightMarkerRef.current.remove();
        flightMarkerRef.current = null;
      }
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      if (styleElRef.current) {
        styleElRef.current.remove();
        styleElRef.current = null;
      }
    };
  }, [mapLoaded]);

  if (!accessToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">3D Terrain Map</h3>
          <p className="text-slate-500 text-sm mb-4">Mapbox API token required</p>
          <a 
            href="https://account.mapbox.com/auth/signup/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
          >
            Get Free Token
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-2xl overflow-hidden border border-emerald-400/20 shadow-[0_0_60px_rgba(34,197,94,0.2)]" />
      
      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm rounded-2xl">
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-emerald-100/90 text-sm">Loading neon terrain...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerrainMap;

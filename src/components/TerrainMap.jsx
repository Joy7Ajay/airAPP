import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Uganda airports data
const airports = [
  { name: 'Entebbe', code: 'EBB', passengers: '1,892,450', coords: [32.4435, 0.0424], color: '#10b981', isHub: true },
  { name: 'Gulu', code: 'GUL', passengers: '28,450', coords: [32.2722, 2.8056], color: '#f59e0b' },
  { name: 'Arua', code: 'ARU', passengers: '15,230', coords: [30.9170, 3.0500], color: '#f43f5e' },
  { name: 'Soroti', code: 'SRT', passengers: '18,200', coords: [33.6228, 1.7275], color: '#3b82f6' },
  { name: 'Kidepo', code: 'KDP', passengers: '8,540', coords: [33.7486, 3.9167], color: '#fb7185' },
  { name: 'Kasese', code: 'KSE', passengers: '12,100', coords: [30.1000, 0.1833], color: '#6366f1' },
];

// Entebbe is the hub - all routes connect to it
const hubCoords = [32.4435, 0.0424];

const TerrainMap = ({ accessToken, onTokenNeeded }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      onTokenNeeded?.();
      return;
    }

    if (map.current) return;

    mapboxgl.accessToken = accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12', // Terrain style
      center: [32.5, 1.5], // Center on Uganda
      zoom: 6.5,
      pitch: 45, // Tilt for 3D effect
      bearing: -10,
      antialias: true
    });

    map.current.on('load', () => {
      // Add terrain source
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });

      // Add 3D terrain
      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Add sky layer for atmosphere
      map.current.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 15
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
          'line-color': '#6366f1',
          'line-width': 6,
          'line-opacity': 0.3,
          'line-blur': 3
        }
      });

      map.current.addLayer({
        id: 'routes-line',
        type: 'line',
        source: 'routes',
        paint: {
          'line-color': '#6366f1',
          'line-width': 2.5,
          'line-opacity': 0.9
        }
      });

      setMapLoaded(true);
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [accessToken, onTokenNeeded]);

  // Add markers after map loads
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

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
            width: ${airport.isHub ? '44px' : '36px'};
            height: ${airport.isHub ? '44px' : '36px'};
            background: ${airport.color};
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px ${airport.color}50;
            ${airport.isHub ? 'animation: pulse 2s infinite;' : ''}
          ">
            <svg width="${airport.isHub ? '24' : '20'}" height="${airport.isHub ? '24' : '20'}" fill="white" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
          <div style="
            margin-top: 8px;
            background: ${airport.color};
            color: white;
            padding: 6px 12px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 4px 15px ${airport.color}40;
            white-space: nowrap;
          ">
            ${airport.name}
            <div style="font-size: 13px; font-weight: 600;">${airport.passengers}</div>
          </div>
        </div>
      `;

      new mapboxgl.Marker(el)
        .setLngLat(airport.coords)
        .addTo(map.current);
    });

    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    `;
    document.head.appendChild(style);

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
      <div ref={mapContainer} className="w-full h-full rounded-2xl overflow-hidden" />
      
      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 rounded-2xl">
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-slate-600 text-sm">Loading 3D terrain...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerrainMap;

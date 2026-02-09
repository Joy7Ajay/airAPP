import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg style="transform: rotate(45deg); width: 16px; height: 16px;" fill="white" viewBox="0 0 24 24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Uganda airports data
const ugandaAirports = [
  { 
    id: 1, 
    name: 'Entebbe International Airport', 
    code: 'EBB',
    type: 'international',
    lat: 0.0424, 
    lng: 32.4435,
    passengers: 1892450,
    flights: 12480,
    status: 'high',
    description: 'Main international gateway to Uganda',
    runways: 2,
    airlines: ['Uganda Airlines', 'Ethiopian', 'Kenya Airways', 'Emirates', 'Turkish Airlines']
  },
  { 
    id: 2, 
    name: 'Kajjansi Airfield', 
    code: 'KAJ',
    type: 'domestic',
    lat: 0.1972, 
    lng: 32.5528,
    passengers: 45200,
    flights: 890,
    status: 'medium',
    description: 'Training and charter flights',
    runways: 1,
    airlines: ['Aerolink Uganda', 'Private Charters']
  },
  { 
    id: 3, 
    name: 'Jinja Airport', 
    code: 'JIN',
    type: 'domestic',
    lat: 0.4478, 
    lng: 33.1936,
    passengers: 12300,
    flights: 340,
    status: 'low',
    description: 'Regional airport serving Jinja',
    runways: 1,
    airlines: ['Aerolink Uganda']
  },
  { 
    id: 4, 
    name: 'Gulu Airport', 
    code: 'ULU',
    type: 'domestic',
    lat: 2.8056, 
    lng: 32.2719,
    passengers: 28500,
    flights: 520,
    status: 'medium',
    description: 'Northern Uganda hub',
    runways: 1,
    airlines: ['Uganda Airlines', 'Aerolink Uganda']
  },
  { 
    id: 5, 
    name: 'Arua Airport', 
    code: 'RUA',
    type: 'domestic',
    lat: 3.0497, 
    lng: 30.9108,
    passengers: 15600,
    flights: 280,
    status: 'low',
    description: 'West Nile region airport',
    runways: 1,
    airlines: ['Aerolink Uganda']
  },
  { 
    id: 6, 
    name: 'Kasese Airfield', 
    code: 'KSE',
    type: 'airstrip',
    lat: 0.1830, 
    lng: 30.1000,
    passengers: 8900,
    flights: 180,
    status: 'low',
    description: 'Gateway to Rwenzori Mountains',
    runways: 1,
    airlines: ['Aerolink Uganda', 'Safari Charters']
  },
  { 
    id: 7, 
    name: 'Pakuba Airfield', 
    code: 'PAF',
    type: 'airstrip',
    lat: 2.3264, 
    lng: 31.5000,
    passengers: 22100,
    flights: 420,
    status: 'medium',
    description: 'Murchison Falls National Park',
    runways: 1,
    airlines: ['Aerolink Uganda', 'Safari Charters']
  },
  { 
    id: 8, 
    name: 'Kidepo Airstrip', 
    code: 'KID',
    type: 'airstrip',
    lat: 3.7167, 
    lng: 33.7500,
    passengers: 5400,
    flights: 120,
    status: 'low',
    description: 'Kidepo Valley National Park',
    runways: 1,
    airlines: ['Safari Charters']
  },
  { 
    id: 9, 
    name: 'Soroti Airport', 
    code: 'SRT',
    type: 'domestic',
    lat: 1.7278, 
    lng: 33.6228,
    passengers: 18200,
    flights: 310,
    status: 'medium',
    description: 'Eastern Uganda regional airport',
    runways: 1,
    airlines: ['Uganda Airlines', 'Aerolink Uganda']
  },
  { 
    id: 10, 
    name: 'Mbarara Airfield', 
    code: 'MBQ',
    type: 'airstrip',
    lat: -0.5550, 
    lng: 30.6000,
    passengers: 6800,
    flights: 150,
    status: 'low',
    description: 'Western Uganda regional strip',
    runways: 1,
    airlines: ['Aerolink Uganda']
  },
];

// Flight routes from Entebbe
const flightRoutes = [
  { from: 0, to: 3, passengers: 28500 }, // Entebbe to Gulu
  { from: 0, to: 6, passengers: 22100 }, // Entebbe to Pakuba
  { from: 0, to: 8, passengers: 18200 }, // Entebbe to Soroti
  { from: 0, to: 4, passengers: 15600 }, // Entebbe to Arua
  { from: 0, to: 2, passengers: 12300 }, // Entebbe to Jinja
  { from: 0, to: 5, passengers: 8900 },  // Entebbe to Kasese
  { from: 0, to: 7, passengers: 5400 },  // Entebbe to Kidepo
];

// Map bounds setter component
const SetBoundsComponent = ({ airports }) => {
  const map = useMap();
  
  useEffect(() => {
    if (airports.length > 0) {
      const bounds = L.latLngBounds(airports.map(a => [a.lat, a.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [airports, map]);
  
  return null;
};

const Airports = () => {
  const { user, token } = useOutletContext();
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showRoutes, setShowRoutes] = useState(true);
  const [timeRange, setTimeRange] = useState('1Y');

  // Filter airports
  const filteredAirports = ugandaAirports.filter(airport => {
    if (filterType !== 'all' && airport.type !== filterType) return false;
    if (filterStatus !== 'all' && airport.status !== filterStatus) return false;
    return true;
  });

  // Get marker color based on status
  const getMarkerColor = (status) => {
    switch (status) {
      case 'high': return '#10b981'; // green
      case 'medium': return '#f59e0b'; // yellow
      case 'low': return '#ef4444'; // red
      default: return '#6b7280';
    }
  };

  // Calculate totals
  const totalPassengers = ugandaAirports.reduce((sum, a) => sum + a.passengers, 0);
  const totalFlights = ugandaAirports.reduce((sum, a) => sum + a.flights, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            Uganda Airports Map
          </h1>
          <p className="text-slate-400 mt-1">Interactive map of all airports and landing sites across Uganda</p>
        </div>
        
        {/* Time Range */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl p-1">
          {['1M', '3M', '6M', '1Y', 'ALL'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <span className="text-slate-400 text-sm">Total Airports</span>
          <p className="text-2xl font-bold text-white mt-1">{ugandaAirports.length}</p>
          <span className="text-emerald-400 text-xs">Active locations</span>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <span className="text-slate-400 text-sm">Total Passengers</span>
          <p className="text-2xl font-bold text-white mt-1">{(totalPassengers / 1000000).toFixed(2)}M</p>
          <span className="text-emerald-400 text-xs">+18.5% from last year</span>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <span className="text-slate-400 text-sm">Total Flights</span>
          <p className="text-2xl font-bold text-white mt-1">{totalFlights.toLocaleString()}</p>
          <span className="text-emerald-400 text-xs">+12.3% from last year</span>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <span className="text-slate-400 text-sm">International</span>
          <p className="text-2xl font-bold text-white mt-1">1</p>
          <span className="text-blue-400 text-xs">Entebbe (EBB)</span>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <span className="text-slate-400 text-sm">Domestic Routes</span>
          <p className="text-2xl font-bold text-white mt-1">{flightRoutes.length}</p>
          <span className="text-cyan-400 text-xs">Active connections</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3 bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
          {/* Map Filters */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Type:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                >
                  <option value="all">All Types</option>
                  <option value="international">International</option>
                  <option value="domestic">Domestic</option>
                  <option value="airstrip">Airstrip</option>
                </select>
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Traffic:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                >
                  <option value="all">All Levels</option>
                  <option value="high">High Traffic</option>
                  <option value="medium">Medium Traffic</option>
                  <option value="low">Low Traffic</option>
                </select>
              </div>
            </div>

            {/* Routes Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showRoutes}
                onChange={(e) => setShowRoutes(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-300">Show Routes</span>
            </label>
          </div>

          {/* Leaflet Map */}
          <div className="h-[500px]">
            <MapContainer
              center={[1.3733, 32.2903]}
              zoom={7}
              style={{ height: '100%', width: '100%', background: '#0f172a' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              
              <SetBoundsComponent airports={filteredAirports} />

              {/* Flight Routes */}
              {showRoutes && flightRoutes.map((route, index) => {
                const fromAirport = ugandaAirports[route.from];
                const toAirport = ugandaAirports[route.to];
                
                // Check if both airports are in filtered list
                const fromVisible = filteredAirports.find(a => a.id === fromAirport.id);
                const toVisible = filteredAirports.find(a => a.id === toAirport.id);
                
                if (!fromVisible || !toVisible) return null;
                
                return (
                  <Polyline
                    key={index}
                    positions={[
                      [fromAirport.lat, fromAirport.lng],
                      [toAirport.lat, toAirport.lng]
                    ]}
                    pathOptions={{
                      color: '#06b6d4',
                      weight: 2,
                      opacity: 0.6,
                      dashArray: '5, 10',
                    }}
                  />
                );
              })}

              {/* Airport Markers */}
              {filteredAirports.map((airport) => (
                <Marker
                  key={airport.id}
                  position={[airport.lat, airport.lng]}
                  icon={createCustomIcon(getMarkerColor(airport.status))}
                  eventHandlers={{
                    click: () => setSelectedAirport(airport),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-bold text-lg">{airport.name}</h3>
                      <p className="text-gray-600 text-sm">{airport.code} • {airport.type}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm"><strong>Passengers:</strong> {airport.passengers.toLocaleString()}</p>
                        <p className="text-sm"><strong>Flights:</strong> {airport.flights.toLocaleString()}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Traffic circles */}
              {filteredAirports.map((airport) => (
                <Circle
                  key={`circle-${airport.id}`}
                  center={[airport.lat, airport.lng]}
                  radius={Math.sqrt(airport.passengers) * 10}
                  pathOptions={{
                    color: getMarkerColor(airport.status),
                    fillColor: getMarkerColor(airport.status),
                    fillOpacity: 0.2,
                    weight: 1,
                  }}
                />
              ))}
            </MapContainer>
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Traffic Level:</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-slate-400">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-slate-400">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-slate-400">Low</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-cyan-500" style={{ borderStyle: 'dashed' }}></div>
              <span className="text-sm text-slate-400">Flight Routes</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Airport Details */}
          {selectedAirport ? (
            <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedAirport.status === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
                  selectedAirport.status === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {selectedAirport.status.toUpperCase()} TRAFFIC
                </span>
                <button 
                  onClick={() => setSelectedAirport(null)}
                  className="text-slate-500 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-white">{selectedAirport.name}</h3>
              <p className="text-cyan-400 font-mono text-sm mt-1">{selectedAirport.code}</p>
              <p className="text-slate-400 text-sm mt-2">{selectedAirport.description}</p>
              
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="text-white capitalize">{selectedAirport.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Passengers</span>
                  <span className="text-white">{selectedAirport.passengers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Flights/Year</span>
                  <span className="text-white">{selectedAirport.flights.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Runways</span>
                  <span className="text-white">{selectedAirport.runways}</span>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-slate-400 text-sm">Airlines Operating</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedAirport.airlines.map((airline, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">
                      {airline}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
              <div className="text-center py-6">
                <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <p className="text-slate-400 text-sm">Click on a marker to view airport details</p>
              </div>
            </div>
          )}

          {/* Top Airports */}
          <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">Top Airports</h3>
            <div className="space-y-3">
              {ugandaAirports
                .sort((a, b) => b.passengers - a.passengers)
                .slice(0, 5)
                .map((airport, i) => (
                  <div 
                    key={airport.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedAirport(airport)}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-yellow-500 text-black' :
                      i === 1 ? 'bg-slate-400 text-black' :
                      i === 2 ? 'bg-orange-600 text-white' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{airport.name}</p>
                      <p className="text-slate-500 text-xs">{airport.code}</p>
                    </div>
                    <span className="text-slate-400 text-sm">
                      {airport.passengers >= 1000000 
                        ? `${(airport.passengers / 1000000).toFixed(1)}M`
                        : `${(airport.passengers / 1000).toFixed(0)}K`
                      }
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Airport Types */}
          <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">By Type</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>
                  </div>
                  <span className="text-slate-300">International</span>
                </div>
                <span className="text-white font-semibold">1</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>
                  </div>
                  <span className="text-slate-300">Domestic</span>
                </div>
                <span className="text-white font-semibold">4</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>
                  </div>
                  <span className="text-slate-300">Airstrips</span>
                </div>
                <span className="text-white font-semibold">5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Airports;

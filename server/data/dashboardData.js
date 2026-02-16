export const overviewData = {
  stats: {
    totalArrivals: 124592,
    totalDepartures: 118456,
    growthRate: 12.8,
    activeAirlines: 24,
  },
  topAirlines: [
    { name: 'Uganda Airlines', flights: 2450, percentage: 28 },
    { name: 'Ethiopian Airlines', flights: 1890, percentage: 22 },
    { name: 'Kenya Airways', flights: 1560, percentage: 18 },
    { name: 'Emirates', flights: 1230, percentage: 14 },
    { name: 'Qatar Airways', flights: 980, percentage: 11 },
    { name: 'Turkish Airlines', flights: 620, percentage: 7 },
  ],
  topDestinations: [
    { country: 'Kenya', city: 'Nairobi', passengers: 45230, trend: 'up' },
    { country: 'UAE', city: 'Dubai', passengers: 38450, trend: 'up' },
    { country: 'Ethiopia', city: 'Addis Ababa', passengers: 32100, trend: 'stable' },
    { country: 'South Africa', city: 'Johannesburg', passengers: 28900, trend: 'up' },
    { country: 'UK', city: 'London', passengers: 24500, trend: 'down' },
  ],
  recentActivity: [
    { type: 'arrival', flight: 'UR801', airline: 'Uganda Airlines', from: 'Dubai', time: '10 min ago', status: 'landed' },
    { type: 'departure', flight: 'ET302', airline: 'Ethiopian Airlines', to: 'Addis Ababa', time: '25 min ago', status: 'departed' },
    { type: 'arrival', flight: 'KQ456', airline: 'Kenya Airways', from: 'Nairobi', time: '45 min ago', status: 'landed' },
    { type: 'departure', flight: 'UR802', airline: 'Uganda Airlines', to: 'Johannesburg', time: '1 hr ago', status: 'departed' },
    { type: 'arrival', flight: 'EK723', airline: 'Emirates', from: 'Dubai', time: '2 hrs ago', status: 'landed' },
  ],
  monthlyData: [
    { month: 'Jan', arrivals: 8500, departures: 8200 },
    { month: 'Feb', arrivals: 9200, departures: 8900 },
    { month: 'Mar', arrivals: 10500, departures: 10100 },
    { month: 'Apr', arrivals: 9800, departures: 9500 },
    { month: 'May', arrivals: 11200, departures: 10800 },
    { month: 'Jun', arrivals: 12500, departures: 12100 },
    { month: 'Jul', arrivals: 13800, departures: 13200 },
    { month: 'Aug', arrivals: 12900, departures: 12500 },
    { month: 'Sep', arrivals: 11500, departures: 11200 },
    { month: 'Oct', arrivals: 10800, departures: 10500 },
    { month: 'Nov', arrivals: 11900, departures: 11500 },
    { month: 'Dec', arrivals: 14200, departures: 13700 },
  ],
};

export const analyticsData = {
  stats: {
    pageViews: '2.4M',
    uniqueVisitors: '38,542',
    avgSession: '4m 32s',
    bounceRate: '3.8',
  },
  monthlyTrend: [
    { month: 'Jan', value: 65 },
    { month: 'Feb', value: 72 },
    { month: 'Mar', value: 85 },
    { month: 'Apr', value: 78 },
    { month: 'May', value: 92 },
    { month: 'Jun', value: 98 },
    { month: 'Jul', value: 105 },
    { month: 'Aug', value: 95 },
    { month: 'Sep', value: 88 },
    { month: 'Oct', value: 82 },
    { month: 'Nov', value: 90 },
    { month: 'Dec', value: 110 },
  ],
  engagementMetrics: [
    { label: 'Direct Traffic', value: 45, color: 'cyan' },
    { label: 'Referral', value: 25, color: 'blue' },
    { label: 'Organic Search', value: 20, color: 'purple' },
    { label: 'Social Media', value: 10, color: 'pink' },
  ],
  hourlyData: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    value: 20 + ((i * 37) % 100),
  })),
  countryData: [
    { country: 'Kenya', code: 'KE', passengers: 45230, percentage: 28 },
    { country: 'UAE', code: 'AE', passengers: 38450, percentage: 24 },
    { country: 'Ethiopia', code: 'ET', passengers: 32100, percentage: 20 },
    { country: 'South Africa', code: 'ZA', passengers: 28900, percentage: 18 },
    { country: 'United Kingdom', code: 'GB', passengers: 16320, percentage: 10 },
  ],
};

export const aiInsightsData = {
  models: [
    { id: 1, name: 'Revenue Predictor', status: 'active', accuracy: 94.2, lastTrained: '2 days ago', predictions: 12450, version: 'v3.2' },
    { id: 2, name: 'User Flow Analyzer', status: 'active', accuracy: 91.8, lastTrained: '5 days ago', predictions: 8920, version: 'v2.1' },
    { id: 3, name: 'Anomaly Detector', status: 'training', accuracy: 89.5, lastTrained: '1 week ago', predictions: 5430, version: 'v1.8' },
    { id: 4, name: 'Demand Forecaster', status: 'active', accuracy: 96.1, lastTrained: '3 days ago', predictions: 15680, version: 'v4.0' },
  ],
  accuracyTrends: [
    { week: 'W1', value: 88 },
    { week: 'W2', value: 89 },
    { week: 'W3', value: 91 },
    { week: 'W4', value: 90 },
    { week: 'W5', value: 93 },
    { week: 'W6', value: 92 },
    { week: 'W7', value: 94 },
    { week: 'W8', value: 95 },
  ],
  inferenceData: [
    { hour: '00:00', requests: 450 },
    { hour: '04:00', requests: 280 },
    { hour: '08:00', requests: 890 },
    { hour: '12:00', requests: 1200 },
    { hour: '16:00', requests: 980 },
    { hour: '20:00', requests: 750 },
  ],
  performanceMetrics: [
    { model: 'Revenue Predictor', accuracy: 94.2, precision: 93.1, recall: 95.1, f1Score: 94.1 },
    { model: 'User Flow Analyzer', accuracy: 91.8, precision: 90.5, recall: 92.8, f1Score: 91.6 },
    { model: 'Anomaly Detector', accuracy: 89.5, precision: 88.2, recall: 90.4, f1Score: 89.3 },
    { model: 'Demand Forecaster', accuracy: 96.1, precision: 95.8, recall: 96.3, f1Score: 96.0 },
  ],
};

export const predictionsData = {
  stats: {
    nextMonth: '$172,000',
    passengers: '58,900',
    growth: '5.4%',
  },
  scenarioData: {
    optimistic: [120, 135, 150, 165, 180, 195, 210],
    baseline: [115, 125, 135, 145, 155, 165, 175],
    conservative: [110, 115, 120, 125, 130, 135, 140],
  },
  aiInsights: [
    { type: 'growth', title: 'Strong Revenue Growth Expected', description: 'Based on current trends and seasonal patterns, revenue is projected to increase by 18% in Q2.', confidence: 92, icon: '📈' },
    { type: 'trend', title: 'User Acquisition Trending Up', description: 'New user signups have increased 25% month-over-month, indicating strong market demand.', confidence: 88, icon: '👥' },
    { type: 'opportunity', title: 'Conversion Optimization Opportunity', description: 'Improving checkout flow could increase conversions by 12% based on user behavior analysis.', confidence: 85, icon: '💡' },
    { type: 'risk', title: 'Seasonal Slowdown Expected', description: 'Historical data suggests a 15% decrease in traffic during upcoming holiday period.', confidence: 90, icon: '⚠️' },
  ],
  forecastTimeline: [
    { month: 'Feb', actual: 42000, predicted: 41500 },
    { month: 'Mar', actual: 45000, predicted: 44800 },
    { month: 'Apr', actual: 48000, predicted: 47500 },
    { month: 'May', actual: null, predicted: 52000 },
    { month: 'Jun', actual: null, predicted: 55000 },
    { month: 'Jul', actual: null, predicted: 58000 },
  ],
};

export const airportsData = {
  airports: [
    { id: 1, name: 'Entebbe International Airport', code: 'EBB', type: 'international', lat: 0.0424, lng: 32.4435, passengers: 1892450, flights: 12480, status: 'high', description: 'Main international gateway to Uganda', runways: 2, airlines: ['Uganda Airlines', 'Ethiopian', 'Kenya Airways', 'Emirates', 'Turkish Airlines'] },
    { id: 2, name: 'Kajjansi Airfield', code: 'KAJ', type: 'domestic', lat: 0.1972, lng: 32.5528, passengers: 45200, flights: 890, status: 'medium', description: 'Training and charter flights', runways: 1, airlines: ['Aerolink Uganda', 'Private Charters'] },
    { id: 3, name: 'Jinja Airport', code: 'JIN', type: 'domestic', lat: 0.4478, lng: 33.1936, passengers: 12300, flights: 340, status: 'low', description: 'Regional airport serving Jinja', runways: 1, airlines: ['Aerolink Uganda'] },
    { id: 4, name: 'Gulu Airport', code: 'ULU', type: 'domestic', lat: 2.8056, lng: 32.2719, passengers: 28500, flights: 520, status: 'medium', description: 'Northern Uganda hub', runways: 1, airlines: ['Uganda Airlines', 'Aerolink Uganda'] },
    { id: 5, name: 'Arua Airport', code: 'RUA', type: 'domestic', lat: 3.0497, lng: 30.9108, passengers: 15600, flights: 280, status: 'low', description: 'West Nile region airport', runways: 1, airlines: ['Aerolink Uganda'] },
    { id: 6, name: 'Kasese Airfield', code: 'KSE', type: 'airstrip', lat: 0.183, lng: 30.1, passengers: 8900, flights: 180, status: 'low', description: 'Gateway to Rwenzori Mountains', runways: 1, airlines: ['Aerolink Uganda', 'Safari Charters'] },
    { id: 7, name: 'Pakuba Airfield', code: 'PAF', type: 'airstrip', lat: 2.3264, lng: 31.5, passengers: 22100, flights: 420, status: 'medium', description: 'Murchison Falls National Park', runways: 1, airlines: ['Aerolink Uganda', 'Safari Charters'] },
    { id: 8, name: 'Kidepo Airstrip', code: 'KID', type: 'airstrip', lat: 3.7167, lng: 33.75, passengers: 5400, flights: 120, status: 'low', description: 'Kidepo Valley National Park', runways: 1, airlines: ['Safari Charters'] },
    { id: 9, name: 'Soroti Airport', code: 'SRT', type: 'domestic', lat: 1.7278, lng: 33.6228, passengers: 18200, flights: 310, status: 'medium', description: 'Eastern Uganda regional airport', runways: 1, airlines: ['Uganda Airlines', 'Aerolink Uganda'] },
    { id: 10, name: 'Mbarara Airfield', code: 'MBQ', type: 'airstrip', lat: -0.555, lng: 30.6, passengers: 6800, flights: 150, status: 'low', description: 'Western Uganda regional strip', runways: 1, airlines: ['Aerolink Uganda'] },
  ],
  routes: [
    { from: 0, to: 3, passengers: 28500 },
    { from: 0, to: 6, passengers: 22100 },
    { from: 0, to: 8, passengers: 18200 },
    { from: 0, to: 4, passengers: 15600 },
    { from: 0, to: 2, passengers: 12300 },
    { from: 0, to: 5, passengers: 8900 },
    { from: 0, to: 7, passengers: 5400 },
  ],
};

export const dataManagement = {
  storage: {
    total: 438.6,
    used: 312.4,
    growth: 15.2,
    activeQueries: 1234,
  },
  bubbleData: {
    '1W': [
      { name: 'Flight Records', value: 12450, size: 85, x: 50, y: 45 },
      { name: 'Passengers', value: 8320, size: 65, x: 25, y: 35 },
      { name: 'Airlines', value: 4680, size: 50, x: 75, y: 30 },
      { name: 'Routes', value: 3240, size: 45, x: 30, y: 70 },
      { name: 'Airports', value: 2890, size: 40, x: 70, y: 65 },
    ],
    '1M': [
      { name: 'Flight Records', value: 54820, size: 90, x: 50, y: 45 },
      { name: 'Passengers', value: 38540, size: 70, x: 25, y: 35 },
      { name: 'Airlines', value: 18920, size: 55, x: 75, y: 28 },
      { name: 'Routes', value: 14560, size: 48, x: 28, y: 72 },
      { name: 'Airports', value: 11230, size: 42, x: 72, y: 68 },
    ],
    '3M': [
      { name: 'Flight Records', value: 168420, size: 100, x: 50, y: 45 },
      { name: 'Passengers', value: 124680, size: 78, x: 22, y: 32 },
      { name: 'Airlines', value: 56890, size: 60, x: 78, y: 25 },
      { name: 'Routes', value: 42350, size: 52, x: 25, y: 75 },
      { name: 'Airports', value: 31240, size: 45, x: 75, y: 70 },
    ],
    '1Y': [
      { name: 'Flight Records', value: 684520, size: 110, x: 50, y: 45 },
      { name: 'Passengers', value: 512340, size: 85, x: 20, y: 30 },
      { name: 'Airlines', value: 234560, size: 68, x: 80, y: 22 },
      { name: 'Routes', value: 178940, size: 58, x: 22, y: 78 },
      { name: 'Airports', value: 124680, size: 50, x: 78, y: 72 },
    ],
    'ALL': [
      { name: 'Flight Records', value: 2458920, size: 120, x: 50, y: 45 },
      { name: 'Passengers', value: 1845230, size: 95, x: 18, y: 28 },
      { name: 'Airlines', value: 856420, size: 75, x: 82, y: 20 },
      { name: 'Routes', value: 624580, size: 62, x: 20, y: 80 },
      { name: 'Airports', value: 456890, size: 55, x: 80, y: 75 },
    ],
  },
  bubbleStats: {
    '1W': { records: 31580, queries: 12450, syncs: 86 },
    '1M': { records: 138070, queries: 54820, syncs: 324 },
    '3M': { records: 423580, queries: 168420, syncs: 892 },
    '1Y': { records: 1735040, queries: 684520, syncs: 3456 },
    'ALL': { records: 6242040, queries: 2458920, syncs: 12840 },
  },
  databases: [
    { name: 'Production DB', type: 'PostgreSQL', size: '186.4 GB', status: 'healthy', latency: '12ms' },
    { name: 'Analytics DB', type: 'ClickHouse', size: '98.2 GB', status: 'healthy', latency: '8ms' },
    { name: 'Cache', type: 'Redis', size: '24.8 GB', status: 'healthy', latency: '1ms' },
    { name: 'Backup', type: 'S3', size: '312.4 GB', status: 'syncing', latency: '-' },
  ],
  recentImports: [
    { name: 'passenger_data_jan.xlsx', size: '2.4 MB', date: '2 hours ago', status: 'completed', records: 12450 },
    { name: 'airline_stats_q4.csv', size: '856 KB', date: '1 day ago', status: 'completed', records: 3420 },
    { name: 'flight_schedules.xlsx', size: '1.8 MB', date: '3 days ago', status: 'completed', records: 8920 },
  ],
  usageTrend: [
    { month: 'Aug', value: 245 },
    { month: 'Sep', value: 268 },
    { month: 'Oct', value: 285 },
    { month: 'Nov', value: 298 },
    { month: 'Dec', value: 312 },
    { month: 'Jan', value: 312.4 },
  ],
  transferMetrics: [
    { type: 'Inbound', value: 24.5, unit: 'GB/day', trend: 'up' },
    { type: 'Outbound', value: 18.2, unit: 'GB/day', trend: 'up' },
    { type: 'API Calls', value: '2.4M', unit: '/day', trend: 'up' },
  ],
};

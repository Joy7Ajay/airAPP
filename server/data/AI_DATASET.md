# AI Dataset

This project now supports data-driven AI dashboard values using:

- `server/data/ai_training_dataset.csv`

## CSV schema

- `date` (YYYY-MM-DD)
- `airport_code`
- `arrivals`
- `departures`
- `passengers`
- `revenue_usd`
- `delays`
- `cancellations`
- `weather_index`
- `fuel_price_usd_per_liter`

## How it is used

- `GET /api/dashboard/ai-insights`
- `GET /api/dashboard/predictions`
- AI/predictions export + refresh actions

If this file is missing or empty, endpoints automatically fall back to static defaults in `server/data/dashboardData.js`.

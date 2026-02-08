# Investment Portfolio Dashboard

A modern, responsive investment portfolio tracking application with real-time data visualization and persistent storage.

🌐 **Live Demo**: https://investment-portfolio-app-pearl.vercel.app/

## Features

- 📊 **Interactive Charts** - Portfolio allocation, asset distribution, and performance tracking
- 💰 **Multi-Currency Support** - Track investments in EUR, USD, and GBP
- 📈 **Real-time Metrics** - Total value, gains/losses, and return percentages
- ✏️ **Easy Management** - Add, edit, and delete holdings with a clean UI
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 💾 **Data Persistence** - All holdings stored in Supabase PostgreSQL database

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Build Tool**: Vite
- **Charts**: Chart.js
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Version Control**: Git & GitHub

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yordanstoyanovworks/investment-portfolio-app.git
   cd investment-portfolio-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

### Database Setup

Run the SQL in `schema.sql` in your Supabase SQL Editor to create the holdings table and seed with sample data.

### Production Build

```bash
npm run build
npm run preview
```

## Deployment

Deployed on Vercel with automatic deployments from the `master` branch.

### Environment Variables (Vercel)

Set these in your Vercel project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Future Enhancements

- [ ] User authentication (Supabase Auth)
- [ ] Real-time price updates via API
- [ ] Export data to CSV/PDF
- [ ] Multiple portfolio support
- [ ] Historical performance tracking
- [ ] Dark/Light theme toggle

## License

MIT

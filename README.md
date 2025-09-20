# 🚀 Quantum Business Simulator

> **Explore Every Possible Future for Your Business Decisions**

A cutting-edge Next.js application that uses BigQuery AI to generate parallel universe business scenarios, helping executives make data-driven strategic decisions.

![Quantum Business Simulator](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![BigQuery](https://img.shields.io/badge/BigQuery-AI-orange?style=for-the-badge&logo=google-cloud)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🎯 **Project Overview**

The Quantum Business Simulator is a revolutionary business intelligence tool that leverages BigQuery's AI capabilities to:

- **Generate Multiple Scenarios**: Explore 3-5 parallel universe outcomes for any business decision
- **Real Data Analysis**: Uses actual BigQuery public datasets (Google Analytics, Google Trends, Census data)
- **Interactive Visualizations**: Beautiful charts showing timeline comparisons and financial projections
- **AI-Powered Insights**: Leverages BigQuery's ML.GENERATE_TEXT, AI.FORECAST, and VECTOR_SEARCH functions
- **Executive-Ready Reports**: Professional summaries suitable for C-suite presentations

## 🛠 **Tech Stack**

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **AI/ML**: BigQuery AI Functions (AI.GENERATE, ML.GENERATE_TEXT, AI.FORECAST)
- **Data**: BigQuery Public Datasets (Google Analytics, Google Trends, Census, BLS)
- **Visualization**: Recharts, Framer Motion
- **Deployment**: Vercel (Serverless Functions)

## 🚀 **Quick Start**

### Prerequisites

1. **Google Cloud Project** with BigQuery API enabled
2. **Service Account** with BigQuery permissions
3. **Node.js 18+** and npm

### 1. Clone and Install

```bash
git clone <repository-url>
cd quantum-business-simulator
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Google Cloud credentials
```

Required environment variables:
```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Google Cloud Setup

#### Create Service Account:
```bash
# Create service account
gcloud iam service-accounts create quantum-simulator \
    --description="Service account for Quantum Business Simulator" \
    --display-name="Quantum Simulator"

# Grant BigQuery permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:quantum-simulator@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/bigquery.user"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:quantum-simulator@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/bigquery.dataViewer"

# Create and download key
gcloud iam service-accounts keys create key.json \
    --iam-account=quantum-simulator@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

#### Enable Required APIs:
```bash
gcloud services enable bigquery.googleapis.com
gcloud services enable bigquerystorage.googleapis.com
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 **Real Data Sources**

Our simulator uses these BigQuery public datasets:

### 🛒 **Google Analytics Sample**
- **Dataset**: `bigquery-public-data.google_analytics_sample`
- **Use Case**: E-commerce performance analysis, conversion optimization
- **Data**: Real Google Merchandise Store data (Aug 2016 - Aug 2017)

### 📈 **Google Trends**
- **Dataset**: `bigquery-public-data.google_trends`
- **Use Case**: Market timing analysis, consumer interest trends
- **Data**: Global search trends with market signals

### 💼 **Bureau of Labor Statistics**
- **Dataset**: `bigquery-public-data.bls`
- **Use Case**: Employment trends, wage analysis, economic indicators
- **Data**: Quarterly Census of Employment and Wages (1990-present)

### 🏘 **Census Data**
- **Dataset**: `bigquery-public-data.census_bureau_acs`
- **Use Case**: Demographic analysis, market sizing, location planning
- **Data**: American Community Survey data

## 🎮 **Demo Scenarios**

Try these example queries:

1. **E-commerce Launch Timing**
   ```
   "What if we launched our e-commerce platform during Q4 instead of Q1?"
   ```

2. **Market Expansion Strategy**
   ```
   "What if we expanded to high-income counties first instead of high-population areas?"
   ```

3. **Product Strategy**
   ```
   "What if we focused on mobile-first instead of desktop-first strategy?"
   ```

4. **Economic Timing**
   ```
   "What if we hired aggressively during the economic downturn instead of cutting costs?"
   ```

## 🚀 **Deployment**

### Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Configure Environment Variables** in Vercel Dashboard:
   - `GOOGLE_CLOUD_PROJECT_ID`
   - `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - `NEXT_PUBLIC_APP_URL`

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Environment Variables for Production

```bash
# In Vercel Dashboard, add these environment variables:
GOOGLE_CLOUD_PROJECT_ID=your-production-project-id
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 🏗 **Architecture**

```
quantum-business-simulator/
├── src/
│   ├── app/
│   │   ├── api/                    # API Routes
│   │   │   ├── scenarios/          # AI scenario generation
│   │   │   ├── vector-search/      # Similar case finder
│   │   │   └── forecast/           # Timeline predictions
│   │   ├── page.tsx               # Landing page
│   │   └── simulator/page.tsx     # Main simulator interface
│   ├── components/
│   │   └── TimelineVisualizer.tsx # Interactive charts
│   ├── lib/
│   │   ├── bigquery.ts           # BigQuery client
│   │   ├── ai-engine.ts          # Core AI logic
│   │   └── datasets.ts           # Real dataset utilities
│   └── types/                    # TypeScript definitions
├── vercel.json                   # Deployment config
└── README.md
```

## 🧠 **BigQuery AI Features Used**

### Generative AI Functions
- **AI.GENERATE_TABLE**: Structured scenario generation
- **ML.GENERATE_TEXT**: Executive summaries and insights
- **AI.FORECAST**: Timeline predictions and projections

### Vector Search
- **ML.GENERATE_EMBEDDING**: Query embeddings for similarity search
- **VECTOR_SEARCH**: Find similar historical business cases

### Real Data Analysis
- **Complex SQL Queries**: Multi-table joins across public datasets
- **Time Series Analysis**: Trend analysis and seasonal patterns
- **Statistical Functions**: Variance, correlation, and confidence intervals

## 🎨 **Design System**

- **Theme**: Dark mode with quantum physics aesthetic
- **Colors**: Electric blue (#00D4FF), Quantum purple (#8B5CF6), Neon green (#00FF88)
- **Typography**: Inter for UI, JetBrains Mono for code
- **Animations**: Framer Motion for smooth transitions

## 🔧 **Development**

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Project Structure

- **`/src/app`**: Next.js App Router pages and API routes
- **`/src/components`**: Reusable React components
- **`/src/lib`**: Utility functions and configurations
- **`/src/types`**: TypeScript type definitions


## 📈 **Performance**

- **Fast Loading**: Optimized for sub-3-second load times
- **Responsive Design**: Works perfectly on mobile and desktop
- **Error Handling**: Graceful fallbacks for API failures
- **Caching**: Smart caching for BigQuery results
- **Rate Limiting**: Built-in protection for demo environments

## 📄 **License**

MIT License - see LICENSE file for details

## 🙏 **Acknowledgments**

- **Google Cloud BigQuery Team** for amazing AI capabilities
- **BigQuery Public Datasets Program** for providing real business data
- **Next.js Team** for the excellent framework
- **Vercel** for seamless deployment platform

---

**Built with ❤️ for the BigQuery AI Hackathon**

*This project showcases the future of business intelligence - where AI meets real data to unlock strategic insights.*

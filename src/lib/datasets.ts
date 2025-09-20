// Real BigQuery public datasets for business analysis
export const PUBLIC_DATASETS = {
  // Google Analytics Sample - Real e-commerce data
  GOOGLE_ANALYTICS: {
    project: 'bigquery-public-data',
    dataset: 'google_analytics_sample',
    tables: {
      sessions: 'ga_sessions_*'
    },
    description: 'Real e-commerce data from Google Merchandise Store (Aug 2016 - Aug 2017)',
    useCase: 'E-commerce performance analysis, conversion optimization, customer behavior'
  },

  // Google Trends - Search trends and market signals
  GOOGLE_TRENDS: {
    project: 'bigquery-public-data',
    dataset: 'google_trends',
    tables: {
      top_terms: 'top_terms',
      top_rising_terms: 'top_rising_terms',
      international_top_terms: 'international_top_terms'
    },
    description: 'Global search trends data with market timing signals',
    useCase: 'Market timing analysis, consumer interest trends, demand forecasting'
  },

  // Bureau of Labor Statistics - Employment and wage data
  BLS_QCEW: {
    project: 'bigquery-public-data',
    dataset: 'bls',
    tables: {
      qcew: 'qcew_*'
    },
    description: 'Quarterly Census of Employment and Wages (1990-present)',
    useCase: 'Labor market analysis, wage trends, economic indicators'
  },

  // Census data for demographic analysis
  CENSUS_ACS: {
    project: 'bigquery-public-data',
    dataset: 'census_bureau_acs',
    tables: {
      county: 'county_*',
      state: 'state_*',
      zip_codes: 'zip_codes_*'
    },
    description: 'American Community Survey demographic data',
    useCase: 'Market sizing, demographic analysis, location planning'
  },

  // Economic indicators
  FRED_ECONOMIC: {
    project: 'bigquery-public-data',
    dataset: 'fred',
    tables: {
      series: 'series'
    },
    description: 'Federal Reserve Economic Data',
    useCase: 'Economic forecasting, market conditions analysis'
  }
};

// Business scenario templates based on real data patterns
export const SCENARIO_TEMPLATES = {
  ECOMMERCE_LAUNCH: {
    title: 'E-commerce Launch Timing Analysis',
    datasets: [PUBLIC_DATASETS.GOOGLE_ANALYTICS, PUBLIC_DATASETS.GOOGLE_TRENDS],
    query: `
      WITH revenue_patterns AS (
        SELECT 
          EXTRACT(MONTH FROM PARSE_DATE('%Y%m%d', date)) as launch_month,
          channelGrouping,
          AVG(totals.totalTransactionRevenue/1000000) as avg_revenue,
          COUNT(DISTINCT fullVisitorId) as unique_visitors,
          AVG(totals.pageviews) as avg_pageviews
        FROM \`bigquery-public-data.google_analytics_sample.ga_sessions_*\`
        WHERE totals.totalTransactionRevenue IS NOT NULL
        GROUP BY launch_month, channelGrouping
      ),
      trend_data AS (
        SELECT 
          EXTRACT(MONTH FROM week) as month,
          term,
          AVG(score) as avg_interest
        FROM \`bigquery-public-data.google_trends.top_terms\`
        WHERE term LIKE '%ecommerce%' OR term LIKE '%online shopping%'
        GROUP BY month, term
      )
      SELECT 
        r.launch_month,
        r.channelGrouping,
        r.avg_revenue,
        r.unique_visitors,
        t.avg_interest,
        CASE 
          WHEN r.avg_revenue > 100 AND t.avg_interest > 70 THEN 'Optimal timing with high revenue and market interest'
          WHEN r.avg_revenue > 50 OR t.avg_interest > 50 THEN 'Good timing with moderate performance'
          ELSE 'Challenging timing requiring strategic adjustments'
        END as scenario_outcome
      FROM revenue_patterns r
      LEFT JOIN trend_data t ON r.launch_month = t.month
      ORDER BY r.avg_revenue DESC, t.avg_interest DESC
      LIMIT 10
    `
  },

  MARKET_EXPANSION: {
    title: 'Market Expansion Timing Analysis',
    datasets: [PUBLIC_DATASETS.BLS_QCEW, PUBLIC_DATASETS.CENSUS_ACS],
    query: `
      WITH employment_trends AS (
        SELECT 
          area_fips,
          industry_code,
          year,
          quarter,
          AVG(avg_wkly_wage) as avg_wage,
          SUM(month3_emplvl) as total_employment
        FROM \`bigquery-public-data.bls.qcew_*\`
        WHERE industry_code IN ('10', '51', '52', '54') -- Key business sectors
        AND year >= 2020
        GROUP BY area_fips, industry_code, year, quarter
      ),
      demographic_data AS (
        SELECT 
          geo_id,
          total_pop,
          median_income,
          unemployment_rate
        FROM \`bigquery-public-data.census_bureau_acs.county_2020_5yr\`
        WHERE total_pop > 100000 -- Focus on larger markets
      )
      SELECT 
        e.area_fips,
        e.industry_code,
        e.avg_wage,
        e.total_employment,
        d.total_pop,
        d.median_income,
        CASE 
          WHEN e.total_employment > 10000 AND d.median_income > 60000 THEN 'High-potential market with strong economic indicators'
          WHEN e.total_employment > 5000 OR d.median_income > 45000 THEN 'Moderate market potential requiring targeted approach'
          ELSE 'Emerging market with growth potential but higher risk'
        END as expansion_scenario
      FROM employment_trends e
      JOIN demographic_data d ON e.area_fips = d.geo_id
      ORDER BY e.total_employment DESC, d.median_income DESC
      LIMIT 15
    `
  },

  PRODUCT_TIMING: {
    title: 'Product Launch Timing Analysis',
    datasets: [PUBLIC_DATASETS.GOOGLE_TRENDS],
    query: `
      WITH seasonal_trends AS (
        SELECT 
          term,
          EXTRACT(MONTH FROM week) as month,
          EXTRACT(YEAR FROM week) as year,
          AVG(score) as avg_score,
          STDDEV(score) as score_variance
        FROM \`bigquery-public-data.google_trends.top_terms\`
        WHERE week >= '2020-01-01'
        AND (term LIKE '%product%' OR term LIKE '%launch%' OR term LIKE '%new%')
        GROUP BY term, month, year
        HAVING COUNT(*) >= 4
      )
      SELECT 
        month,
        AVG(avg_score) as market_interest,
        AVG(score_variance) as market_volatility,
        COUNT(DISTINCT term) as trend_diversity,
        CASE 
          WHEN AVG(avg_score) > 70 AND AVG(score_variance) < 20 THEN 'Optimal launch window with high stable interest'
          WHEN AVG(avg_score) > 50 THEN 'Good launch timing with moderate market interest'
          WHEN AVG(score_variance) > 30 THEN 'Volatile market requiring careful timing'
          ELSE 'Conservative timing recommended due to low market signals'
        END as timing_recommendation
      FROM seasonal_trends
      GROUP BY month
      ORDER BY market_interest DESC, market_volatility ASC
    `
  }
};

// Real dataset query builders
export class DatasetQueryBuilder {
  /**
   * Build query for e-commerce performance analysis
   */
  static buildEcommerceAnalysisQuery(timeframe: string, channel?: string): string {
    const channelFilter = channel ? `AND channelGrouping = '${channel}'` : '';
    
    return `
      SELECT 
        date,
        channelGrouping,
        deviceCategory,
        SUM(totals.visits) as total_visits,
        SUM(totals.pageviews) as total_pageviews,
        SUM(totals.totalTransactionRevenue)/1000000 as revenue_usd,
        COUNT(DISTINCT fullVisitorId) as unique_visitors,
        AVG(totals.sessionQualityDim) as avg_session_quality
      FROM \`bigquery-public-data.google_analytics_sample.ga_sessions_*\`
      WHERE _TABLE_SUFFIX BETWEEN '${timeframe.replace('-', '')}'
      ${channelFilter}
      GROUP BY date, channelGrouping, deviceCategory
      ORDER BY date DESC
    `;
  }

  /**
   * Build query for market trend analysis
   */
  static buildMarketTrendQuery(keywords: string[], region?: string): string {
    const keywordFilter = keywords.map(k => `term LIKE '%${k}%'`).join(' OR ');
    const regionFilter = region ? `AND country_name = '${region}'` : '';
    
    return `
      SELECT 
        week,
        term,
        score,
        country_name,
        country_code,
        rank
      FROM \`bigquery-public-data.google_trends.international_top_terms\`
      WHERE (${keywordFilter})
      ${regionFilter}
      AND week >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR)
      ORDER BY week DESC, score DESC
      LIMIT 100
    `;
  }

  /**
   * Build query for employment and wage analysis
   */
  static buildEmploymentAnalysisQuery(industryCodes: string[], states?: string[]): string {
    const industryFilter = industryCodes.map(code => `'${code}'`).join(',');
    const stateFilter = states ? `AND area_fips IN (${states.map(s => `'${s}'`).join(',')})` : '';
    
    return `
      SELECT 
        area_fips,
        area_title,
        industry_code,
        industry_title,
        year,
        quarter,
        avg_wkly_wage,
        month3_emplvl as employment_level,
        total_qtrly_wages
      FROM \`bigquery-public-data.bls.qcew_*\`
      WHERE industry_code IN (${industryFilter})
      ${stateFilter}
      AND year >= 2020
      ORDER BY year DESC, quarter DESC, avg_wkly_wage DESC
    `;
  }

  /**
   * Build query for demographic market analysis
   */
  static buildDemographicAnalysisQuery(populationMin: number = 50000): string {
    return `
      SELECT 
        geo_id,
        county,
        state,
        total_pop,
        median_age,
        median_income,
        unemployment_rate,
        households,
        housing_units,
        CASE 
          WHEN median_income > 75000 AND unemployment_rate < 5 THEN 'High-value market'
          WHEN median_income > 50000 AND unemployment_rate < 8 THEN 'Moderate-value market'
          ELSE 'Emerging market'
        END as market_classification
      FROM \`bigquery-public-data.census_bureau_acs.county_2020_5yr\`
      WHERE total_pop >= ${populationMin}
      ORDER BY median_income DESC, total_pop DESC
      LIMIT 50
    `;
  }
}

// Industry mapping for dataset selection
export const INDUSTRY_DATASET_MAPPING = {
  'technology': [PUBLIC_DATASETS.GOOGLE_ANALYTICS, PUBLIC_DATASETS.GOOGLE_TRENDS],
  'ecommerce': [PUBLIC_DATASETS.GOOGLE_ANALYTICS, PUBLIC_DATASETS.GOOGLE_TRENDS],
  'retail': [PUBLIC_DATASETS.GOOGLE_ANALYTICS, PUBLIC_DATASETS.CENSUS_ACS],
  'manufacturing': [PUBLIC_DATASETS.BLS_QCEW, PUBLIC_DATASETS.CENSUS_ACS],
  'finance': [PUBLIC_DATASETS.BLS_QCEW, PUBLIC_DATASETS.FRED_ECONOMIC],
  'healthcare': [PUBLIC_DATASETS.CENSUS_ACS, PUBLIC_DATASETS.BLS_QCEW],
  'education': [PUBLIC_DATASETS.CENSUS_ACS, PUBLIC_DATASETS.BLS_QCEW],
  'default': [PUBLIC_DATASETS.GOOGLE_TRENDS, PUBLIC_DATASETS.CENSUS_ACS]
};

// Get relevant datasets for an industry
export function getRelevantDatasets(industry: string) {
  const key = industry.toLowerCase() as keyof typeof INDUSTRY_DATASET_MAPPING;
  return INDUSTRY_DATASET_MAPPING[key] || INDUSTRY_DATASET_MAPPING.default;
}

// Sample queries for different business scenarios
export const DEMO_QUERIES = {
  LAUNCH_TIMING: {
    query: "What if we launched our e-commerce platform during Q4 instead of Q1?",
    context: {
      industry: 'ecommerce',
      companySize: 'startup' as const,
      timeframe: '2016-2017',
      region: 'North America',
      businessModel: 'B2C E-commerce'
    },
    datasets: [PUBLIC_DATASETS.GOOGLE_ANALYTICS, PUBLIC_DATASETS.GOOGLE_TRENDS]
  },

  MARKET_EXPANSION: {
    query: "What if we expanded to high-income counties first instead of high-population areas?",
    context: {
      industry: 'retail',
      companySize: 'medium' as const,
      timeframe: '2020-2024',
      region: 'United States',
      businessModel: 'B2C Retail'
    },
    datasets: [PUBLIC_DATASETS.CENSUS_ACS, PUBLIC_DATASETS.BLS_QCEW]
  },

  PRODUCT_STRATEGY: {
    query: "What if we focused on mobile-first instead of desktop-first strategy?",
    context: {
      industry: 'technology',
      companySize: 'startup' as const,
      timeframe: '2016-2017',
      region: 'Global',
      businessModel: 'B2C SaaS'
    },
    datasets: [PUBLIC_DATASETS.GOOGLE_ANALYTICS, PUBLIC_DATASETS.GOOGLE_TRENDS]
  },

  ECONOMIC_TIMING: {
    query: "What if we hired aggressively during the economic downturn instead of cutting costs?",
    context: {
      industry: 'technology',
      companySize: 'medium' as const,
      timeframe: '2020-2024',
      region: 'United States',
      businessModel: 'B2B SaaS'
    },
    datasets: [PUBLIC_DATASETS.BLS_QCEW, PUBLIC_DATASETS.GOOGLE_TRENDS]
  }
};

// Helper functions for working with real datasets
export class RealDataAnalyzer {
  /**
   * Analyze e-commerce performance patterns from Google Analytics data
   */
  static async analyzeEcommercePatterns(scenario: string, timeframe: string) {
    const query = `
      WITH monthly_performance AS (
        SELECT 
          EXTRACT(YEAR FROM PARSE_DATE('%Y%m%d', date)) as year,
          EXTRACT(MONTH FROM PARSE_DATE('%Y%m%d', date)) as month,
          channelGrouping,
          deviceCategory,
          SUM(totals.totalTransactionRevenue)/1000000 as revenue_usd,
          COUNT(DISTINCT fullVisitorId) as unique_customers,
          AVG(totals.pageviews) as avg_pageviews,
          SUM(totals.visits) as total_visits
        FROM \`bigquery-public-data.google_analytics_sample.ga_sessions_*\`
        WHERE totals.totalTransactionRevenue IS NOT NULL
        GROUP BY year, month, channelGrouping, deviceCategory
      )
      SELECT 
        month,
        channelGrouping,
        deviceCategory,
        AVG(revenue_usd) as avg_monthly_revenue,
        AVG(unique_customers) as avg_monthly_customers,
        AVG(avg_pageviews) as avg_session_pageviews,
        STDDEV(revenue_usd) as revenue_volatility
      FROM monthly_performance
      GROUP BY month, channelGrouping, deviceCategory
      ORDER BY avg_monthly_revenue DESC
    `;
    
    return query;
  }

  /**
   * Analyze market timing using Google Trends data
   */
  static async analyzeMarketTiming(keywords: string[], region: string = 'US') {
    const keywordFilter = keywords.map(k => `'${k}'`).join(',');
    
    const query = `
      WITH trend_analysis AS (
        SELECT 
          EXTRACT(MONTH FROM week) as month,
          EXTRACT(YEAR FROM week) as year,
          term,
          AVG(score) as avg_interest,
          MAX(score) as peak_interest,
          STDDEV(score) as interest_volatility
        FROM \`bigquery-public-data.google_trends.top_terms\`
        WHERE country_code = '${region}'
        AND week >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 YEAR)
        GROUP BY month, year, term
      )
      SELECT 
        month,
        AVG(avg_interest) as market_interest_score,
        AVG(interest_volatility) as market_stability,
        COUNT(DISTINCT term) as trend_diversity,
        CASE 
          WHEN AVG(avg_interest) > 70 AND AVG(interest_volatility) < 15 THEN 'Optimal timing'
          WHEN AVG(avg_interest) > 50 THEN 'Good timing'
          WHEN AVG(interest_volatility) > 25 THEN 'Volatile market'
          ELSE 'Conservative timing recommended'
        END as timing_recommendation
      FROM trend_analysis
      GROUP BY month
      ORDER BY market_interest_score DESC
    `;
    
    return query;
  }

  /**
   * Analyze economic conditions for business decisions
   */
  static async analyzeEconomicConditions(industry: string, region: string) {
    const query = `
      WITH employment_by_industry AS (
        SELECT 
          area_title,
          industry_title,
          year,
          quarter,
          AVG(avg_wkly_wage) as avg_wage,
          SUM(month3_emplvl) as employment_level,
          LAG(SUM(month3_emplvl)) OVER (PARTITION BY area_title, industry_title ORDER BY year, quarter) as prev_employment
        FROM \`bigquery-public-data.bls.qcew_*\`
        WHERE industry_title LIKE '%${industry}%'
        AND year >= 2020
        GROUP BY area_title, industry_title, year, quarter
      )
      SELECT 
        area_title,
        industry_title,
        year,
        quarter,
        avg_wage,
        employment_level,
        CASE 
          WHEN prev_employment IS NOT NULL THEN 
            ROUND((employment_level - prev_employment) / prev_employment * 100, 2)
          ELSE NULL 
        END as employment_growth_rate,
        CASE 
          WHEN employment_level > prev_employment AND avg_wage > 50000 THEN 'Growing market with good wages'
          WHEN employment_level > prev_employment THEN 'Growing market'
          WHEN employment_level < prev_employment THEN 'Contracting market'
          ELSE 'Stable market'
        END as market_condition
      FROM employment_by_industry
      WHERE prev_employment IS NOT NULL
      ORDER BY employment_growth_rate DESC
      LIMIT 20
    `;
    
    return query;
  }
}

export default PUBLIC_DATASETS;

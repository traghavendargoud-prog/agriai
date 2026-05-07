export interface CropPrice {
  name: string;
  currentPrice: number;
  trend: 'up' | 'down';
  predictedNextWeek: number;
  confidence: number;
}

export interface WeatherData {
  district: string;
  temp: string;
  humidity: string;
  rainfall: string;
  condition: string;
  alerts: string[];
}

export interface YieldPrediction {
  expectedYield: string;
  riskScore: number;
  recommendations: string[];
}

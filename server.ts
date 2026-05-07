import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Mock Market Prices
  app.get("/api/market/prices", (req, res) => {
    const crops = ["Wheat", "Rice", "Cotton", "Soybean", "Sugarcane", "Tomato", "Onion"];
    const data = crops.map(crop => ({
      name: crop,
      currentPrice: Math.floor(Math.random() * 5000) + 1000,
      trend: Math.random() > 0.5 ? "up" : "down",
      predictedNextWeek: Math.floor(Math.random() * 5000) + 1000,
      confidence: Math.floor(Math.random() * 20) + 80
    }));
    res.json(data);
  });

  // Mock Weather
  app.get("/api/weather/:district", (req, res) => {
    res.json({
      district: req.params.district,
      temp: "32°C",
      humidity: "45%",
      rainfall: "12mm",
      condition: "Partly Cloudy",
      alerts: ["High heat warning for tomorrow"]
    });
  });

  // Mock Yield Prediction
  app.post("/api/predict/yield", (req, res) => {
    const { crop, area, soilType, district } = req.body;
    res.json({
      expectedYield: (area * (Math.random() * 2 + 1.5)).toFixed(2) + " Tonnes",
      riskScore: Math.floor(Math.random() * 30),
      recommendations: [
        "Increase irrigation in week 4",
        "Use nitrogen-rich fertilizer",
        "Monitor for whitefly pests"
      ]
    });
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AgriSight AI Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);

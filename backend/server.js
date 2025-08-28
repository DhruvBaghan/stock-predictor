const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Environment variables
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN;

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// API endpoint to fetch stock data
app.post('/api/stock-data', async (req, res) => {
    try {
        const { tickers, startDate, endDate } = req.body;
        
        if (!tickers || !Array.isArray(tickers)) {
            return res.status(400).json({ error: 'Invalid tickers provided' });
        }

        const stockData = await Promise.all(tickers.map(async (ticker) => {
            try {
                const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startDate}/${endDate}?adjusted=true&sort=asc&apikey=${POLYGON_API_KEY}`;
                
                const fetch = (await import('node-fetch')).default;
                const response = await fetch(url);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch data for ${ticker}: ${response.status}`);
                }
                
                if (!data.results || data.results.length === 0) {
                    throw new Error(`No data available for ${ticker}`);
                }
                
                return {
                    ticker: ticker,
                    results: data.results,
                    status: data.status
                };
            } catch (error) {
                console.error(`Error fetching data for ${ticker}:`, error);
                return {
                    ticker: ticker,
                    error: error.message
                };
            }
        }));
        
        res.json({ stockData });
    } catch (error) {
        console.error('Stock data fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch stock data' });
    }
});

// API endpoint to generate AI report
app.post('/api/ai-report', async (req, res) => {
    try {
        const { stockData, prompt } = req.body;
        
        // Try Hugging Face API first if token is available
        if (HUGGING_FACE_TOKEN && HUGGING_FACE_TOKEN !== 'YOUR_HUGGING_FACE_TOKEN') {
            try {
                const fetch = (await import('node-fetch')).default;
                const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: {
                            max_length: 200,
                            temperature: 0.9,
                            do_sample: true,
                            top_p: 0.95,
                            return_full_text: false
                        },
                        options: {
                            wait_for_model: true
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    let generatedText = '';
                    
                    if (Array.isArray(data) && data[0]?.generated_text) {
                        generatedText = data[0].generated_text;
                    } else if (data?.generated_text) {
                        generatedText = data.generated_text;
                    }

                    if (generatedText && generatedText.length > 50) {
                        return res.json({ report: generatedText });
                    }
                }
            } catch (aiError) {
                console.log('AI API failed, falling back to local analysis:', aiError.message);
            }
        }
        
        // Fallback analysis
        const fallbackReport = generateFallbackAnalysis(stockData);
        res.json({ report: fallbackReport });
        
    } catch (error) {
        console.error('AI report error:', error);
        res.status(500).json({ error: 'Failed to generate AI report' });
    }
});

// Fallback analysis function
function generateFallbackAnalysis(stockDataArray) {
    let analysis = "Hey there, trading superstar! 🚀 Here's what the numbers are whispering:\n\n";
    
    stockDataArray.forEach((data) => {
        if (data.error) {
            analysis += `❌ Couldn't fetch data for ${data.ticker} - ${data.error}\n\n`;
            return;
        }
        
        const ticker = data.ticker;
        const results = data.results;
        
        if (results && results.length > 0) {
            const firstDay = results[0];
            const lastDay = results[results.length - 1];
            const change = ((lastDay.c - firstDay.o) / firstDay.o) * 100;
            
            if (change > 2) {
                analysis += `🔥 ${ticker} is absolutely crushing it with a ${change.toFixed(1)}% surge! This baby's got momentum - HOLD tight or BUY more if you're feeling brave!\n\n`;
            } else if (change > 0) {
                analysis += `📈 ${ticker} showing steady gains at ${change.toFixed(1)}%. Not bad, not bad! HOLD your position and watch it climb.\n\n`;
            } else if (change > -2) {
                analysis += `📉 ${ticker} dipped ${Math.abs(change).toFixed(1)}% - could be your golden buying opportunity! HOLD or BUY the dip!\n\n`;
            } else {
                analysis += `⚠️ ${ticker} took a hit with ${Math.abs(change).toFixed(1)}% down. Time to think: HOLD for the comeback or SELL to protect your portfolio?\n\n`;
            }
        }
    });
    
    analysis += "Remember: Markets are wild beasts! This AI is having fun with your data, but always do your homework before making moves! 💰🎯";
    return analysis;
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend available at http://localhost:${PORT}`);
});
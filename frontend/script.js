class StockPredictor {
    constructor() {
        this.tickers = [];
        this.maxTickers = 3;
        this.baseURL = window.location.origin; // Will work for both local and deployed
        
        this.initializeElements();
        this.bindEvents();
        this.initializeDates();
    }

    initializeDates() {
        const today = new Date();
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        
        this.endDate = today.toISOString().split('T')[0];
        this.startDate = threeDaysAgo.toISOString().split('T')[0];
    }

    initializeElements() {
        this.tickerForm = document.getElementById('ticker-form');
        this.tickerInput = document.getElementById('ticker-input');
        this.tickersDisplay = document.getElementById('tickers-display');
        this.generateBtn = document.getElementById('generate-btn');
        this.actionPanel = document.querySelector('.action-panel');
        this.loadingPanel = document.getElementById('loading-panel');
        this.loadingMessage = document.getElementById('loading-message');
        this.outputPanel = document.getElementById('output-panel');
        this.reportContent = document.getElementById('report-content');
    }

    bindEvents() {
        this.tickerForm.addEventListener('submit', (e) => this.handleTickerSubmit(e));
        this.generateBtn.addEventListener('click', () => this.generateReport());
        this.tickerInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    handleTickerSubmit(e) {
        e.preventDefault();
        const ticker = this.tickerInput.value.trim();
        
        if (!ticker) {
            this.showError('Please enter a stock ticker');
            return;
        }
        
        if (ticker.length < 1) {
            this.showError('Ticker must be at least 1 character');
            return;
        }
        
        if (this.tickers.includes(ticker)) {
            this.showError('This ticker is already added');
            return;
        }
        
        if (this.tickers.length >= this.maxTickers) {
            this.showError(`Maximum ${this.maxTickers} tickers allowed`);
            return;
        }

        this.addTicker(ticker);
        this.tickerInput.value = '';
    }

    addTicker(ticker) {
        this.tickers.push(ticker);
        this.renderTickers();
        this.updateGenerateButton();
        this.clearError();
    }

    removeTicker(ticker) {
        this.tickers = this.tickers.filter(t => t !== ticker);
        this.renderTickers();
        this.updateGenerateButton();
    }

    renderTickers() {
        if (this.tickers.length === 0) {
            this.tickersDisplay.innerHTML = '<span class="placeholder-text">Your selected stocks will appear here...</span>';
            return;
        }

        this.tickersDisplay.innerHTML = '';
        this.tickers.forEach(ticker => {
            const tickerTag = document.createElement('div');
            tickerTag.className = 'ticker-tag';
            tickerTag.innerHTML = `
                ${ticker}
                <button class="remove-ticker" onclick="stockPredictor.removeTicker('${ticker}')">×</button>
            `;
            this.tickersDisplay.appendChild(tickerTag);
        });
    }

    updateGenerateButton() {
        this.generateBtn.disabled = this.tickers.length === 0;
    }

    showError(message) {
        this.clearError();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.tickerForm.appendChild(errorDiv);
    }

    clearError() {
        const existingError = this.tickerForm.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    async generateReport() {
        this.actionPanel.style.display = 'none';
        this.outputPanel.style.display = 'none';
        this.loadingPanel.style.display = 'flex';
        
        try {
            // Fetch real stock data from our backend
            this.loadingMessage.textContent = 'Fetching real-time stock data...';
            const stockData = await this.fetchStockData();
            
            this.loadingMessage.textContent = 'Generating AI analysis...';
            const report = await this.fetchAIReport(stockData);
            
            this.displayReport(report);
            
        } catch (error) {
            console.error('Error generating report:', error);
            this.showReportError('Failed to generate report. Please try again with different tickers.');
            this.resetToInput();
        }
    }

    async fetchStockData() {
        try {
            const response = await fetch(`${this.baseURL}/api/stock-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tickers: this.tickers,
                    startDate: this.startDate,
                    endDate: this.endDate
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.stockData;
            
        } catch (error) {
            throw new Error(`Stock data fetch failed: ${error.message}`);
        }
    }

    async fetchAIReport(stockData) {
        try {
            const prompt = `You are a trading guru. Analyze the following stock data and provide a brief, enthusiastic 150-word report with buy/sell/hold recommendations. Use an energetic style like "baby, this stock is on fire!" or "hold tight, we're going to the moon!":

Stock Data:
${JSON.stringify(stockData).substring(0, 1000)}...

Provide specific recommendations for each stock with reasoning.`;

            const response = await fetch(`${this.baseURL}/api/ai-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    stockData: stockData,
                    prompt: prompt
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.report;
            
        } catch (error) {
            throw new Error(`AI report failed: ${error.message}`);
        }
    }

    displayReport(report) {
        this.loadingPanel.style.display = 'none';
        this.reportContent.textContent = report;
        this.outputPanel.style.display = 'block';
        
        // Add a button to generate another report
        setTimeout(() => {
            const newReportBtn = document.createElement('button');
            newReportBtn.textContent = 'Generate New Report';
            newReportBtn.className = 'generate-btn';
            newReportBtn.style.marginTop = '20px';
            newReportBtn.onclick = () => this.resetToInput();
            this.outputPanel.appendChild(newReportBtn);
        }, 500);
    }

    showReportError(message) {
        this.loadingPanel.style.display = 'none';
        this.reportContent.innerHTML = `
            <div class="error-message">
                <strong>Oops!</strong> ${message}
                <br><br>
                <strong>Please try:</strong>
                <ul style="margin-top: 10px; margin-left: 20px;">
                    <li>Using different stock tickers (e.g., AAPL, TSLA, MSFT)</li>
                    <li>Checking that the tickers are valid and currently trading</li>
                    <li>Refreshing the page and trying again</li>
                </ul>
            </div>
        `;
        this.outputPanel.style.display = 'block';
        
        setTimeout(() => {
            const tryAgainBtn = document.createElement('button');
            tryAgainBtn.textContent = 'Try Again';
            tryAgainBtn.className = 'generate-btn';
            tryAgainBtn.style.marginTop = '20px';
            tryAgainBtn.onclick = () => this.resetToInput();
            this.outputPanel.appendChild(tryAgainBtn);
        }, 500);
    }

    resetToInput() {
        this.loadingPanel.style.display = 'none';
        this.outputPanel.style.display = 'none';
        this.actionPanel.style.display = 'block';
        
        // Clear the extra button if it exists
        const extraBtn = this.outputPanel.querySelector('button');
        if (extraBtn) extraBtn.remove();
    }
}

// Initialize the app
const stockPredictor = new StockPredictor();
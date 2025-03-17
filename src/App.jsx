// src/App.js or src/App.tsx
import React, { useState } from 'react';
import './App.css';

// Dummy data for demonstration
const DUMMY_RESPONSES = {
  "show all customers": {
    sql: "SELECT * FROM customers;",
    data: [
      { id: 1, name: "John Doe", email: "john@example.com", location: "New York" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", location: "Boston" },
      { id: 3, name: "Bob Johnson", email: "bob@example.com", location: "Chicago" }
    ]
  },
  "customers in new york": {
    sql: "SELECT * FROM customers WHERE location = 'New York';",
    data: [
      { id: 1, name: "John Doe", email: "john@example.com", location: "New York" }
    ]
  },
  "sales from last month": {
    sql: "SELECT * FROM sales WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH);",
    data: [
      { id: 101, customer_id: 1, amount: 250.00, sale_date: "2025-02-15" },
      { id: 102, customer_id: 2, amount: 125.50, sale_date: "2025-02-20" },
      { id: 103, customer_id: 3, amount: 340.75, sale_date: "2025-03-05" }
    ]
  }
};

function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLive) {
        // This will be used when your Lambda is ready
        // Replace with your actual API Gateway endpoint
        const response = await fetch('https://your-api-gateway-url.amazonaws.com/prod/text-to-sql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: query }),
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setResult(data);
      } else {
        // Use dummy data for now
        setTimeout(() => {
          const lowerQuery = query.toLowerCase();
          let matchedResponse = null;
          
          // Check for exact matches first
          if (DUMMY_RESPONSES[lowerQuery]) {
            matchedResponse = DUMMY_RESPONSES[lowerQuery];
          } else {
            // Check for partial matches
            for (const key in DUMMY_RESPONSES) {
              if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
                matchedResponse = DUMMY_RESPONSES[key];
                break;
              }
            }
          }
          
          if (matchedResponse) {
            setResult(matchedResponse);
          } else {
            // Generate generic response if no match
            setResult({
              sql: `SELECT * FROM table WHERE description LIKE '%${query}%';`,
              data: [
                { id: 1, name: "Example Data", description: "No specific match found" }
              ]
            });
          }
          
          setLoading(false);
        }, 500); // Simulate network delay
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request');
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="red-banner">
        Red Light Marketing
      </div>
      <header className="App-header">
        <h1>Text to SQL Converter</h1>
        <div className="mode-toggle">
          <label>
            <input
              type="checkbox"
              checked={isLive}
              onChange={() => setIsLive(!isLive)}
            />
            Use Live API (Currently using {isLive ? 'API Gateway' : 'dummy data'})
          </label>
        </div>
      </header>
      <main>
        <form onSubmit={handleSubmit} className="query-form">
          <div className="input-container">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your question in natural language (e.g., 'Show me all customers from New York')"
              rows={4}
              className="query-input"
              required
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Converting...' : 'Convert to SQL'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {result && (
          <div className="result-container">
            <h2>Generated SQL</h2>
            <pre className="sql-result">{result.sql}</pre>
            
            {result.data && (
              <>
                <h2>Query Results</h2>
                <div className="results-table-container">
                  <table className="results-table">
                    <thead>
                      <tr>
                        {Object.keys(result.data[0] || {}).map((key) => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.data.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((value, j) => (
                            <td key={j}>{value !== null ? value.toString() : 'NULL'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
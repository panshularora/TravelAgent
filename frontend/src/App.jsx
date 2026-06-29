import React, { useState, useEffect } from 'react';

const SUGGESTIONS = [
  "Plan a 3-day tropical trip to Goa, India",
  "5-day cultural holiday in Kyoto, Japan",
  "Weekend getaway to Paris, France",
  "Business trip to New York, USA for 4 days"
];

const LOADING_STAGES = [
  "Initiating Gemini Travel Agent...",
  "Analyzing requirements and target destination...",
  "Consulting weather radar for packing advice...",
  "Scanning airline networks for optimal flights...",
  "Searching luxury and budget hotel properties...",
  "Assembling customized daily itinerary timeline...",
  "Structuring final travel package..."
];

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');

  // Cycle through loading stages during fetch
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStage(LOADING_STAGES[0]);
      let stageIndex = 0;
      interval = setInterval(() => {
        stageIndex = (stageIndex + 1) % LOADING_STAGES.length;
        setLoadingStage(LOADING_STAGES[stageIndex]);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setError('');
    setPlan(null);

    try {
      const response = await fetch('http://localhost:8000/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: q }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status code: ${response.status}`);
      }

      const data = await response.json();
      setPlan(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to connect to the backend server. Make sure it is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // Safe parsing for the itinerary object/array
  const getParsedItinerary = () => {
    if (!plan || !plan.itinerary) return [];
    
    if (Array.isArray(plan.itinerary)) {
      return plan.itinerary;
    }
    
    if (typeof plan.itinerary === 'object') {
      return Object.entries(plan.itinerary).map(([key, val]) => {
        const dayNum = parseInt(key.replace(/\D/g, '')) || key;
        return { day: dayNum, activity: val };
      }).sort((a, b) => {
        if (typeof a.day === 'number' && typeof b.day === 'number') {
          return a.day - b.day;
        }
        return 0;
      });
    }
    
    return [];
  };

  const itineraryItems = getParsedItinerary();

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon">✦</div>
          <div className="logo-text">Aero<span>Agent</span></div>
        </div>
        <div className="status-badge">
          <div className="status-dot"></div>
          Agent Online
        </div>
      </header>

      {/* Main Search */}
      <section className="search-container">
        <h1 className="search-title">
          Where is your <span>next adventure?</span>
        </h1>
        <p className="search-subtitle">
          Type any destination, duration, or budget. Our AI Travel Agent will analyze weather, book stubs, search flights/hotels, and design a custom itinerary.
        </p>

        <div className="search-box-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="e.g. Goa trip next week, check flight and hotel options..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={loading}
          />
          <button 
            className="search-btn" 
            onClick={() => handleSearch()} 
            disabled={loading}
          >
            {loading ? 'Thinking...' : 'Generate Plan'}
          </button>
        </div>

        <div className="suggestions-list">
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              className="suggestion-tag"
              onClick={() => handleSuggestionClick(s)}
              disabled={loading}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Loading Panel */}
      {loading && (
        <div className="loading-panel">
          <div className="loading-spinner-wrapper">
            <div className="loading-spinner"></div>
            <div className="loading-spinner-inner"></div>
          </div>
          <div className="loading-text">Co-pilot is working</div>
          <div className="loading-subtext">{loadingStage}</div>
        </div>
      )}

      {/* Error Card */}
      {error && (
        <div className="glass-card info-required-card" style={{ marginTop: '20px' }}>
          <div className="info-header">
            <span>⚠</span> Connection Error
          </div>
          <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#f72585' }}>
            {error}
          </p>
          <div style={{ marginTop: '16px', fontSize: '13px', color: '#9ea0b0' }}>
            💡 Try running the backend server first: <code>python -m uvicorn app.main:app --reload</code>
          </div>
        </div>
      )}

      {/* Dashboard Result */}
      {plan && !loading && (
        <div className="dashboard-grid">
          {/* Missing Information / Clarification Alert */}
          {plan.needs_more_information && (
            <div className="info-required-card glass-card">
              <div className="info-header">
                <span>ℹ</span> More Information Required
              </div>
              <p style={{ fontSize: '14px', marginBottom: '12px' }}>
                The agent needs some additional details to generate the perfect plan:
              </p>
              <ul className="info-list">
                {plan.missing_fields && plan.missing_fields.map((field, i) => (
                  <li key={i}>{field}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Overview Card */}
          {plan.summary && (
            <div className="glass-card overview-card">
              <div className="card-header">
                <div className="card-title">
                  <span className="card-title-icon">📋</span> Overview
                </div>
              </div>
              <p className="overview-text">{plan.summary}</p>
            </div>
          )}

          {/* Weather Card */}
          {plan.weather && (plan.weather.city || plan.weather.temperature) && (
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">
                  <span className="card-title-icon">🌤</span> Weather Forecast
                </div>
              </div>
              <div className="weather-details">
                <div className="weather-icon-lg">
                  {plan.weather.condition?.toLowerCase().includes('rain') ? '🌧️' : 
                   plan.weather.condition?.toLowerCase().includes('cloud') ? '☁️' : 
                   plan.weather.condition?.toLowerCase().includes('snow') ? '❄️' : '☀️'}
                </div>
                <div className="weather-stats">
                  <div className="weather-temp">{plan.weather.temperature}°C</div>
                  <div className="weather-condition">{plan.weather.condition}</div>
                  <div className="weather-city">{plan.weather.city}</div>
                </div>
              </div>
            </div>
          )}

          {/* Flights Card */}
          {plan.flights && plan.flights.length > 0 && (
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">
                  <span className="card-title-icon">✈</span> Flight Options
                </div>
              </div>
              <div className="item-list">
                {plan.flights.map((flight, idx) => (
                  <div key={idx} className="list-item">
                    <div className="item-main">
                      <div className="item-name">{flight.airline}</div>
                      <div className="item-sub">Duration: {flight.duration}</div>
                    </div>
                    <div className="item-side">
                      <div className="item-price">₹{flight.price}</div>
                      <div className="item-badge">Economy</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hotels Card */}
          {plan.hotels && plan.hotels.length > 0 && (
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">
                  <span className="card-title-icon">🏨</span> Recommended Stays
                </div>
              </div>
              <div className="item-list">
                {plan.hotels.map((hotel, idx) => (
                  <div key={idx} className="list-item">
                    <div className="item-main">
                      <div className="item-name">{hotel.name}</div>
                      <div className="item-rating">★ {hotel.rating} / 5</div>
                    </div>
                    <div className="item-side">
                      <div className="item-price">₹{hotel.price}</div>
                      <div className="item-sub">per night</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itinerary Timeline */}
          {itineraryItems.length > 0 && (
            <div className="glass-card timeline-card">
              <div className="card-header">
                <div className="card-title">
                  <span className="card-title-icon">🗺</span> Day-by-Day Itinerary
                </div>
              </div>
              <div className="timeline">
                {itineraryItems.map((item, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-day">Day {item.day}</div>
                    <div className="timeline-content">
                      {item.activity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty fallback within results */}
          {!plan.summary && itineraryItems.length === 0 && (
            <div className="glass-card welcome-card">
              <div className="welcome-icon">🏜️</div>
              <div className="welcome-title">Empty Response</div>
              <p className="welcome-text">The agent successfully returned a JSON schema response, but did not populate details. Try writing a more descriptive query!</p>
            </div>
          )}
        </div>
      )}

      {/* Initial Welcome Screen */}
      {!plan && !loading && !error && (
        <div className="dashboard-grid">
          <div className="glass-card welcome-card">
            <div className="welcome-icon">🧭</div>
            <div className="welcome-title">Your AI Agent is Ready</div>
            <p className="welcome-text">
              Simply input your query or select one of the suggested tags above. The agent will run multiple tasks recursively, including weather checking, flight scraping, and itinerary planning.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        Powered by Google Gemini 2.5 & FastAPI | Built with Antigravity
      </footer>
    </div>
  );
}

export default App;

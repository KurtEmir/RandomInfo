import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FloatingCanvas from './components/FloatingCanvas';
import DetailView from './components/DetailView';
import { fetchDailyWikipediaTopics } from './utils/wikipedia';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyTopics, setDailyTopics] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

  // Fetch Wikipedia topics with LocalStorage caching by date
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(currentDate.getDate()).padStart(2, '0');
    const dateString = `${yyyy}-${mm}-${dd}`;
    const cacheKey = `wikipedia_daily_topics_v5_${dateString}`;

    // 1. Try to load from LocalStorage cache first
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed && parsed.length > 0) {
          setDailyTopics(parsed);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Cache parsing failed, fetching fresh data from Wikipedia...', e);
      }
    }

    // 2. Fetch fresh topics from Turkish Wikipedia API
    fetchDailyWikipediaTopics(currentDate)
      .then((topics) => {
        if (!active) return;
        if (topics.length === 0) {
          throw new Error('Wikipedia üzerinden kategori başlığı bulunamadı.');
        }
        setDailyTopics(topics);

        // Save to cache for the day
        localStorage.setItem(cacheKey, JSON.stringify(topics));
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setError('Wikipedia bağlantısı kurulamadı. İnternetinizi kontrol edip tekrar deneyin.');
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentDate]);

  // URL Hash-based routing to support shareable links and browser Back/Forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash && dailyTopics.length > 0) {
        const found = dailyTopics.find((t) => t.id === hash);
        if (found) {
          setSelectedTopic(found);
          return;
        }
      }
      setSelectedTopic(null);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // initial check on load / when topics load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [dailyTopics]);

  const handleCardSelect = (topic) => {
    window.location.hash = topic.id;
  };

  const handleBack = () => {
    window.location.hash = '';
  };

  const handleLuckyPick = () => {
    if (dailyTopics.length === 0) return;
    const randomIndex = Math.floor(Math.random() * dailyTopics.length);
    handleCardSelect(dailyTopics[randomIndex]);
  };

  // Switch to next day to test how seeded selections change
  const handleTestNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    handleBack(); // Clear detail if open
  };

  const handleResetDay = () => {
    setCurrentDate(new Date());
    handleBack();
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();

  return (
    <div className="app-container">
      {isLoading ? (
        <div className="loading-state">
          <div className="loader-card">
            <h2>🧠 Wikipedia Bilgileri Yükleniyor...</h2>
            <p>Bugünün konuları Türkçe Wikipedia üzerinden canlı olarak derleniyor.</p>
            <div className="custom-spinner"></div>
          </div>
        </div>
      ) : error ? (
        <div className="error-state">
          <div className="error-card">
            <h2>⚠️ Wikipedia Bağlantı Hatası</h2>
            <p>{error}</p>
            <button onClick={() => setCurrentDate(new Date(currentDate.getTime()))}>Tekrar Dene</button>
          </div>
        </div>
      ) : selectedTopic ? (
        <DetailView
          topic={selectedTopic}
          onBack={handleBack}
          allDailyTopics={dailyTopics}
          onSelectTopic={handleCardSelect}
        />
      ) : (
        <>
          <Header
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            currentDate={currentDate}
            speedMultiplier={speedMultiplier}
            setSpeedMultiplier={setSpeedMultiplier}
          />

          {/* Hero Banner with Lucky Pick and Date-testing utilities */}
          <div className="hero-banner">
            <div className="hero-info">
              <span>💡 Bugün Wikipedia'dan derlenen <strong>{dailyTopics.length} adet</strong> ilginç konu akıyor!</span>
            </div>
            <div className="hero-actions">
              <button onClick={handleLuckyPick} className="lucky-btn">
                🎲 Şansıma Rastgele Seç!
              </button>

              <div className="test-controls">
                {isToday ? (
                  <button onClick={handleTestNextDay} className="test-btn">
                    ⏩ Yarının Konularını Çek
                  </button>
                ) : (
                  <button onClick={handleResetDay} className="test-btn reset-btn">
                    🔄 Bugüne Dön
                  </button>
                )}
              </div>
            </div>
          </div>

          <FloatingCanvas
            topics={dailyTopics}
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            isPaused={isPaused}
            onCardSelect={handleCardSelect}
            speedMultiplier={speedMultiplier}
          />
        </>
      )}

      {/* Retro Neo-brutalist Footer */}
      <footer className="app-footer">
        <p>© 2026 BİLGİ AKIŞI.</p>
        <p className="footer-credit">Emir Kurt 🐺</p>
      </footer>

      <style>{`
        /* Loading and Error states styling */
        .loading-state, .error-state {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
        }
        .loader-card, .error-card {
          max-width: 500px;
          padding: 40px;
          border: 3px solid var(--color-border);
          border-radius: 20px;
          background-color: var(--color-white);
          box-shadow: 8px 8px 0px 0px var(--color-shadow);
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }
        .custom-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid var(--color-gray);
          border-top: 5px solid var(--color-border);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .error-card button {
          align-self: center;
          margin-top: 10px;
          background-color: var(--color-tarih);
        }

        .hero-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
          padding: 15px 25px;
          border: 3px solid var(--color-border);
          background-color: var(--color-white);
          border-radius: 12px;
          box-shadow: 4px 4px 0px 0px var(--color-shadow);
          margin-top: 5px;
        }
        .hero-info {
          font-family: var(--font-body);
          font-size: 1.05rem;
          font-weight: 500;
        }
        .hero-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .lucky-btn {
          background-color: var(--color-sanat);
          font-size: 0.95rem;
          padding: 8px 16px;
        }
        .test-btn {
          background-color: var(--color-white);
          border-color: #888;
          color: #444;
          font-size: 0.85rem;
          padding: 6px 12px;
          box-shadow: 2px 2px 0px 0px #888;
        }
        .test-btn:hover {
          border-color: var(--color-border);
          color: var(--color-text);
          box-shadow: 3px 3px 0px 0px var(--color-shadow);
        }
        .reset-btn {
          background-color: var(--color-bilim);
          border-color: var(--color-border);
          color: var(--color-text);
          box-shadow: 2px 2px 0px 0px var(--color-shadow);
        }
        .app-footer {
          margin-top: 30px;
          padding: 20px 0;
          text-align: center;
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: #666;
          border-top: 3px dashed var(--color-border);
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .footer-credit {
          font-weight: 700;
          color: var(--color-text);
        }
        @media (max-width: 768px) {
          .loader-card, .error-card {
            width: 100%;
            max-width: 90%;
            padding: 25px 20px;
          }
          .hero-banner {
            flex-direction: column;
            text-align: center;
            padding: 15px;
          }
          .hero-actions {
            justify-content: center;
            width: 100%;
          }
          .lucky-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default App;

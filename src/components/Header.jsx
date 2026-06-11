import React from 'react';

export default function Header({
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  isPaused,
  setIsPaused,
  currentDate,
  speedMultiplier,
  setSpeedMultiplier
}) {
  
  const categories = [
    { id: 'all', name: '🧠 Hepsi', colorClass: 'btn-all' },
    { id: 'tarih', name: '📜 Tarih', colorClass: 'bg-tarih' },
    { id: 'teknoloji', name: '⚡ Teknoloji', colorClass: 'bg-teknoloji' },
    { id: 'spor', name: '🏆 Spor', colorClass: 'bg-spor' },
    { id: 'ekonomi', name: '💸 Ekonomi', colorClass: 'bg-ekonomi' },
    { id: 'bilim', name: '🔬 Bilim', colorClass: 'bg-bilim' },
    { id: 'sanat', name: '🎨 Sanat', colorClass: 'bg-sanat' }
  ];

  // Format date to Turkish locale
  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <header className="header-container">
      <div className="header-top">
        <div className="logo-section">
          <h1 className="logo-title">BİLGİ AKIŞI</h1>
          <span className="date-badge">📅 {formatDate(currentDate)}</span>
        </div>
        <p className="logo-subtitle">
          Her gün yenilenen bilgi okyanusu. İlginç konu başlıklarını yakala, tıkla ve gizemleri keşfet!
        </p>
      </div>

      <div className="header-controls">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Konu başlığı ara... 🔍"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-wrapper">
          {categories.map((cat) => {
            const isActive = activeFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`filter-btn ${isActive ? cat.colorClass : ''}`}
                style={{
                  transform: isActive ? 'translate(-2px, -2px)' : 'none',
                  boxShadow: isActive ? '5px 5px 0px 0px var(--color-shadow)' : '3px 3px 0px 0px var(--color-shadow)',
                  fontWeight: isActive ? '700' : '500',
                  backgroundColor: isActive ? undefined : '#ffffff'
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="animation-toggle-wrapper">
          <button 
            onClick={() => setIsPaused(!isPaused)} 
            className="pause-btn"
            style={{
              backgroundColor: isPaused ? 'var(--color-spor)' : 'var(--color-white)'
            }}
          >
            {isPaused ? '▶️ Akışı Başlat' : '⏸️ Akışı Durdur'}
          </button>

          {!isPaused && (
            <div className="speed-control-wrapper">
              <label htmlFor="speed-slider" className="speed-label">⚡ Hız: {speedMultiplier.toFixed(1)}x</label>
              <input
                id="speed-slider"
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                className="speed-slider"
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        .header-container {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .header-top {
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-bottom: 3px solid var(--color-border);
          padding-bottom: 15px;
        }
        .logo-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
        }
        .logo-title {
          font-size: 2.8rem;
          letter-spacing: -1px;
          text-shadow: 2px 2px 0px var(--color-white);
          -webkit-text-stroke: 1px var(--color-border);
        }
        .logo-subtitle {
          font-size: 1.1rem;
          color: #555;
          font-weight: 500;
        }
        .date-badge {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.1rem;
          background-color: var(--color-white);
          border: 3px solid var(--color-border);
          border-radius: 12px;
          padding: 8px 16px;
          box-shadow: 4px 4px 0px 0px var(--color-shadow);
        }
        .header-controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 15px;
          justify-content: space-between;
        }
        .search-wrapper {
          flex: 1;
          min-width: 250px;
        }
        .search-input {
          width: 100%;
          font-size: 1.05rem;
          padding: 12px 18px;
        }
        .filters-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .filter-btn {
          font-size: 0.95rem;
          padding: 8px 16px;
        }
        .btn-all {
          background-color: var(--color-gray);
        }
        .animation-toggle-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .pause-btn {
          font-size: 0.95rem;
          padding: 8px 16px;
        }
        .speed-control-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: var(--color-white);
          border: 3px solid var(--color-border);
          border-radius: 10px;
          padding: 6px 12px;
          box-shadow: 3px 3px 0px 0px var(--color-shadow);
          width: 175px; /* Fixed width to prevent parent container shifting */
          justify-content: space-between;
        }
        .speed-label {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.9rem;
          white-space: nowrap;
          width: 65px; /* Fixed label width to prevent slider shifts when value updates */
          display: inline-block;
          text-align: left;
        }
        .speed-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 80px;
          height: 8px;
          border-radius: 4px;
          background: var(--color-gray);
          outline: none;
          border: 2px solid var(--color-border);
          cursor: pointer;
        }
        .speed-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--color-sanat);
          border: 2px solid var(--color-border);
          cursor: pointer;
          box-shadow: 1px 1px 0px var(--color-shadow);
          transition: transform 0.1s ease;
        }
        .speed-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        @media (max-width: 768px) {
          .logo-title {
            font-size: 2.2rem;
          }
          .header-controls {
            flex-direction: column;
            align-items: stretch;
          }
          .search-wrapper {
            width: 100%;
          }
          .filters-wrapper {
            justify-content: center;
          }
          .animation-toggle-wrapper {
            display: flex;
            justify-content: center;
          }
        }
      `}</style>
    </header>
  );
}

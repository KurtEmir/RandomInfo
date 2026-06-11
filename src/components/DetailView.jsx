import React, { useState } from 'react';

export default function DetailView({
  topic,
  onBack,
  allDailyTopics,
  onSelectTopic
}) {
  const [showToast, setShowToast] = useState(false);

  const categoryLabels = {
    tarih: { text: '📜 TARİH', class: 'bg-tarih' },
    teknoloji: { text: '⚡ TEKNOLOJİ', class: 'bg-teknoloji' },
    spor: { text: '🏆 SPOR', class: 'bg-spor' },
    ekonomi: { text: '💸 EKONOMİ', class: 'bg-ekonomi' },
    bilim: { text: '🔬 BİLİM', class: 'bg-bilim' },
    sanat: { text: '🎨 SANAT', class: 'bg-sanat' }
  };

  const currentLabel = categoryLabels[topic.category] || { text: topic.category, class: 'bg-gray' };

  // Select 3 random other topics from today's list
  const otherTopics = allDailyTopics
    .filter(t => t.id !== topic.id)
    .slice(0, 3);

  const handleCopyLink = () => {
    // We can simulate copying a link with the topic ID as a hash
    const shareUrl = `${window.location.origin}${window.location.pathname}#${topic.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    });
  };

  return (
    <div className="detail-container">
      <div className="detail-card">
        {/* Header containing category and title */}
        <div className={`detail-header ${currentLabel.class}`}>
          <button onClick={onBack} className="back-arrow-btn">
            ⬅️ Geri Dön
          </button>
          
          <div className="detail-badge-wrapper">
            <span className="badge-category">{currentLabel.text}</span>
          </div>
          
          <h2 className="detail-title">{topic.title}</h2>
        </div>

        {/* Article content */}
        <div className="detail-body">
          <p className="detail-intro">{topic.shortDescription}</p>
          <div className="detail-divider"></div>
          <p className="detail-text">{topic.detailText}</p>
        </div>

        {/* Footer actions */}
        <div className="detail-footer">
          <button onClick={handleCopyLink} className="share-btn">
            🔗 Bu Konuyu Paylaş
          </button>
          <span className="footer-fun-fact">🧠 Bilgi güçtür!</span>
        </div>
      </div>

      {/* Suggested reading section at the bottom */}
      {otherTopics.length > 0 && (
        <div className="suggestions-container">
          <h3 className="suggestions-title">👀 Günün Diğer İlginç Konuları</h3>
          <div className="suggestions-grid">
            {otherTopics.map((other) => {
              const otherLabel = categoryLabels[other.category] || { text: other.category, class: 'bg-gray' };
              return (
                <div
                  key={other.id}
                  onClick={() => onSelectTopic(other)}
                  className={`suggestion-card ${otherLabel.class}`}
                >
                  <span className="suggestion-badge">{otherLabel.text}</span>
                  <h4 className="suggestion-card-title">{other.title}</h4>
                  <p className="suggestion-card-desc">{other.shortDescription}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Retro Cartoon Toast */}
      {showToast && (
        <div className="toast">
          🚀 Bağlantı panoya kopyalandı! Arkadaşlarınla paylaş!
        </div>
      )}

      <style>{`
        .back-arrow-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          font-size: 0.9rem;
          padding: 6px 12px;
          background-color: var(--color-white);
          z-index: 10;
        }
        .detail-badge-wrapper {
          margin-top: 25px;
          margin-bottom: 15px;
        }
        .badge-category {
          display: inline-block;
          padding: 6px 14px;
          font-family: var(--font-heading);
          font-size: 0.85rem;
          font-weight: 700;
          border: 3px solid var(--color-border);
          border-radius: 8px;
          background-color: var(--color-white);
          box-shadow: 2px 2px 0px 0px var(--color-shadow);
        }
        .detail-title {
          font-size: 2.5rem;
          line-height: 1.2;
          letter-spacing: -0.5px;
          -webkit-text-stroke: 0.5px var(--color-border);
        }
        .detail-intro {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.6;
          color: #333;
          margin-bottom: 20px;
        }
        .detail-divider {
          height: 3px;
          background-color: var(--color-border);
          margin-bottom: 25px;
          position: relative;
        }
        .detail-divider::after {
          content: '💡';
          position: absolute;
          top: -14px;
          left: 30px;
          background-color: var(--color-white);
          padding: 0 10px;
          font-size: 1.2rem;
        }
        .detail-text {
          text-align: justify;
        }
        .share-btn {
          background-color: var(--color-white);
        }
        .footer-fun-fact {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.05rem;
        }
        
        /* Suggestions styling */
        .suggestions-container {
          max-width: 800px;
          width: 100%;
          margin-top: 40px;
        }
        .suggestions-title {
          font-size: 1.6rem;
          margin-bottom: 20px;
          text-align: center;
        }
        .suggestions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }
        .suggestion-card {
          border: var(--border-width) solid var(--color-border);
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          box-shadow: 4px 4px 0px 0px var(--color-shadow);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .suggestion-card:hover {
          transform: translate(-4px, -4px);
          box-shadow: 8px 8px 0px 0px var(--color-shadow);
        }
        .suggestion-badge {
          display: inline-block;
          align-self: flex-start;
          font-family: var(--font-heading);
          font-size: 0.7rem;
          font-weight: 700;
          border: 2px solid var(--color-border);
          border-radius: 6px;
          padding: 2px 6px;
          background-color: var(--color-white);
        }
        .suggestion-card-title {
          font-size: 1.2rem;
          line-height: 1.3;
        }
        .suggestion-card-desc {
          font-size: 0.9rem;
          color: #444;
          line-height: 1.4;
          margin-top: 5px;
        }
        
        @media (max-width: 768px) {
          .back-arrow-btn {
            position: relative;
            top: 0;
            left: 0;
            margin-bottom: 15px;
          }
          .detail-title {
            font-size: 2rem;
          }
          .suggestions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

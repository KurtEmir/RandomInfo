import React, { useState, useEffect, useRef } from 'react';

export default function FloatingCanvas({
  topics,
  activeFilter,
  searchQuery,
  isPaused,
  onCardSelect,
  speedMultiplier = 1.0
}) {
  const containerRef = useRef(null);
  const [cards, setCards] = useState([]);
  const requestRef = useRef(null);
  const previousTimeRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Resize listener to track if viewport is mobile-sized
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Use a Ref to keep speedMultiplier fresh in the animation loop
  const speedMultiplierRef = useRef(speedMultiplier);
  useEffect(() => {
    speedMultiplierRef.current = speedMultiplier;
  }, [speedMultiplier]);
  
  // Initialize cards with random starting coordinates on mount or topic list changes
  useEffect(() => {
    if (!topics || topics.length === 0) return;

    const directions = ['left-to-right', 'right-to-left', 'top-to-bottom', 'bottom-to-top'];
    
    const initializedCards = topics.map((topic, index) => {
      // Deterministic but spaced-out distribution based on index
      const direction = directions[index % 4];
      const speed = 0.05 + (index % 5) * 0.015; // varying speeds
      
      let x = 0;
      let y = 0;
      
      // Separate cards into lanes so they don't clump
      const laneIndex = Math.floor(index / 4);
      const numLanes = Math.ceil(topics.length / 4);
      const lanePosition = 12 + (laneIndex / numLanes) * 76; // keep within 12% to 88% range
      
      // Randomize initial positions across the viewport so they start scattered on refresh
      if (direction === 'left-to-right' || direction === 'right-to-left') {
        x = Math.random() * 140 - 20; // Random horizontal coordinate between -20% and 120%
        y = lanePosition;
      } else {
        x = lanePosition;
        y = Math.random() * 140 - 20; // Random vertical coordinate between -20% and 120%
      }

      return {
        id: topic.id,
        topic,
        direction,
        speed,
        x,
        y,
        isHovered: false,
        width: 15, // estimated width percentage
        height: 6 // estimated height percentage
      };
    });

    setCards(initializedCards);
  }, [topics]);

  // Main physics animation loop
  const animate = (time) => {
    if (previousTimeRef.current !== undefined && !isPaused) {
      setCards(prevCards => 
        prevCards.map(card => {
          // If the card is hovered, don't move it
          if (card.isHovered) return card;

          let newX = card.x;
          let newY = card.y;
          const speed = card.speed * speedMultiplierRef.current;

          // Update coordinate based on drift direction
          if (card.direction === 'left-to-right') {
            newX += speed;
            if (newX > 115) {
              newX = -25;
              // Add minor vertical drift randomization when wrapping
              newY = Math.max(10, Math.min(90, card.y + (Math.random() - 0.5) * 8));
            }
          } else if (card.direction === 'right-to-left') {
            newX -= speed;
            if (newX < -25) {
              newX = 115;
              newY = Math.max(10, Math.min(90, card.y + (Math.random() - 0.5) * 8));
            }
          } else if (card.direction === 'top-to-bottom') {
            newY += speed;
            if (newY > 115) {
              newY = -25;
              newX = Math.max(10, Math.min(90, card.x + (Math.random() - 0.5) * 8));
            }
          } else if (card.direction === 'bottom-to-top') {
            newY -= speed;
            if (newY < -25) {
              newY = 115;
              newX = Math.max(10, Math.min(90, card.x + (Math.random() - 0.5) * 8));
            }
          }

          return { ...card, x: newX, y: newY };
        })
      );
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPaused]);

  // Handle hover state to freeze motion locally
  const setCardHover = (id, hoverState) => {
    setCards(prevCards => 
      prevCards.map(card => {
        if (card.id === id) {
          return { ...card, isHovered: hoverState };
        }
        return card;
      })
    );
  };

  // Check if card matches active filters/search
  const isCardVisible = (card) => {
    // 1. Category filter match
    if (activeFilter !== 'all' && card.topic.category !== activeFilter) {
      return false;
    }
    // 2. Search query match (case-insensitive Turkish comparison)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLocaleLowerCase('tr-TR');
      const title = card.topic.title.toLocaleLowerCase('tr-TR');
      const desc = card.topic.shortDescription.toLocaleLowerCase('tr-TR');
      return title.includes(q) || desc.includes(q);
    }
    return true;
  };

  let visibleCount = 0;

  return (
    <div className="canvas-wrapper" ref={containerRef}>
      {cards.map(card => {
        const visible = isCardVisible(card);
        let shouldRender = visible;

        // If card is visible according to filters, check mobile limits
        if (visible) {
          if (isMobile) {
            if (visibleCount < 18) {
              visibleCount++;
            } else {
              shouldRender = false;
            }
          }
        }

        const categoryColorMap = {
          tarih: 'bg-tarih',
          teknoloji: 'bg-teknoloji',
          spor: 'bg-spor',
          ekonomi: 'bg-ekonomi',
          bilim: 'bg-bilim',
          sanat: 'bg-sanat'
        };

        const cardClass = `floating-card ${categoryColorMap[card.topic.category]} ` +
          (!visible ? (isMobile ? 'hidden-card' : 'fade-out') : '') +
          (!shouldRender ? ' hidden-card' : '');

        return (
          <div
            key={card.id}
            className={cardClass}
            style={{
              left: `${card.x}%`,
              top: `${card.y}%`,
            }}
            onMouseEnter={() => shouldRender && setCardHover(card.id, true)}
            onMouseLeave={() => setCardHover(card.id, false)}
            onClick={() => shouldRender && onCardSelect(card.topic)}
          >
            <span className="card-category-indicator">
              {card.topic.category === 'tarih' && '📜'}
              {card.topic.category === 'teknoloji' && '⚡'}
              {card.topic.category === 'spor' && '🏆'}
              {card.topic.category === 'ekonomi' && '💸'}
              {card.topic.category === 'bilim' && '🔬'}
              {card.topic.category === 'sanat' && '🎨'}
            </span>{' '}
            {card.topic.title}
          </div>
        );
      })}

      <style>{`
        .card-category-indicator {
          font-size: 0.95rem;
        }
        .hidden-card {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

/**
 * Generates a numeric hash from a Date object based on YYYY-MM-DD.
 * @param {Date} date 
 * @returns {number}
 */
export function getDailySeed(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateString = `${yyyy}-${mm}-${dd}`;
  
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * Creates a seeded pseudo-random number generator (Linear Congruential Generator).
 * @param {number} seed 
 * @returns {() => number} Returns a number between 0 (inclusive) and 1 (exclusive)
 */
export function createSeededRandom(seed) {
  let currentSeed = seed;
  return function() {
    // Standard LCG parameters (used in glibc)
    currentSeed = (currentSeed * 1103515245 + 12345) % 2147483648;
    return currentSeed / 2147483648;
  };
}

/**
 * Shuffles an array in-place using a seeded random function.
 * @param {Array} array 
 * @param {() => number} randomFn 
 * @returns {Array}
 */
export function seededShuffle(array, randomFn) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Gets a balanced, deterministic set of topics for a given date.
 * Selects an equal number of topics from each of the 6 categories.
 * @param {Array} allTopics 
 * @param {number} itemsPerCategory Number of items to select per category (default 4, total 24)
 * @param {Date} date 
 * @returns {Array}
 */
export function getDailyTopics(allTopics, itemsPerCategory = 4, date = new Date()) {
  const seed = getDailySeed(date);
  const randomFn = createSeededRandom(seed);
  
  const categories = ['tarih', 'teknoloji', 'spor', 'ekonomi', 'bilim', 'sanat'];
  let selectedTopics = [];
  
  // 1. Select itemsPerCategory from each category deterministically
  categories.forEach(cat => {
    const categoryTopics = allTopics.filter(t => t.category === cat);
    const shuffledCat = seededShuffle(categoryTopics, randomFn);
    const selection = shuffledCat.slice(0, itemsPerCategory);
    selectedTopics = [...selectedTopics, ...selection];
  });
  
  // 2. Do a final shuffle so they are not grouped by category when rendered
  return seededShuffle(selectedTopics, randomFn);
}

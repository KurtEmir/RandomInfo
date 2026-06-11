/**
 * Generates a numeric seed from a Date object.
 */
function getDailySeed(date = new Date()) {
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
 * Seeded pseudo-random number generator (LCG).
 */
function createSeededRandom(seed) {
  let currentSeed = seed;
  return function() {
    currentSeed = (currentSeed * 1103515245 + 12345) % 2147483648;
    return currentSeed / 2147483648;
  };
}

/**
 * Seeded array shuffle.
 */
function seededShuffle(array, randomFn) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Convers a Turkish title into a URL-friendly slug.
 */
export function formatTitleToId(title) {
  const map = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
    'â': 'a', 'î': 'i', 'û': 'u'
  };
  
  let slug = title.replace(/[çÇğĞıIİöÖşŞüÜâîû]/g, (match) => map[match] || match);
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extracts the first sentence from a Wikipedia text to act as a summary.
 */
function makeShortDescription(extract) {
  if (!extract) return 'Bu konu hakkında detaylı bilgi bulunmamaktadır.';
  const sentences = extract.split(/(?<=[.!?])\s+/);
  if (sentences.length > 0 && sentences[0].length > 15) {
    return sentences[0];
  }
  return extract.substring(0, 100) + '...';
}

/**
 * Fetches page ids from a Turkish Wikipedia category.
 */
async function fetchCategoryMembers(categoryTitle) {
  const url = `https://tr.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=categorymembers&cmtitle=${encodeURIComponent(categoryTitle)}&cmlimit=150&cmtype=page`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (!data.query || !data.query.categorymembers) {
    return [];
  }
  
  // Filter out any pages that aren't in the default article namespace (ns: 0)
  return data.query.categorymembers.filter(member => member.ns === 0);
}

/**
 * Fetches summaries for a list of Wikipedia page ids by batching them in chunks of max 30.
 */
async function fetchBulkExtracts(pageids) {
  if (pageids.length === 0) return {};
  
  const chunkSize = 30;
  const chunks = [];
  for (let i = 0; i < pageids.length; i += chunkSize) {
    chunks.push(pageids.slice(i, i + chunkSize));
  }
  
  try {
    const fetchPromises = chunks.map(async (chunk) => {
      const url = `https://tr.wikipedia.org/w/api.php?action=query&format=json&origin=*&pageids=${chunk.join('|')}&prop=extracts&exintro=1&explaintext=1&exchars=600`;
      const response = await fetch(url);
      const data = await response.json();
      return data.query && data.query.pages ? data.query.pages : {};
    });
    
    const results = await Promise.all(fetchPromises);
    
    const mergedPages = {};
    results.forEach(pagesObj => {
      Object.assign(mergedPages, pagesObj);
    });
    
    return mergedPages;
  } catch (e) {
    console.error('Error in fetchBulkExtracts:', e);
    return {};
  }
}

/**
 * Main coordinator function. Fetches from multiple specific subcategories per field, 
 * flattens/deduplicates them, picks 10 pages per field deterministically, 
 * queries extracts in bulk, and returns them formatted.
 * @param {Date} date Seeding date
 */
export async function fetchDailyWikipediaTopics(date = new Date()) {
  const categoryConfigs = [
    { 
      id: 'tarih', 
      titles: [
        'Kategori:Savaşlar', 
        'Kategori:Devrimler', 
        'Kategori:Antik_çağ', 
        'Kategori:Antik_kentler', 
        'Kategori:Osmanlı_İmparatorluğu', 
        'Kategori:Antik_Mısır', 
        'Kategori:Tarihî_yapılar'
      ] 
    },
    { 
      id: 'teknoloji', 
      titles: [
        'Kategori:Bilişim_teknolojileri', 
        'Kategori:Uzay_araçları', 
        'Kategori:Kriptografi', 
        'Kategori:Robotik', 
        'Kategori:İletişim_teknolojileri', 
        'Kategori:Yapay_zekâ', 
        'Kategori:Biyoteknoloji'
      ] 
    },
    { 
      id: 'spor', 
      titles: [
        'Kategori:Spor_dalları', 
        'Kategori:Olimpiyat_oyunları', 
        'Kategori:Futbol_terimleri', 
        'Kategori:Spor_ekipmanları', 
        'Kategori:Motor_sporları', 
        'Kategori:Doğa_sporları', 
        'Kategori:Dövüş_sanatları'
      ] 
    },
    { 
      id: 'ekonomi', 
      titles: [
        'Kategori:Para_birimleri', 
        'Kategori:Ekonomik_krizler', 
        'Kategori:Ekonomi_terimleri', 
        'Kategori:Finansal_piyasalar', 
        'Kategori:Ekonomik_kuramlar', 
        'Kategori:Makroekonomi', 
        'Kategori:Uluslararası_ticaret'
      ] 
    },
    { 
      id: 'bilim', 
      titles: [
        'Kategori:Elementler', 
        'Kategori:Astronomik_cisimler', 
        'Kategori:Dinozorlar', 
        'Kategori:Fizik_terimleri', 
        'Kategori:Biyoloji_terimleri', 
        'Kategori:Kimya_terimleri', 
        'Kategori:Gökbilim'
      ] 
    },
    { 
      id: 'sanat', 
      titles: [
        'Kategori:Sanat_akımları', 
        'Kategori:Müzik_aletleri', 
        'Kategori:Sanat_eserleri', 
        'Kategori:Tiyatro_terimleri', 
        'Kategori:Sinema_terimleri', 
        'Kategori:Ressamlar', 
        'Kategori:Mimarlık_terimleri'
      ] 
    }
  ];

  const seed = getDailySeed(date);
  const randomFn = createSeededRandom(seed);

  // 1. Fetch category member listings for all subcategories in parallel
  const categoryPromises = categoryConfigs.map(async (cfg) => {
    const fetchPromises = cfg.titles.map(title => 
      fetchCategoryMembers(title)
        .then(members => ({ title, members }))
        .catch(err => {
          console.error(`Wikipedia category fetch error for ${title}:`, err);
          return { title, members: [] };
        })
    );
    const subcatResults = await Promise.all(fetchPromises);
    return { categoryId: cfg.id, subcategories: subcatResults };
  });

  const results = await Promise.all(categoryPromises);
  
  let selectedPages = [];
  const pageToCategoryMap = {};

  // 2. Select exactly 10 articles deterministically from each category config using the seed
  results.forEach(({ categoryId, subcategories }) => {
    let fieldCandidatePages = [];
    
    // Pick max 2 pages from each subcategory to ensure balanced diversity
    subcategories.forEach(sub => {
      if (sub.members.length === 0) return;
      const shuffledSub = seededShuffle(sub.members, randomFn);
      const selection = shuffledSub.slice(0, 2);
      fieldCandidatePages = [...fieldCandidatePages, ...selection];
    });

    if (fieldCandidatePages.length === 0) return;
    
    // Filter out duplicates (in case a page exists in multiple subcategories)
    const uniqueCandidates = [];
    const seen = new Set();
    fieldCandidatePages.forEach(m => {
      if (!seen.has(m.pageid)) {
        seen.add(m.pageid);
        uniqueCandidates.push(m);
      }
    });

    // Seeded shuffle of final candidates for this field
    const shuffledFieldCandidates = seededShuffle(uniqueCandidates, randomFn);
    
    // Pick exactly 10 pages
    const selection = shuffledFieldCandidates.slice(0, 10);
    
    selection.forEach(page => {
      selectedPages.push(page.pageid);
      pageToCategoryMap[page.pageid] = categoryId;
    });
  });

  // 3. Fetch extracts for all 60 page IDs in bulk chunk API calls
  const pagesData = await fetchBulkExtracts(selectedPages);

  // 4. Format pages into our clean daily topics array, filtering out empty or broken articles
  const formattedTopics = Object.values(pagesData)
    .map(page => {
      const categoryId = pageToCategoryMap[page.pageid];
      const cleanExtract = page.extract ? page.extract.trim() : '';
      
      // Filter out pages that have no contents or are too short to be a valid description
      if (!cleanExtract || cleanExtract.length < 20) {
        return null;
      }
      
      return {
        id: formatTitleToId(page.title),
        title: page.title,
        category: categoryId,
        shortDescription: makeShortDescription(cleanExtract),
        detailText: cleanExtract
      };
    })
    .filter(Boolean);

  // 5. Final seeded shuffle so they are mixed when rendering
  return seededShuffle(formattedTopics, randomFn);
}

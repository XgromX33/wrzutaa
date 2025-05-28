// Sample movies data with duration
const movies = [
  {
    title: "Władca Pierścieni",
    imageUrl: "https://storage.googleapis.com/pod_public/1300/106935.jpg",
    year: "2001",
    rating: "4.9/5",
    genre: "Fantasy, Przygodowy",
    description: "Młody hobbit wyrusza w niebezpieczną misję, aby zniszczyć potężny pierścień i pokonać mrocznego władcę Saurona.",
    dateAdded: "2025-04-26",
    videoUrl: "https://download.samplelib.com/mp4/sample-30s.mp4",
    duration: "2h 58m",
    categories: ["Fantasy", "Przygodowy", "Akcja"]
  },
  {
    title: "Incepcja",
    imageUrl: "https://multikino.pl/-/jssmedia/multikino/images/kultowe-kino/incepcja_2_b1-copy.jpg?mw=450&rev=b66a22b6e34e453cb20e6c03fea927aa",
    year: "2010",
    rating: "4.8/5",
    genre: "Sci-Fi, Akcja",
    description: "Dom Cobb jest mistrzem w sztuce wydobywania wartościowych informacji z umysłów ludzi podczas snu.",
    dateAdded: "2024-03-20",
    videoUrl: "https://download.samplelib.com/mp4/sample-20s.mp4",
    duration: "2h 28m",
    categories: ["Sci-Fi", "Akcja", "Thriller"]
  },
  {
    title: "Pulp Fiction",
    imageUrl: "https://static.posters.cz/image/1300/plakaty/pulp-fiction-cover-i1288.jpg",
    year: "1994",
    rating: "4.9/5",
    genre: "Kryminał, Dramat",
    description: "Przemoc i odkupienie w Los Angeles w kilku nietypowo połączonych ze sobą historiach.",
    dateAdded: "2024-02-15",
    duration: "2h 34m",
    categories: ["Kryminał", "Dramat", "Thriller"]
  },
  {
    title: "Skazani na Shawshank",
    imageUrl: "https://cdn.swiatksiazki.pl/media/catalog/product/3/7/3799906597437.jpg?store=default&image-type=large",
    year: "1994",
    rating: "4.9/5",
    genre: "Dramat",
    description: "Niesłusznie skazany bankier Andy Dufresne rozpoczyna odbywanie wyroku dożywocia w więzieniu Shawshank.",
    dateAdded: "2024-03-18",
    duration: "2h 22m",
    categories: ["Dramat", "Kryminał"]
  },
  {
    title: "Zielona Mila",
    imageUrl: "https://static.profinfo.pl/storage/image/core_products/2024/6/14/580dc12dbd0a9d0f2dd241e50c55d8f8/admin/preview/14025B01622KS_HD.jpg.webp",
    year: "1999",
    rating: "4.8/5",
    genre: "Dramat, Fantasy",
    description: "Strażnik więzienny odkrywa, że skazaniec posiada nadprzyrodzone zdolności uzdrawiania.",
    dateAdded: "2024-03-10",
    duration: "3h 9m",
    categories: ["Dramat", "Fantasy", "Kryminał"]
  }
];

// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
});

// Watchlist functions
function getWatchlist() {
  const watchlistCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('wfo_watchlist='));

  if (watchlistCookie) {
    const watchlist = JSON.parse(decodeURIComponent(watchlistCookie.split('=')[1]));
    console.log('Retrieved watchlist from cookie:', watchlist);
    return watchlist;
  }
  console.log('No watchlist cookie found, returning empty array');
  return [];
}

// Debug function to check watchlist status
function debugWatchlist() {
  console.log('=== WATCHLIST DEBUG ===');
  console.log('Current URL:', window.location.pathname);
  console.log('All cookies:', document.cookie);
  console.log('Watchlist:', getWatchlist());
  console.log('Watchlist container exists:', !!document.getElementById('watchlist'));
  console.log('======================');
}

// Make debug function available globally
window.debugWatchlist = debugWatchlist;
window.addToWatchlist = addToWatchlist;
window.removeFromWatchlist = removeFromWatchlist;
window.getWatchlist = getWatchlist;

function updateWatchlistUI() {
  const watchlist = getWatchlist();
  const watchlistContainer = document.getElementById('watchlist');

  console.log('Updating watchlist UI:', watchlist);
  console.log('Watchlist container found:', !!watchlistContainer);

  if (watchlistContainer) {
    if (watchlist.length === 0) {
      watchlistContainer.innerHTML = '<div class="empty-watchlist">Twoja lista do obejrzenia jest pusta</div>';
    } else {
      const watchlistMovies = watchlist.map(id => movies[id]).filter(movie => movie); // Filter out undefined
      console.log('Watchlist movies to display:', watchlistMovies);
      watchlistContainer.innerHTML = watchlistMovies.map((movie, index) => {
        const originalIndex = movies.findIndex(m => m.title === movie.title);
        return createMovieCard(movie, originalIndex);
      }).join('');
    }
  } else {
    console.log('Watchlist container not found on this page');
  }

  // Update featured movie watchlist button if it exists
  setTimeout(() => {
    updateFeaturedMovieButton();
  }, 10); // Small delay to ensure DOM has updated

  // Update any open movie overlay
  if (currentOverlay) {
    const movieId = parseInt(currentOverlay.querySelector('.movie-details-content').dataset.movieId);
    const watchlistButton = currentOverlay.querySelector('.watchlist-button');
    const inWatchlist = isInWatchlist(movieId);

    if (watchlistButton) {
      watchlistButton.className = `btn ${inWatchlist ? 'btn-primary' : 'btn-secondary'} watchlist-button`;
      watchlistButton.innerHTML = `
        <i data-lucide="${inWatchlist ? 'check' : 'plus'}"></i>
        <span>${inWatchlist ? 'Usuń z listy' : 'Dodaj do listy'}</span>
      `;
      lucide.createIcons();
    }
  }

  // Re-setup movie overlay for new watchlist cards
  setupMovieOverlay();
}

function addToWatchlist(movieId) {
  console.log('Adding movie to watchlist:', movieId);
  const watchlist = getWatchlist();
  if (!watchlist.includes(movieId)) {
    watchlist.push(movieId);
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `wfo_watchlist=${encodeURIComponent(JSON.stringify(watchlist))}; expires=${expiryDate.toUTCString()}; path=/`;
    console.log('Updated watchlist:', watchlist);
    console.log('Cookie set:', document.cookie);
    console.log('Updating UI after adding movie...');
    updateWatchlistUI();
  } else {
    console.log('Movie already in watchlist');
  }
}

function removeFromWatchlist(movieId) {
  console.log('Removing movie from watchlist:', movieId);
  const watchlist = getWatchlist();
  const index = watchlist.indexOf(movieId);
  if (index > -1) {
    watchlist.splice(index, 1);
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `wfo_watchlist=${encodeURIComponent(JSON.stringify(watchlist))}; expires=${expiryDate.toUTCString()}; path=/`;
    console.log('Updated watchlist:', watchlist);
    console.log('Updating UI after removing movie...');
    updateWatchlistUI();
  } else {
    console.log('Movie not found in watchlist');
  }
}

function isInWatchlist(movieId) {
  return getWatchlist().includes(movieId);
}

// Create movie card HTML
function createMovieCard(movie, index) {
  const primaryCategory = movie.categories[0];
  const inWatchlist = isInWatchlist(index);
  const watchlistButtonClass = inWatchlist ? 'btn-primary' : 'btn-secondary';
  const watchlistText = inWatchlist ? 'Usuń z listy' : 'Dodaj do listy';

  return `
    <div class="movie-card" data-movie-id="${index}">
      <img src="${movie.imageUrl}" alt="${movie.title}">
      <div class="movie-card-overlay"></div>
      <span class="movie-category">${primaryCategory}</span>
      <span class="movie-duration">${movie.duration}</span>
      <div class="movie-card-content">
        <h3 class="movie-card-title">${movie.title}</h3>
        <div class="movie-card-meta">
          <span>${movie.year}</span>
          <span>•</span>
          <span>${movie.rating}</span>
        </div>
      </div>
    </div>
  `;
}

// Filter movies by category
function getMoviesByCategory(category) {
  return movies.filter(movie => movie.categories.includes(category));
}

// Initialize movies page
function initializeMoviesPage() {
  const moviesGrid = document.getElementById('movies-grid');
  if (!moviesGrid) return;

  // Check for search parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('search');

  let moviesToShow = movies;

  if (searchTerm) {
    // Filter movies based on search term
    moviesToShow = movies.filter(movie =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())) ||
      movie.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Update page header to show search results
    const moviesHeader = document.querySelector('.movies-header h2');
    if (moviesHeader) {
      moviesHeader.textContent = `Wyniki wyszukiwania dla: "${searchTerm}" (${moviesToShow.length})`;
    }
  }

  moviesGrid.innerHTML = moviesToShow.map((movie, index) => {
    const originalIndex = movies.findIndex(m => m.title === movie.title);
    return createMovieCard(movie, originalIndex);
  }).join('');

  setupMovieOverlay();
}

// Store the current featured movie index
let currentFeaturedMovieIndex = null;

// Update featured movie button
function updateFeaturedMovieButton() {
  if (currentFeaturedMovieIndex === null) return;

  // Look for the button by finding it properly - it might have different classes after update
  const featuredMovie = document.querySelector('.featured-movie');
  if (!featuredMovie) return;

  const featuredWatchlistButton = featuredMovie.querySelector('.action-buttons .btn:not(.btn-primary[href])');
  if (featuredWatchlistButton) {
    const inWatchlist = isInWatchlist(currentFeaturedMovieIndex);

    // Update class and content
    featuredWatchlistButton.className = `btn ${inWatchlist ? 'btn-primary' : 'btn-secondary'}`;
    featuredWatchlistButton.innerHTML = `
      <i data-lucide="${inWatchlist ? 'check' : 'plus'}"></i>
      <span>${inWatchlist ? 'Usuń z listy' : 'Dodaj do listy'}</span>
    `;

    // Recreate icons
    lucide.createIcons();

    // Remove old event listeners and add new one
    const newButton = featuredWatchlistButton.cloneNode(true);
    featuredWatchlistButton.parentNode.replaceChild(newButton, featuredWatchlistButton);

    // Add new click handler
    newButton.onclick = (e) => {
      e.preventDefault();
      console.log('Featured movie watchlist button clicked, current state:', inWatchlist);
      if (isInWatchlist(currentFeaturedMovieIndex)) {
        removeFromWatchlist(currentFeaturedMovieIndex);
      } else {
        addToWatchlist(currentFeaturedMovieIndex);
      }
    };
  }
}

// Initialize featured movie
function initializeFeaturedMovie() {
  const featuredMovie = document.querySelector('.featured-movie');
  if (!featuredMovie) return;

  // Only set a new random movie if we don't have one yet
  if (currentFeaturedMovieIndex === null) {
    currentFeaturedMovieIndex = Math.floor(Math.random() * movies.length);
  }

  const randomMovie = movies[currentFeaturedMovieIndex];
  const inWatchlist = isInWatchlist(currentFeaturedMovieIndex);

  featuredMovie.querySelector('.featured-backdrop').style.backgroundImage = `url(${randomMovie.imageUrl})`;
  featuredMovie.querySelector('.featured-title').textContent = randomMovie.title;
  featuredMovie.querySelector('.rating').textContent = randomMovie.rating;
  featuredMovie.querySelector('.year').textContent = randomMovie.year;
  featuredMovie.querySelector('.duration').textContent = randomMovie.duration;
  featuredMovie.querySelector('.movie-description').textContent = randomMovie.description;

  // Update play button link
  const playButton = featuredMovie.querySelector('.btn-primary');
  if (playButton) {
    playButton.href = `player.html?id=${currentFeaturedMovieIndex}`;
  }

  // Update watchlist button - find the second button (not the play button)
  const watchlistButton = featuredMovie.querySelector('.action-buttons .btn:not([href])');
  if (watchlistButton) {
    // Remove any existing onclick handlers
    watchlistButton.onclick = null;

    watchlistButton.className = `btn ${inWatchlist ? 'btn-primary' : 'btn-secondary'}`;
    watchlistButton.innerHTML = `
      <i data-lucide="${inWatchlist ? 'check' : 'plus'}"></i>
      <span>${inWatchlist ? 'Usuń z listy' : 'Dodaj do listy'}</span>
    `;
    lucide.createIcons();

    // Add click handler
    watchlistButton.onclick = (e) => {
      e.preventDefault();
      console.log('Featured movie button clicked - current watchlist state:', isInWatchlist(currentFeaturedMovieIndex));
      if (isInWatchlist(currentFeaturedMovieIndex)) {
        removeFromWatchlist(currentFeaturedMovieIndex);
      } else {
        addToWatchlist(currentFeaturedMovieIndex);
      }
    };
  }
}

// Initialize watchlist page
function initializeWatchlistPage() {
  // Check if we're on the watchlist page
  if (window.location.pathname.includes('Lista do obejrzenia.html')) {
    console.log('Initializing watchlist page');
    debugWatchlist();

    // Force update watchlist UI
    setTimeout(() => {
      updateWatchlistUI();
    }, 100);
  }
}

// Initialize category page
function initializeCategoryPage() {
  const categoryContainer = document.querySelector('.category-container');
  if (!categoryContainer) return;

  // Get category from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const selectedCategory = urlParams.get('category');

  // Create category filter
  const filterHTML = `
    <div class="category-filter">
      <input type="text" placeholder="Szukaj kategorii..." class="category-search">
      <div class="category-tags">
        <button class="category-tag${!selectedCategory ? ' active' : ''}" data-category="all">Wszystkie</button>
        ${Array.from(new Set(movies.flatMap(movie => movie.categories))).map(category =>
          `<button class="category-tag${selectedCategory === category ? ' active' : ''}" data-category="${category}">${category}</button>`
        ).join('')}
      </div>
    </div>
  `;

  categoryContainer.insertAdjacentHTML('afterbegin', filterHTML);

  const categorySearch = document.querySelector('.category-search');
  const categoryTags = document.querySelectorAll('.category-tag');
  const movieGrid = document.querySelector('.movie-grid');

  // Display initial movies based on selected category
  const initialMovies = selectedCategory ?
    movies.filter(movie => movie.categories.includes(selectedCategory)) :
    movies;

  movieGrid.innerHTML = initialMovies.map((movie, index) => {
    const originalIndex = movies.findIndex(m => m.title === movie.title);
    return createMovieCard(movie, originalIndex);
  }).join('');

  setupMovieOverlay();

  // Search functionality
  categorySearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    categoryTags.forEach(tag => {
      const category = tag.textContent;
      if (category === 'Wszystkie' || category.toLowerCase().includes(searchTerm)) {
        tag.style.display = 'block';
      } else {
        tag.style.display = 'none';
      }
    });
  });

  // Category filtering
  categoryTags.forEach(tag => {
    tag.addEventListener('click', () => {
      categoryTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');

      const selectedCategory = tag.dataset.category;
      const filteredMovies = selectedCategory === 'all' ?
        movies :
        movies.filter(movie => movie.categories.includes(selectedCategory));

      movieGrid.innerHTML = filteredMovies.map((movie, index) => {
        const originalIndex = movies.findIndex(m => m.title === movie.title);
        return createMovieCard(movie, originalIndex);
      }).join('');

      setupMovieOverlay();
    });
  });
}

// Populate movie rows with proper positioning of information
document.addEventListener('DOMContentLoaded', () => {
  // Initialize featured movie
  initializeFeaturedMovie();

  const recommendedMovies = document.getElementById('recommended-movies');
  const dramaMovies = document.getElementById('drama-movies');
  const fantasyMovies = document.getElementById('fantasy-movies');
  const crimeMovies = document.getElementById('crime-movies');

  if (recommendedMovies) {
    recommendedMovies.innerHTML = movies.map((movie, index) => createMovieCard(movie, index)).join('');
  }

  if (dramaMovies) {
    const dramaList = getMoviesByCategory('Dramat');
    dramaMovies.innerHTML = dramaList.map((movie, index) => {
      const originalIndex = movies.findIndex(m => m.title === movie.title);
      return createMovieCard(movie, originalIndex);
    }).join('');
  }

  if (fantasyMovies) {
    const fantasyList = getMoviesByCategory('Fantasy');
    fantasyMovies.innerHTML = fantasyList.map((movie, index) => {
      const originalIndex = movies.findIndex(m => m.title === movie.title);
      return createMovieCard(movie, originalIndex);
    }).join('');
  }

  if (crimeMovies) {
    const crimeList = getMoviesByCategory('Kryminał');
    crimeMovies.innerHTML = crimeList.map((movie, index) => {
      const originalIndex = movies.findIndex(m => m.title === movie.title);
      return createMovieCard(movie, originalIndex);
    }).join('');
  }

  // Set up movie overlay for all newly created cards on main page
  setupMovieOverlay();

  // Initialize movies page if we're on the movies page
  initializeMoviesPage();

  // Initialize category page if we're on the category page
  initializeCategoryPage();

  // Initialize watchlist page if we're on the watchlist page
  initializeWatchlistPage();

  // Initialize watchlist
  updateWatchlistUI();

  // Set up movie overlay for any existing cards
  setupMovieOverlay();

  // Add click handlers for "Zobacz wszystkie" links
  const viewAllLinks = document.querySelectorAll('.view-all');
  viewAllLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const categoryHeader = e.target.closest('.category-header');
      if (categoryHeader) {
        const categoryTitle = categoryHeader.querySelector('h2').textContent;
        const category = categoryTitle.replace(/y$/, '').trim(); // Remove 'y' from the end (e.g., "Dramaty" -> "Dramat")
        e.preventDefault();
        window.location.href = `Kategorie.html?category=${encodeURIComponent(category)}`;
      }
    });
  });
});

// Global variable for overlay management
let currentOverlay = null;

// Movie details overlay
function setupMovieOverlay() {
  const movieCards = document.querySelectorAll('.movie-card:not([data-overlay-setup])');

  movieCards.forEach(card => {
    // Mark card as having overlay setup
    card.setAttribute('data-overlay-setup', 'true');

    card.addEventListener('click', () => {
      // Remove existing overlay if it exists
      if (currentOverlay) {
        currentOverlay.remove();
      }

      const overlay = document.createElement('div');
      overlay.className = 'movie-details-overlay';

      const movieId = parseInt(card.dataset.movieId);
      const movieData = movies[movieId];
      const inWatchlist = isInWatchlist(movieId);

      overlay.innerHTML = `
        <div class="movie-details-content" data-movie-id="${movieId}">
          <button class="movie-details-close">
            <i data-lucide="x"></i>
          </button>
          <div class="movie-details-header">
            <img src="${movieData.imageUrl}" alt="${movieData.title}" class="movie-details-poster">
            <div class="movie-details-info">
              <h1 class="movie-details-title">${movieData.title}</h1>
              <div class="movie-details-meta">
                <span class="movie-details-genre">${movieData.genre}</span>
                <span class="movie-details-rating">
                  <i data-lucide="star" class="star-icon"></i>
                  <span>${movieData.rating}</span>
                </span>
              </div>
              <p class="movie-details-description">${movieData.description}</p>
              <div class="movie-details-actions">
                <a href="player.html?id=${movieId}" class="btn btn-primary play-button">
                  <i data-lucide="play"></i>
                  <span>Odtwórz film</span>
                </a>
                <button class="btn ${inWatchlist ? 'btn-primary' : 'btn-secondary'} watchlist-button">
                  <i data-lucide="${inWatchlist ? 'check' : 'plus'}"></i>
                  <span>${inWatchlist ? 'Usuń z listy' : 'Dodaj do listy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      currentOverlay = overlay;
      lucide.createIcons();

      // Show overlay with animation
      requestAnimationFrame(() => {
        overlay.classList.add('active');
      });

      // Setup watchlist button functionality
      const watchlistButton = overlay.querySelector('.watchlist-button');
      if (watchlistButton) {
        watchlistButton.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Overlay watchlist button clicked for movie:', movieId);
          if (isInWatchlist(movieId)) {
            removeFromWatchlist(movieId);
          } else {
            addToWatchlist(movieId);
          }
        };
      }

      // Close button functionality
      const closeButton = overlay.querySelector('.movie-details-close');
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        overlay.classList.remove('active');
        setTimeout(() => {
          overlay.remove();
          currentOverlay = null;
        }, 300);
      });

      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
          overlay.classList.remove('active');
          setTimeout(() => {
            overlay.remove();
            currentOverlay = null;
          }, 300);
        }
      });

      // Close when clicking outside
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          setTimeout(() => {
            overlay.remove();
            currentOverlay = null;
          }, 300);
        }
      });
    });
  });
}

// ========================================
// BLOGS PAGE FUNCTIONALITY
// ========================================
// Clean, organized code for blogs page

document.addEventListener('DOMContentLoaded', function() {
    initBlogsPage();
});

// ========================================
// INITIALIZATION
// ========================================
function initBlogsPage() {
    initSearch();
    initCategoryFilters();
    // Read URL params first so initial filter/search is known
    initURLParams();
    initLoadMoreBlogs();
    loadBlogPosts();
}

// ========================================
// GLOBAL VARIABLES
// ========================================
let filteredPosts = [];
let currentCategory = 'all';
let currentPage = 1;
const postsPerPage = 9; // ensures 3x3 on desktop, 2x? on tablet, 1x? on mobile

// ========================================
// SEARCH FUNCTIONALITY
// ========================================
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    if (!searchInput) return;

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            performBlogSearch(query);
        });
    }

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            performBlogSearch(query);
        }
    });
}

function performBlogSearch(query) {
    // Only run search on explicit submit; no suggestions dropdown
    if (!query) {
        displayBlogPosts(filteredPosts);
        const url = new URL(window.location);
        url.searchParams.delete('search');
        window.history.pushState({}, '', url);
        return;
    }

    const searchResults = window.BlogData.searchBlogPosts(query);
    displayBlogPosts(searchResults);

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('search', query);
    url.searchParams.delete('category');
    window.history.pushState({}, '', url);
}

// ========================================
// CATEGORY FILTERING
// ========================================
function initCategoryFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter posts
            filterPostsByCategory(category);
            
            // Update URL
            const url = new URL(window.location);
            if (category === 'all') {
                url.searchParams.delete('category');
            } else {
                url.searchParams.set('category', category);
            }
            url.searchParams.delete('search');
            window.history.pushState({}, '', url);
        });
    });
}

function filterPostsByCategory(category) {
    currentCategory = category;
    currentPage = 1;
    
    filteredPosts = window.BlogData.getBlogPostsByCategory(category);
    displayBlogPosts(filteredPosts);
}

// ========================================
// LOAD MORE FUNCTIONALITY
// ========================================
function initLoadMoreBlogs() {
    const loadMoreBtn = document.getElementById('load-more-blogs-btn');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadMoreBlogs();
        });
    }
}

function loadMoreBlogs() {
    currentPage++;
    displayBlogPosts(filteredPosts, true);
}

// ========================================
// BLOG POSTS DISPLAY
// ========================================
function loadBlogPosts() {
    showBlogsLoading();
    
    setTimeout(() => {
        // Respect any pre-selected category or search from URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlCategory = urlParams.get('category');
        const urlSearch = urlParams.get('search');

        if (urlSearch && urlSearch.trim() !== '') {
            const results = window.BlogData.searchBlogPosts(urlSearch.trim());
            filteredPosts = results;
        } else if (urlCategory && urlCategory !== 'all') {
            currentCategory = urlCategory;
            filteredPosts = window.BlogData.getBlogPostsByCategory(urlCategory);
        } else {
            filteredPosts = window.BlogData.getAllBlogPosts();
        }

        displayBlogPosts(filteredPosts);
        hideBlogsLoading();
    }, 300);
}

function displayBlogPosts(posts, append = false) {
    const blogsGrid = document.getElementById('blogs-grid');
    
    if (!blogsGrid) return;
    
    if (!append) {
        blogsGrid.innerHTML = '';
    }
    
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = posts.slice(startIndex, endIndex);
    
    if (postsToShow.length === 0) {
        blogsGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1;">
                <i class="fas fa-search"></i>
                <h3>No blog posts found</h3>
                <p>Try adjusting your search criteria or browse different categories.</p>
            </div>
        `;
        return;
    }
    
    postsToShow.forEach(post => {
        const blogCard = createBlogCard(post);
        blogsGrid.appendChild(blogCard);
    });
    
    updateLoadMoreBlogsButton(posts.length, endIndex);
}

function createBlogCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    
    const categoryInfo = window.BlogData.getCategoryInfo(post.category);
    
    card.innerHTML = `
        <div class="blog-thumbnail">
            <img src="${post.thumbnail}" alt="${post.title}" loading="lazy">
            ${post.videoId ? `
                <div class="blog-play-button">
                    <i class="fas fa-play"></i>
                </div>
                <div class="blog-duration-badge">${post.duration}</div>
            ` : ''}
        </div>
        <div class="blog-content">
            <div class="blog-category">${categoryInfo ? categoryInfo.name : post.category}</div>
            <h3 class="blog-title">${post.title}</h3>
            <p class="blog-excerpt">${post.excerpt}</p>
            <div class="blog-meta">
                <div class="blog-stats">
                    <span class="blog-stat"><i class="fas fa-eye"></i> ${post.viewCount}</span>
                    <span class="blog-stat"><i class="fas fa-thumbs-up"></i> ${post.likeCount}</span>
                </div>
                <span class="blog-date">${formatDate(post.publishedAt)}</span>
            </div>
            <div class="blog-actions">
                <a class="blog-action-btn" href="blog.html?id=${post.id}">
                    <i class="fas fa-book-open"></i> Read More
                </a>
                <button class="blog-action-btn" onclick="shareBlog('${post.id}')">
                    <i class="fas fa-share"></i> Share
                </button>
            </div>
        </div>
    `;

    // Add click handler for entire card
    card.addEventListener('click', function(e) {
        if (!e.target.closest('.blog-action-btn')) {
            window.location.href = `blog.html?id=${post.id}`;
        }
    });

    return card;
}

// ========================================
// LOADING STATES
// ========================================
function showBlogsLoading() {
    const blogsGrid = document.getElementById('blogs-grid');
    
    if (blogsGrid) {
        blogsGrid.innerHTML = `
            <div class="loading-blogs" style="grid-column: 1 / -1;">
                <div class="blogs-spinner"></div>
                <p>Loading blog posts...</p>
            </div>
        `;
    }
}

function hideBlogsLoading() {
    const loadingElement = document.querySelector('.loading-blogs');
    if (loadingElement) {
        loadingElement.remove();
    }
}

function updateLoadMoreBlogsButton(totalPosts, currentIndex) {
    const loadMoreBtn = document.getElementById('load-more-blogs-btn');
    
    if (loadMoreBtn) {
        // Only show when at least one full next row is available
        const columns = getBlogsGridColumns();
        const remaining = Math.max(totalPosts - currentIndex, 0);
        const showButton = remaining >= columns;

        if (showButton) {
            loadMoreBtn.style.display = 'inline-block';
            loadMoreBtn.disabled = false;
            const nextCount = Math.min(remaining, postsPerPage);
            loadMoreBtn.textContent = `Load More (${remaining} remaining)`;
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
}

function getBlogsGridColumns() {
    const grid = document.getElementById('blogs-grid');
    if (!grid) return 1;
    const style = window.getComputedStyle(grid);
    const template = style.getPropertyValue('grid-template-columns');
    const count = template ? template.split(' ').filter(Boolean).length : 1;
    return Math.max(count, 1);
}

// ========================================
// URL PARAMETERS
// ========================================
function initURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    if (category) {
        const filterBtn = document.querySelector(`[data-category="${category}"]`);
        if (filterBtn) {
            // Set active state without triggering URL updates
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            filterBtn.classList.add('active');
            filterPostsByCategory(category);
        }
    }
    
    if (search) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = search;
            performBlogSearch(search);
        }
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
        const years = Math.floor(diffDays / 365);
        return `${years} year${years > 1 ? 's' : ''} ago`;
    }
}

function shareBlog(postId) {
    const post = window.BlogData.getBlogPostById(postId);
    if (!post) return;
    
    const shareData = {
        title: post.title,
        text: post.excerpt,
        url: `${window.location.origin}/blog.html?id=${postId}`
    };
    
    if (navigator.share) {
        navigator.share(shareData);
    } else {
        const url = shareData.url;
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Blog post link copied to clipboard!', 'success');
        });
    }
}

function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.remove();
    });

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// ========================================
// EXPORT FUNCTIONS
// ========================================
window.BlogsPage = {
    loadBlogPosts,
    filterPostsByCategory,
    performBlogSearch,
    shareBlog,
    formatDate
};
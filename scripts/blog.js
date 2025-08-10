// Blog Management System
class BlogManager {
  constructor() {
    this.posts = [];
    this.filteredPosts = [];
    this.currentFilter = 'all';
    this.postsPerPage = 6;
    this.currentPage = 1;
    this.maxDisplayedPosts = 6;
    
    this.init();
  }

  init() {
    this.loadPosts();
    this.bindEventListeners();
    this.renderPosts();
  }

  // Load blog posts data
  loadPosts() {
    // Sample blog posts - easily editable
    this.posts = [
      {
        id: 1,
        title: "Complete Site Redesign - Celebrating 150 Views!",
        excerpt: "A fresh, modern design overhaul to celebrate reaching 150 site views. Discover what's new and improved in this major update.",
        content: `
        <h3>A New Era for the Site</h3>
        <p>Hitting 150 views was a milestone worth celebrating, and what better way than with a complete site redesign! This wasn't just a simple refresh – it was a ground-up reimagining of how the site should look and feel.</p>
        
        <h4>What's New?</h4>
        <ul style="margin: auto;">
            <li><strong>Modern Visual Design:</strong> Sleek animations, improved typography, and better color harmony</li>
            <li><strong>Enhanced User Experience:</strong> Smoother navigation and more intuitive layout</li>
            <li><strong>Mobile Optimization:</strong> Perfect viewing experience across all devices</li>
            <li><strong>Performance Improvements:</strong> Faster loading times and optimized animations</li>
            <li><strong>New Sections:</strong> This blog system and improved project showcases</li>
        </ul>
        
        <h4>Built with Love and Purpose</h4>
        <p>Every element was carefully crafted with the community in mind. From the floating particles to the smooth hover effects, each detail serves a purpose – creating an engaging experience that reflects my passion for development and design.</p>
        
        <h4>Thank You to Everyone</h4>
        <p>Those 150 views represent real people who took time to visit and explore. This redesign is my way of saying thank you and ensuring everyone has an even better experience moving forward.</p>
        
        <h4>What's Next?</h4>
        <p>This is just the beginning! I'm planning regular updates, more interactive features, and fresh content. Stay tuned for upcoming projects and tutorials – the best is yet to come!</p>
        
        <p><em>Have feedback about the new design? Feel free to reach out on Discord – I'd love to hear your thoughts!</em></p>
        `,
        category: "development",
        date: "2025-08-10",
        readTime: "",
        image: "assets/blog/web-celebrate.png"
      },
      
      {
        id: 2,
        title: "The Future of Our Discord Community - Your Input Needed",
        excerpt: "Considering the future direction of our Discord server due to low activity. Your thoughts and suggestions could help shape what comes next.",
        content: `
        <h3>Community Check-In: Where Do We Go From Here?</h3>
        <p>I've been reflecting on our Discord server lately, and I wanted to have an honest conversation with everyone about its current state and future.</p>
        
        <h4>The Current Situation</h4>
        <p>Over the past few months, I've noticed that activity in our Discord community has significantly decreased. What once was a vibrant space for discussions about development, FNF modding, and general hangouts has become quite quiet.</p>
        
        <h4>Options Moving Forward</h4>
        <p>I'm considering several possibilities:</p>
        <ol>
            <li><strong>Server refresh:</strong> Restructure channels, add new events, and revitalize the community</li>
            <li><strong>Merge or partner:</strong> Collaborate with other communities for shared growth</li>
            <li><strong>Pause and archive:</strong> Temporarily close while maintaining the option to reopen</li>
            <li><strong>Complete closure:</strong> If there's truly no interest in continuing</li>
        </ol>
        
        <h4>Your Voice Matters</h4>
        <p>Before making any decisions, I want to hear from <em>you</em> – the community members who made this space special in the first place.</p>
        
        <p><strong>Questions for you:</strong></p>
        <ul>
            <li>What would you like to see in a Discord community?</li>
            <li>Are there specific topics or activities that would bring you back?</li>
            <li>Would you prefer a smaller, more focused server?</li>
            <li>Any ideas for revitalizing our current space?</li>
        </ul>
        
        <h4>How to Share Your Thoughts</h4>
        <p>You can reach out to me directly through:</p>
        <ul>
            <li>Discord DM: @trr0</li>
            <li>The feedback channel in our server</li>
            <li>Any of my other social platforms</li>
        </ul>
        
        <p><em>Whatever happens, I'm grateful for everyone who joined and contributed to making our little corner of Discord special. Your input will help determine what comes next!</em></p>
        `,
        category: "community",
        date: "2025-08-10",
        readTime: "",
        image: "assets/blog/discord-community-your-input-needed.png"
      },
      
//       {
//         id: 3,
//         title: "Advanced CSS Animations and Effects",
//         excerpt: "Deep dive into creating smooth, performant CSS animations. Learn about keyframes, transforms, and modern animation techniques.",
//         content: `
//           <h3>Creating Smooth CSS Animations</h3>
//           <p>CSS animations can bring your websites to life when used thoughtfully. Let's explore advanced techniques for creating smooth, performant animations.</p>
          
//           <h4>Animation Fundamentals</h4>
//           <p>Understanding the basics is crucial for advanced work:</p>
//           <ul>
//             <li><strong>Keyframes:</strong> Define animation steps</li>
//             <li><strong>Timing functions:</strong> Control animation pacing</li>
//             <li><strong>Transform properties:</strong> Use transform for better performance</li>
//             <li><strong>Will-change:</strong> Optimize for animations</li>
//           </ul>
          
//           <h4>Performance Considerations</h4>
//           <p>Not all CSS properties are created equal for animations:</p>
//           <ul>
//             <li><strong>Transform:</strong> Excellent performance (GPU accelerated)</li>
//             <li><strong>Opacity:</strong> Great for fade effects</li>
//             <li><strong>Avoid:</strong> Properties that trigger layout (width, height, margin)</li>
//             <li><strong>Use:</strong> transform3d() to trigger hardware acceleration</li>
//           </ul>
          
//           <h4>Advanced Techniques</h4>
//           <ol>
//             <li><strong>Cubic-bezier timing:</strong> Create custom easing functions</li>
//             <li><strong>Animation delays:</strong> Stagger animations for better UX</li>
//             <li><strong>Intersection Observer:</strong> Trigger animations on scroll</li>
//             <li><strong>CSS Variables:</strong> Dynamic animations with custom properties</li>
//           </ol>
          
//           <h4>Code Example</h4>
//           <pre><code>
// @keyframes slideInUp {
//   from {
//     opacity: 0;
//     transform: translateY(30px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }

// .animate-in {
//   animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
// }
//           </code></pre>
//         `,
//         category: "tutorials",
//         date: "2024-11-28",
//         readTime: "8 min read",
//         image: "assets/blog/css-animations.jpg"
//       },
      
//       {
//         id: 5,
//         title: "JavaScript ES6+ Features You Should Know",
//         excerpt: "Essential modern JavaScript features that will improve your code quality and development experience. From arrow functions to async/await.",
//         content: `
//           <h3>Modern JavaScript Features</h3>
//           <p>JavaScript has evolved significantly with ES6 and beyond. These features make code more readable, maintainable, and powerful.</p>
          
//           <h4>Arrow Functions</h4>
//           <p>Cleaner syntax and lexical 'this' binding:</p>
//           <pre><code>
// // Traditional function
// function add(a, b) {
//   return a + b;
// }

// // Arrow function
// const add = (a, b) => a + b;
//           </code></pre>
          
//           <h4>Destructuring</h4>
//           <p>Extract values from arrays and objects easily:</p>
//           <pre><code>
// // Object destructuring
// const { name, age } = person;

// // Array destructuring
// const [first, second] = array;
//           </code></pre>
          
//           <h4>Template Literals</h4>
//           <p>Better string interpolation and multiline strings:</p>
//           <pre><code>
// const message = \`Hello \${name}!
// Welcome to our website.\`;
//           </code></pre>
          
//           <h4>Async/Await</h4>
//           <p>Handle asynchronous operations more elegantly:</p>
//           <pre><code>
// async function fetchData() {
//   try {
//     const response = await fetch('/api/data');
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }
//           </code></pre>
          
//           <h4>Modules</h4>
//           <p>Organize code with import/export:</p>
//           <pre><code>
// // Export
// export const utils = { ... };
// export default MyComponent;

// // Import
// import MyComponent, { utils } from './module.js';
//           </code></pre>
//         `,
//         category: "development",
//         date: "2024-11-20",
//         readTime: "6 min read",
//         image: "assets/blog/javascript-es6.jpg"
//       },
      
//       {
//         id: 6,
//         title: "Creating Engaging FNF Mod Mechanics",
//         excerpt: "Design unique gameplay mechanics that make your FNF mod stand out. From custom note types to interactive elements.",
//         content: `
//           <h3>Innovative FNF Mod Mechanics</h3>
//           <p>Creating unique mechanics can set your mod apart from the thousands of others. Let's explore some creative possibilities.</p>
          
//           <h4>Custom Note Types</h4>
//           <p>Different note types can add variety to gameplay:</p>
//           <ul>
//             <li><strong>Hold notes:</strong> Extended presses for sustained sounds</li>
//             <li><strong>Double notes:</strong> Require two keys simultaneously</li>
//             <li><strong>Warning notes:</strong> Give players advance notice</li>
//             <li><strong>Invisible notes:</strong> Test player memory and rhythm</li>
//           </ul>
          
//           <h4>Environmental Interactions</h4>
//           <p>Make the background part of the gameplay:</p>
//           <ol>
//             <li><strong>Camera movements:</strong> Shake, zoom, and rotate effects</li>
//             <li><strong>Lighting changes:</strong> Dynamic lighting based on music</li>
//             <li><strong>Character animations:</strong> Reactive sprites</li>
//             <li><strong>Particle effects:</strong> Visual feedback for hits/misses</li>
//           </ol>
          
//           <h4>Difficulty Scaling</h4>
//           <p>Design mechanics that scale naturally:</p>
//           <ul>
//             <li>Start simple, add complexity gradually</li>
//             <li>Use familiar patterns before introducing new ones</li>
//             <li>Provide clear visual/audio cues</li>
//             <li>Test with players of different skill levels</li>
//           </ul>
          
//           <h4>Technical Implementation</h4>
//           <p>Most engines support custom mechanics through:</p>
//           <ul>
//             <li>HScript for dynamic behavior</li>
//             <li>Custom shaders for visual effects</li>
//             <li>Modified source code for deep changes</li>
//             <li>External tools for asset generation</li>
//           </ul>
          
//           <p>Remember: The best mechanics feel natural and enhance the music, not distract from it.</p>
//         `,
//         category: "fnf",
//         date: "2024-11-15",
//         readTime: "7 min read",
//         image: "assets/blog/fnf-mechanics.jpg"
//       }
    ];
    
    this.filteredPosts = [...this.posts];
  }

  // Bind event listeners
  bindEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.blog-filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const filter = e.target.dataset.category;
        this.filterPosts(filter);
        this.updateActiveFilter(e.target);
      });
    });

    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.loadMorePosts();
      });
    }

    // Modal close
    const modalClose = document.getElementById('blogModalClose');
    const modal = document.getElementById('blogModal');
    if (modalClose && modal) {
      modalClose.addEventListener('click', () => {
        this.closeModal();
      });
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  // Filter posts by category
  filterPosts(category) {
    this.currentFilter = category;
    this.currentPage = 1;
    
    if (category === 'all') {
      this.filteredPosts = [...this.posts];
    } else {
      this.filteredPosts = this.posts.filter(post => post.category === category);
    }
    
    this.renderPosts();
  }

  // Update active filter button
  updateActiveFilter(activeButton) {
    const filterButtons = document.querySelectorAll('.blog-filter-btn');
    filterButtons.forEach(button => {
      button.classList.remove('active');
    });
    activeButton.classList.add('active');
  }

  // Render posts to the DOM
  renderPosts() {
    const blogGrid = document.getElementById('blogGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!blogGrid) return;

    // Clear existing posts
    blogGrid.innerHTML = '';
    
    // Calculate posts to show
    const postsToShow = Math.min(this.maxDisplayedPosts, this.filteredPosts.length);
    const postsToRender = this.filteredPosts.slice(0, postsToShow);
    
    // Render each post
    postsToRender.forEach((post, index) => {
      const postElement = this.createPostElement(post, index);
      blogGrid.appendChild(postElement);
    });

    // Show/hide load more button
    if (loadMoreBtn) {
      if (postsToShow < this.filteredPosts.length) {
        loadMoreBtn.style.display = 'flex';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }

    // Trigger animations
    this.triggerAnimations();
  }

  // Create a post element
  createPostElement(post, index) {
    const postDiv = document.createElement('div');
    postDiv.className = 'blog-card';
    postDiv.style.animationDelay = `${index * 0.2}s`;
    postDiv.dataset.postId = post.id;
    
    // Format date
    const date = new Date(post.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    postDiv.innerHTML = `
      <div class="blog-card-header">
        <img src="${post.image}" alt="${post.title}" class="blog-card-image" loading="lazy" />
        <div class="blog-card-overlay"></div>
        <div class="blog-category-badge ${post.category}">
          ${this.getCategoryLabel(post.category)}
        </div>
        <div class="blog-date-badge">${formattedDate}</div>
      </div>
      <div class="blog-card-content">
        <h3 class="blog-card-title">${post.title}</h3>
        <p class="blog-card-excerpt">${post.excerpt}</p>
        <div class="blog-card-footer">
          <div class="blog-read-time">
            <i class="bx bx-time-five"></i>
            ${post.readTime}
          </div>
          <div class="blog-read-more">
            Read More <i class="bx bx-right-arrow-alt"></i>
          </div>
        </div>
      </div>
    `;

    // Add click event to open modal
    postDiv.addEventListener('click', () => {
      this.openModal(post);
    });

    return postDiv;
  }

  // Get category label for display
  getCategoryLabel(category) {
    const labels = {
      'development': 'Dev',
      'fnf': 'FNF',
      'community': 'Community',
      'tutorials': 'Tutorial'
    };
    return labels[category] || category;
  }

  // Load more posts
  loadMorePosts() {
    this.maxDisplayedPosts += this.postsPerPage;
    this.renderPosts();
  }

  // Open blog post modal
  openModal(post) {
    const modal = document.getElementById('blogModal');
    const modalBody = document.getElementById('blogModalBody');
    
    if (!modal || !modalBody) return;

    // Format date
    const date = new Date(post.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    modalBody.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
          <span class="blog-category-badge ${post.category}">
            ${this.getCategoryLabel(post.category)}
          </span>
          <span style="color: rgba(255, 255, 255, 0.7); font-size: 1.4rem;">${formattedDate}</span>
          <span style="color: rgba(255, 255, 255, 0.7); font-size: 1.4rem;">•</span>
          <span style="color: rgba(255, 255, 255, 0.7); font-size: 1.4rem;">${post.readTime}</span>
        </div>
        <h1 style="font-size: 3rem; margin-bottom: 2rem; color: var(--main-color); line-height: 1.2;">${post.title}</h1>
        <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 12px; margin-bottom: 2rem;" />
      </div>
      <div style="font-size: 1.6rem; line-height: 1.8; color: var(--text-color);">
        ${post.content}
      </div>
    `;

    // Prevent body scrolling with classes
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    
    // Add modal class and show
    modal.classList.add('active');
    
    // Focus trap for accessibility
    modal.focus();
  }

  // Close modal
  closeModal() {
    const modal = document.getElementById('blogModal');
    if (modal) {
      modal.classList.remove('active');
      
      // Restore body scrolling
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    }
  }

  // Trigger animations for newly added elements
  triggerAnimations() {
    const cards = document.querySelectorAll('.blog-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '1';
      }, index * 100);
    });
  }

  // Add a new blog post (for easy content management)
  addPost(postData) {
    const newPost = {
      id: this.posts.length + 1,
      ...postData,
      date: postData.date || new Date().toISOString().split('T')[0],
      image: postData.image || 'assets/blog/default.jpg'
    };
    
    this.posts.unshift(newPost); // Add to beginning
    this.filterPosts(this.currentFilter); // Re-render with current filter
  }

  // Update an existing post
  updatePost(id, updatedData) {
    const postIndex = this.posts.findIndex(post => post.id === id);
    if (postIndex !== -1) {
      this.posts[postIndex] = { ...this.posts[postIndex], ...updatedData };
      this.filterPosts(this.currentFilter);
    }
  }

  // Delete a post
  deletePost(id) {
    this.posts = this.posts.filter(post => post.id !== id);
    this.filterPosts(this.currentFilter);
  }

  // Get posts by category
  getPostsByCategory(category) {
    return this.posts.filter(post => post.category === category);
  }

  // Search posts
  searchPosts(query) {
    const searchTerm = query.toLowerCase();
    return this.posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm)
    );
  }
}

// Initialize blog manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if blog section exists
  if (document.getElementById('blogGrid')) {
    window.blogManager = new BlogManager();
  }
});

// Export for easy access
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlogManager;
}

// Example of how to add new posts easily:
/*
// Add this code anywhere to add a new blog post
window.blogManager.addPost({
  title: "Your New Blog Post Title",
  excerpt: "A brief description of your post...",
  content: `
    <h3>Your Content Here</h3>
    <p>Full HTML content of your blog post...</p>
  `,
  category: "development", // or "fnf", "community", "tutorials"
  readTime: "5 min read",
  image: "assets/blog/your-image.jpg" // optional, defaults to default.jpg
});
*/
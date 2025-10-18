// Enhanced Blog Management System
class BlogManager {
  constructor() {
    this.posts = [];
    this.filteredPosts = [];
    this.currentFilter = 'all';
    this.postsPerPage = 6;
    this.currentPage = 1;
    this.maxDisplayedPosts = 6;
    this.expandedCard = null;
    
    this.init();
  }

  init() {
    this.loadPosts();
    this.bindEventListeners();
    this.renderPosts();
  }

  // Enhanced blog posts data - easily editable
  loadPosts() {
    this.posts = [
      {
        id: 1,
        title: "New Design, New Look",
        excerpt: `A fresh, modern design is out now! <br> Discover the fresh, modern overhaul of our site! We've reimagined the design from the ground up, bringing you sleek animations, improved typography, enhanced user experience, and mobile optimization. Go and check it out by yourself!`,
        content: "",
        category: "development",
        date: "2025-10-18",
        readTime: "1 min read",
        image: "assets/blog/minimalist_website_design.png",
        tags: ["web design", "redesign"]
      },
      {
        id: 2,
        title: "Complete Site Redesign - Celebrating 150 Views!",
        excerpt: "A fresh, modern design overhaul to celebrate reaching 150 site views. Discover what's new and improved in this major update.",
        content: `
        <h3>A New Era for the Site</h3>
        <p>Hitting 150 views was a milestone worth celebrating, and what better way than with a complete site redesign! This wasn't just a simple refresh – it was a ground-up reimagining of how the site should look and feel.</p>
        
        <h4>What's New?</h4>
        <ul>
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
        readTime: "5 min read",
        image: "assets/blog/web-celebrate.png",
        tags: ["web design", "milestone", "redesign", "community"]
      },
      {
        id: 3,
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
        readTime: "4 min read",
        image: "assets/blog/discord-community-your-input-needed.png",
        tags: ["discord", "community", "feedback", "future"]
      }
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
//           <pre><code>@keyframes slideInUp {
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
// }</code></pre>
//         `,
//         category: "tutorials",
//         date: "2025-08-08",
//         readTime: "8 min read",
//         image: "assets/blog/css-animations.jpg",
//         tags: ["css", "animations", "performance", "web development"]
//       },
//       {
//         id: 4,
//         title: "JavaScript ES6+ Features You Should Know",
//         excerpt: "Essential modern JavaScript features that will improve your code quality and development experience. From arrow functions to async/await.",
//         content: `
//           <h3>Modern JavaScript Features</h3>
//           <p>JavaScript has evolved significantly with ES6 and beyond. These features make code more readable, maintainable, and powerful.</p>
          
//           <h4>Arrow Functions</h4>
//           <p>Cleaner syntax and lexical 'this' binding:</p>
//           <pre><code>// Traditional function
// function add(a, b) {
//   return a + b;
// }

// // Arrow function
// const add = (a, b) => a + b;</code></pre>
          
//           <h4>Destructuring</h4>
//           <p>Extract values from arrays and objects easily:</p>
//           <pre><code>// Object destructuring
// const { name, age } = person;

// // Array destructuring
// const [first, second] = array;</code></pre>
          
//           <h4>Template Literals</h4>
//           <p>Better string interpolation and multiline strings:</p>
//           <pre><code>const message = \`Hello \${name}!
// Welcome to our website.\`;</code></pre>
          
//           <h4>Async/Await</h4>
//           <p>Handle asynchronous operations more elegantly:</p>
//           <pre><code>async function fetchData() {
//   try {
//     const response = await fetch('/api/data');
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }</code></pre>
          
//           <h4>Modules</h4>
//           <p>Organize code with import/export:</p>
//           <pre><code>// Export
// export const utils = { ... };
// export default MyComponent;

// // Import
// import MyComponent, { utils } from './module.js';</code></pre>
//         `,
//         category: "development",
//         date: "2025-08-05",
//         readTime: "6 min read",
//         image: "assets/blog/javascript-es6.jpg",
//         tags: ["javascript", "es6", "modern js", "programming"]
//       },
//       {
//         id: 5,
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
//         date: "2025-08-03",
//         readTime: "7 min read",
//         image: "assets/blog/fnf-mechanics.jpg",
//         tags: ["fnf", "game development", "modding", "mechanics"]
//       },
//       {
//         id: 6,
//         title: "Building Responsive Web Components",
//         excerpt: "Learn how to create reusable, responsive web components that work across different devices and screen sizes.",
//         content: `
//           <h3>Modern Web Component Architecture</h3>
//           <p>Building responsive web components is essential for modern web development. Let's explore best practices and techniques.</p>
          
//           <h4>Component Design Principles</h4>
//           <ul>
//             <li><strong>Single Responsibility:</strong> Each component should have one clear purpose</li>
//             <li><strong>Reusability:</strong> Design for multiple use cases</li>
//             <li><strong>Accessibility:</strong> Include proper ARIA labels and keyboard navigation</li>
//             <li><strong>Performance:</strong> Optimize for fast loading and smooth interactions</li>
//           </ul>
          
//           <h4>Responsive Design Strategies</h4>
//           <p>Key approaches for responsive components:</p>
//           <ol>
//             <li><strong>Mobile-first design:</strong> Start with mobile and scale up</li>
//             <li><strong>Flexible layouts:</strong> Use CSS Grid and Flexbox</li>
//             <li><strong>Relative units:</strong> Prefer rem, em, and percentages</li>
//             <li><strong>Container queries:</strong> Style based on container size</li>
//           </ol>
          
//           <h4>CSS Grid vs Flexbox</h4>
//           <p>When to use each layout method:</p>
//           <ul>
//             <li><strong>CSS Grid:</strong> Two-dimensional layouts, complex designs</li>
//             <li><strong>Flexbox:</strong> One-dimensional layouts, component alignment</li>
//           </ul>
          
//           <h4>Testing Across Devices</h4>
//           <p>Ensure your components work everywhere:</p>
//           <ul>
//             <li>Use browser dev tools for device simulation</li>
//             <li>Test on real devices when possible</li>
//             <li>Consider touch interactions and hover states</li>
//             <li>Validate accessibility with screen readers</li>
//           </ul>
//         `,
//         category: "tutorials",
//         date: "2025-08-01",
//         readTime: "9 min read",
//         image: "assets/blog/responsive-components.jpg",
//         tags: ["responsive design", "web components", "css", "mobile"]
//       },
//       {
//         id: 7,
//         title: "My Journey into Game Development",
//         excerpt: "From web development to game creation - sharing my experiences, challenges, and lessons learned in the world of indie game development.",
//         content: `
//           <h3>From Web to Games</h3>
//           <p>Transitioning from web development to game development has been an exciting journey filled with new challenges and creative opportunities.</p>
          
//           <h4>Why Game Development?</h4>
//           <p>Several factors drew me to game development:</p>
//           <ul>
//             <li><strong>Creative Expression:</strong> Games offer unique storytelling opportunities</li>
//             <li><strong>Technical Challenges:</strong> Complex systems and optimization problems</li>
//             <li><strong>Community Impact:</strong> Creating experiences that bring people together</li>
//             <li><strong>Skill Transfer:</strong> Many web dev skills apply to game development</li>
//           </ul>
          
//           <h4>Tools and Technologies</h4>
//           <p>My current game development stack:</p>
//           <ul>
//             <li><strong>Engine:</strong> Unity for 3D projects, Godot for 2D</li>
//             <li><strong>Programming:</strong> C# for Unity, GDScript for Godot</li>
//             <li><strong>Art:</strong> Blender for 3D, Aseprite for pixel art</li>
//             <li><strong>Audio:</strong> Audacity and FL Studio for sound design</li>
//           </ul>
          
//           <h4>Challenges Faced</h4>
//           <p>Game development presents unique challenges:</p>
//           <ol>
//             <li><strong>Performance Optimization:</strong> 60 FPS is non-negotiable</li>
//             <li><strong>Asset Management:</strong> Organizing large amounts of content</li>
//             <li><strong>Player Testing:</strong> Balancing difficulty and fun</li>
//             <li><strong>Scope Creep:</strong> Keeping projects manageable</li>
//           </ol>
          
//           <h4>Lessons Learned</h4>
//           <p>Key insights from my game development journey:</p>
//           <ul>
//             <li>Start small and finish projects</li>
//             <li>Prototype early and often</li>
//             <li>Player feedback is invaluable</li>
//             <li>Polish makes a huge difference</li>
//           </ul>
          
//           <h4>Future Plans</h4>
//           <p>I'm currently working on a puzzle-platformer that combines my love for creative mechanics with storytelling. Stay tuned for updates!</p>
//         `,
//         category: "other",
//         date: "2025-07-28",
//         readTime: "6 min read",
//         image: "assets/blog/game-development.jpg",
//         tags: ["game development", "indie games", "unity", "personal journey"]
//       },
//       {
//         id: 8,
//         title: "The Art of Code Reviews",
//         excerpt: "Best practices for conducting effective code reviews that improve code quality and team collaboration.",
//         content: `
//           <h3>Code Reviews That Matter</h3>
//           <p>Code reviews are one of the most valuable practices in software development, yet they're often done poorly or skipped entirely.</p>
          
//           <h4>Why Code Reviews Matter</h4>
//           <ul>
//             <li><strong>Quality Assurance:</strong> Catch bugs before they reach production</li>
//             <li><strong>Knowledge Sharing:</strong> Spread expertise across the team</li>
//             <li><strong>Consistency:</strong> Maintain coding standards and patterns</li>
//             <li><strong>Learning:</strong> Both reviewer and author learn from the process</li>
//           </ul>
          
//           <h4>What to Look For</h4>
//           <p>Focus on these key areas during reviews:</p>
//           <ol>
//             <li><strong>Logic and Correctness:</strong> Does the code do what it's supposed to?</li>
//             <li><strong>Performance:</strong> Are there obvious performance issues?</li>
//             <li><strong>Security:</strong> Check for common vulnerabilities</li>
//             <li><strong>Maintainability:</strong> Is the code easy to understand and modify?</li>
//             <li><strong>Testing:</strong> Are there adequate tests for the changes?</li>
//           </ol>
          
//           <h4>Review Etiquette</h4>
//           <p>How to give constructive feedback:</p>
//           <ul>
//             <li>Be specific and actionable in your comments</li>
//             <li>Explain the 'why' behind your suggestions</li>
//             <li>Praise good code, not just point out problems</li>
//             <li>Ask questions instead of making demands</li>
//             <li>Focus on the code, not the person</li>
//           </ul>
          
//           <h4>Tools and Automation</h4>
//           <p>Leverage tools to make reviews more effective:</p>
//           <ul>
//             <li><strong>Linters:</strong> Catch style issues automatically</li>
//             <li><strong>Static Analysis:</strong> Find potential bugs and security issues</li>
//             <li><strong>CI/CD:</strong> Run tests and checks automatically</li>
//             <li><strong>Review Tools:</strong> Use GitHub, GitLab, or Bitbucket features</li>
//           </ul>
//         `,
//         category: "development",
//         date: "2025-07-25",
//         readTime: "5 min read",
//         image: "assets/blog/code-reviews.jpg",
//         tags: ["code review", "best practices", "team collaboration", "software quality"]
//       },
//       {
//         id: 9,
//         title: "Exploring Creative Coding with p5.js",
//         excerpt: "Dive into the world of creative coding and generative art using p5.js. Learn to create interactive visual experiences.",
//         content: `
//           <h3>Art Meets Code</h3>
//           <p>Creative coding opens up a world where programming becomes a medium for artistic expression. p5.js makes this accessible to everyone.</p>
          
//           <h4>What is Creative Coding?</h4>
//           <p>Creative coding is the practice of using programming as a creative medium. It's about:</p>
//           <ul>
//             <li><strong>Experimentation:</strong> Trying new ideas and techniques</li>
//             <li><strong>Expression:</strong> Using code to convey emotions or concepts</li>
//             <li><strong>Interaction:</strong> Creating responsive, dynamic experiences</li>
//             <li><strong>Generative Art:</strong> Using algorithms to create art</li>
//           </ul>
          
//           <h4>Getting Started with p5.js</h4>
//           <p>p5.js is perfect for beginners:</p>
//           <pre><code>function setup() {
//   createCanvas(400, 400);
// }

// function draw() {
//   background(220);
//   ellipse(mouseX, mouseY, 50, 50);
// }</code></pre>
          
//           <h4>Creative Techniques</h4>
//           <p>Popular approaches in creative coding:</p>
//           <ol>
//             <li><strong>Particle Systems:</strong> Simulate natural phenomena</li>
//             <li><strong>Fractals:</strong> Create complex patterns from simple rules</li>
//             <li><strong>Noise Functions:</strong> Generate organic, natural-looking movement</li>
//             <li><strong>Color Theory:</strong> Use color palettes to evoke emotions</li>
//           </ol>
          
//           <h4>Interactive Elements</h4>
//           <p>Make your art responsive:</p>
//           <ul>
//             <li>Mouse and keyboard input</li>
//             <li>Audio visualization</li>
//             <li>Camera and sensor data</li>
//             <li>Real-time data feeds</li>
//           </ul>
          
//           <h4>Inspiration and Community</h4>
//           <p>Where to find inspiration:</p>
//           <ul>
//             <li><strong>OpenProcessing:</strong> Share and discover sketches</li>
//             <li><strong>Creative Coding Challenges:</strong> Daily practice prompts</li>
//             <li><strong>Generative Art Communities:</strong> Connect with other artists</li>
//             <li><strong>Nature:</strong> The best source of algorithmic inspiration</li>
//           </ul>
//         `,
//         category: "other",
//         date: "2025-07-22",
//         readTime: "7 min read",
//         image: "assets/blog/creative-coding.jpg",
//         tags: ["creative coding", "p5.js", "generative art", "interactive design"]
//       },
//       {
//         id: 10,
//         title: "Building a Personal Brand as a Developer",
//         excerpt: "Tips and strategies for establishing your online presence and building a strong personal brand in the tech industry.",
//         content: `
//           <h3>Your Digital Identity</h3>
//           <p>In today's competitive tech landscape, having a strong personal brand can open doors to new opportunities and help you stand out.</p>
          
//           <h4>Why Personal Branding Matters</h4>
//           <ul>
//             <li><strong>Career Opportunities:</strong> Attract better job offers and clients</li>
//             <li><strong>Network Building:</strong> Connect with like-minded professionals</li>
//             <li><strong>Knowledge Sharing:</strong> Establish yourself as a thought leader</li>
//             <li><strong>Personal Growth:</strong> Reflect on and articulate your expertise</li>
//           </ul>
          
//           <h4>Building Your Online Presence</h4>
//           <p>Key platforms and strategies:</p>
//           <ol>
//             <li><strong>Portfolio Website:</strong> Your digital home base</li>
//             <li><strong>GitHub:</strong> Showcase your code and contributions</li>
//             <li><strong>LinkedIn:</strong> Professional networking and content</li>
//             <li><strong>Twitter/X:</strong> Engage with the tech community</li>
//             <li><strong>Blog/Medium:</strong> Share your knowledge and experiences</li>
//           </ol>
          
//           <h4>Content Strategy</h4>
//           <p>What to share and how often:</p>
//           <ul>
//             <li><strong>Technical Tutorials:</strong> Teach what you've learned</li>
//             <li><strong>Project Showcases:</strong> Highlight your best work</li>
//             <li><strong>Industry Insights:</strong> Share your perspective on trends</li>
//             <li><strong>Personal Journey:</strong> Be authentic about your experiences</li>
//           </ul>
          
//           <h4>Consistency is Key</h4>
//           <p>Building a brand takes time:</p>
//           <ul>
//             <li>Post regularly, even if it's just small updates</li>
//             <li>Maintain a consistent voice and style</li>
//             <li>Engage genuinely with others' content</li>
//             <li>Be patient - results take time to show</li>
//           </ul>
          
//           <h4>Common Mistakes to Avoid</h4>
//           <ul>
//             <li>Being too promotional or sales-focused</li>
//             <li>Copying others instead of being authentic</li>
//             <li>Neglecting to engage with the community</li>
//             <li>Giving up too early in the process</li>
//           </ul>
//         `,
//         category: "other",
//         date: "2025-07-20",
//         readTime: "6 min read",
//         image: "assets/blog/personal-brand.jpg",
//         tags: ["personal branding", "career development", "networking", "content creation"]
//       }
    ];
    
    this.filteredPosts = [...this.posts];
  }

  // Enhanced event listeners
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

    // Close expanded cards when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.blog-card') && this.expandedCard) {
        this.collapseCard();
      }
    });

    // Escape key to close expanded card
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.expandedCard) {
        this.collapseCard();
      }
    });
  }

  // Enhanced filter functionality with 'other' category
  filterPosts(category) {
    this.currentFilter = category;
    this.currentPage = 1;
    
    if (category === 'all') {
      this.filteredPosts = [...this.posts];
    } else {
      this.filteredPosts = this.posts.filter(post => post.category === category);
    }
    
    // Collapse any expanded card when filtering
    if (this.expandedCard) {
      this.collapseCard();
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

  // Enhanced post rendering
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

  // Enhanced post element creation
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

    // Create tags HTML
    const tagsHTML = post.tags ? post.tags.map(tag => 
      `<span class="blog-tag">${tag}</span>`
    ).join('') : '';

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
        ${tagsHTML ? `<div class="blog-tags">${tagsHTML}</div>` : ''}
        <div class="blog-card-footer">
          <div class="blog-read-time">
            <i class="bx bx-time"></i>
            <span>${post.readTime}</span>
          </div>
          <div class="blog-read-more">
            <span>Read More</span>
            <i class="bx bx-right-arrow-alt"></i>
          </div>
        </div>
        <div class="blog-expanded-content" style="display: none;">
          <div class="blog-content-wrapper">
            <div class="blog-close-btn">
              <i class="bx bx-x"></i>
            </div>
            <div class="blog-full-content">
              ${post.content}
            </div>
          </div>
        </div>
      </div>
    `;

    // Add click event for card expansion
    postDiv.addEventListener('click', (e) => {
      // Don't expand if clicking on close button
      if (e.target.closest('.blog-close-btn')) {
        this.collapseCard();
        return;
      }
      
      this.expandCard(postDiv, post);
    });

    return postDiv;
  }

  // New method to expand card with animation
  expandCard(cardElement, post) {
    // Collapse any currently expanded card
    if (this.expandedCard && this.expandedCard !== cardElement) {
      this.collapseCard();
    }

    // If clicking the same card, toggle it
    if (this.expandedCard === cardElement) {
      this.collapseCard();
      return;
    }

    this.expandedCard = cardElement;
    const expandedContent = cardElement.querySelector('.blog-expanded-content');
    const cardContent = cardElement.querySelector('.blog-card-content');
    
    // Add expanded class
    cardElement.classList.add('expanded');
    
    // Show expanded content with animation
    expandedContent.style.display = 'block';
    
    // Animate the expansion
    requestAnimationFrame(() => {
      expandedContent.style.opacity = '1';
      expandedContent.style.transform = 'translateY(0)';
      cardElement.style.transform = 'scale(1.02)';
      cardElement.style.zIndex = '10';
    });

    // Scroll card into view
    setTimeout(() => {
      cardElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 300);
  }

  // New method to collapse card with animation
  collapseCard() {
    if (!this.expandedCard) return;

    const expandedContent = this.expandedCard.querySelector('.blog-expanded-content');
    
    // Animate collapse
    expandedContent.style.opacity = '0';
    expandedContent.style.transform = 'translateY(20px)';
    this.expandedCard.style.transform = 'scale(1)';
    this.expandedCard.style.zIndex = '1';
    
    // Remove expanded class and hide content after animation
    setTimeout(() => {
      this.expandedCard.classList.remove('expanded');
      expandedContent.style.display = 'none';
      this.expandedCard = null;
    }, 300);
  }

  // Enhanced category labels with 'other' category
  getCategoryLabel(category) {
    const labels = {
      'all': 'All Posts',
      'development': 'Development',
      'fnf': 'FNF Modding',
      'community': 'Community',
      'tutorials': 'Tutorials',
      'other': 'Other'
    };
    return labels[category] || category;
  }

  // Load more posts functionality
  loadMorePosts() {
    this.maxDisplayedPosts += this.postsPerPage;
    this.renderPosts();
  }

  // Trigger staggered animations
  triggerAnimations() {
    const cards = document.querySelectorAll('.blog-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  // Search functionality (bonus feature)
  searchPosts(query) {
    if (!query.trim()) {
      this.filteredPosts = [...this.posts];
    } else {
      this.filteredPosts = this.posts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
    this.renderPosts();
  }
}

// Initialize blog manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BlogManager();
});
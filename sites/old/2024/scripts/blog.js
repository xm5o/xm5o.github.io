// Sample data for blog updates with release date
const blogData = [
  {
    title: "Improves",
    content: "Change site colors, improve socail cards, remove fortnite leaks button on home section, remove settings... stay turn",
    releaseDate: "2024-09-11",
    version: "1.51"
  },
  {
    title: "2024 update",
    content: "Add NEW Settings on settings page, Change site colors, fix some bugs",
    releaseDate: "2024-01-19",
    version: "1.5"
  },
    {
      title: "Fix Update",
      content: "Add Settings Page, Fix Home Page",
      releaseDate: "2023-12-28",
      version: "1.41"
    },
    {
        title: "New Update, Fix Update",
        content: "Remove Level System, Remove Chat Bot, Remove Simple Game BETA Version, Fix Some Bugs, Remove QR Code Creator",
        releaseDate: "2023-12-01",
        version: "1.40.1"
    },
    {
      title: "New Features",
      content: "Add Level System, Add Some Animation, Add Chat Bot BETA Version, Add Simple Game BETA Version, Add New Alert, Fix Nav Bar For Computer Users And Make It Better, Fix Some Bugs, Add QR Code Creator",
      releaseDate: "2023-07-03",
      version: "1.40"
    },
    {
      title: "Fix Update",
      content: "Fix White BG Bug, Fix Some Bugs For Phone Users, Add Loading Screen For Get Data Of Current Section",
      releaseDate: "2023-06-10",
      version: "1.35"
    }
  ];
  
  // Function to calculate days since release
  function getDaysSinceRelease(releaseDate) {
    const today = new Date();
    const release = new Date(releaseDate);
    const timeDifference = today.getTime() - release.getTime();
    const daysSinceRelease = Math.floor(timeDifference / (1000 * 3600 * 24));
    return daysSinceRelease;
  }
  
  // Function to render blog posts
  function renderBlogPosts(data) {
    const blogContainer = document.getElementById("blogContainer");
  
    data.forEach(post => {
      const daysSinceRelease = getDaysSinceRelease(post.releaseDate);
      const blogPost = document.createElement("div");
      blogPost.classList.add("blog-post");
      blogPost.innerHTML = `
        <h2>${post.title}</h2>
        <h4>${post.content}</h4>
        <h6>Version: ${post.version}</h6>
        <h6>Released: ${post.releaseDate}</h6>
        <h6>Days Since Release: ${daysSinceRelease} days ago</h6>
      `;
      blogContainer.appendChild(blogPost);
    });
  }
  
  // Render the blog posts
  renderBlogPosts(blogData);
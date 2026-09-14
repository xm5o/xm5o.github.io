const settings = Object.freeze({
  slots: Object.freeze({
    enabled: true,
    total: 4,
    used: 0
  }),
  submission: Object.freeze({
    enabled: true,
    // Set this to the public HTTPS origin that points to Selina's commission API.
    // Example: https://selina-api.example.com
    endpoint: ''
  })
});

export default settings;

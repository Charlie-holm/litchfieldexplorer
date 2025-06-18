const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Import your route files
require('./point-system')(app);
require('./process-order')(app);

const setupRewardRoutes = require('./process-reward').default;
setupRewardRoutes(app);

app.listen(PORT, () => {
    console.log(`🟢 Server listening on port ${PORT}`);
});
const express = require('express');
const app = express();
app.use(express.json());

let userPoints = {};

app.post('/add-points', (req, res) => {
    const { userId, points } = req.body;
    userPoints[userId] = (userPoints[userId] || 0) + points;
    res.json({ userId, totalPoints: userPoints[userId] });
});

app.listen(3000, () => console.log('Server running on port 3000'));
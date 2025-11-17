require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const formsRouter = require('./routes/forms');

const PORT = 4000;
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/forms', formsRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

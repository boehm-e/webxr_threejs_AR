const http    = require('http');
const express = require('express');
const path    = require('path');
const cors    = require('cors');

const app     = express();
const server	= http.createServer(app);
const port    = process.env.PORT || 3018;

app.use(cors());
app.use(express.static('public'));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));


server.listen(port, _ => console.log(`server listening on port ${port}`));

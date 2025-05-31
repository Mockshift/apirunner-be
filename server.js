const express = require('express');

const app = express();

const testt = 'aaa';

app.get('/', (req, res) => {
  res.status(200).send('Hello, World!');
});

const port = 3000;
app.listen(port, () => {
  console.log('Server is running on http://localhost:3000');
});

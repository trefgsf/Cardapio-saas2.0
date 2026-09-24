const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const painelRoutes = require('./routes/painel');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false
}));

app.use('/', authRoutes);
app.use('/', painelRoutes);

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

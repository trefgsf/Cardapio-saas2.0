const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

const router = express.Router();

router.get('/cadastro', (req, res) => {
  res.render('cadastro', { erro: null });
});

router.post('/cadastro', async (req, res) => {
  const { nome_restaurante, email, senha, slug } = req.body;
  try {
    const senha_hash = await bcrypt.hash(senha, 10);
    await pool.query(
      `INSERT INTO restaurantes (nome_restaurante, email, senha_hash, slug)
       VALUES ($1, $2, $3, $4)`,
      [nome_restaurante, email, senha_hash, slug]
    );
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('cadastro', { erro: 'Erro ao cadastrar. E-mail ou slug já existe?' });
  }
});

router.get('/login', (req, res) => {
  res.render('login', { erro: null });
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM restaurantes WHERE email = $1',
      [email]
    );
    const restaurante = result.rows[0];

    if (!restaurante) {
      return res.render('login', { erro: 'E-mail não encontrado.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, restaurante.senha_hash);
    if (!senhaCorreta) {
      return res.render('login', { erro: 'Senha incorreta.' });
    }

    req.session.restauranteId = restaurante.id;
    req.session.restauranteNome = restaurante.nome_restaurante;
    req.session.restauranteSlug = restaurante.slug;
    res.redirect('/painel');
  } catch (err) {
    console.error(err);
    res.render('login', { erro: 'Erro ao entrar.' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;

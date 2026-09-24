const express = require('express');
const pool = require('../config/db');
const upload = require('../config/cloudinary');

const router = express.Router();

function protegerRota(req, res, next) {
  if (!req.session.restauranteId) {
    return res.redirect('/login');
  }
  next();
}

router.get('/painel', protegerRota, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM pratos WHERE restaurante_id = $1 ORDER BY criado_em DESC',
      [req.session.restauranteId]
    );
    res.render('painel', {
      pratos: result.rows,
      nomeRestaurante: req.session.restauranteNome,
      slug: req.session.restauranteSlug,
      erro: null
    });
  } catch (err) {
    console.error(err);
    res.send('Erro ao carregar painel.');
  }
});

router.get('/painel/novo', protegerRota, (req, res) => {
  res.render('prato-form', { prato: null, erro: null });
});

router.post('/painel/novo', protegerRota, upload.single('foto'), async (req, res) => {
  const { nome, descricao, preco } = req.body;
  const foto_url = req.file ? req.file.path : null;
  try {
    await pool.query(
      `INSERT INTO pratos (restaurante_id, nome, descricao, preco, foto_url)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.session.restauranteId, nome, descricao, preco, foto_url]
    );
    res.redirect('/painel');
  } catch (err) {
    console.error(err);
    res.render('prato-form', { prato: null, erro: 'Erro ao criar prato.' });
  }
});

router.get('/painel/editar/:id', protegerRota, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM pratos WHERE id = $1 AND restaurante_id = $2',
      [req.params.id, req.session.restauranteId]
    );
    if (result.rows.length === 0) return res.redirect('/painel');
    res.render('prato-form', { prato: result.rows[0], erro: null });
  } catch (err) {
    console.error(err);
    res.redirect('/painel');
  }
});

router.post('/painel/editar/:id', protegerRota, upload.single('foto'), async (req, res) => {
  const { nome, descricao, preco } = req.body;
  try {
    if (req.file) {
      await pool.query(
        `UPDATE pratos SET nome=$1, descricao=$2, preco=$3, foto_url=$4
         WHERE id=$5 AND restaurante_id=$6`,
        [nome, descricao, preco, req.file.path, req.params.id, req.session.restauranteId]
      );
    } else {
      await pool.query(
        `UPDATE pratos SET nome=$1, descricao=$2, preco=$3
         WHERE id=$4 AND restaurante_id=$5`,
        [nome, descricao, preco, req.params.id, req.session.restauranteId]
      );
    }
    res.redirect('/painel');
  } catch (err) {
    console.error(err);
    res.redirect('/painel');
  }
});

router.post('/painel/apagar/:id', protegerRota, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM pratos WHERE id = $1 AND restaurante_id = $2',
      [req.params.id, req.session.restauranteId]
    );
    res.redirect('/painel');
  } catch (err) {
    console.error(err);
    res.redirect('/painel');
  }
});

module.exports = router;

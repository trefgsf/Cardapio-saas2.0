const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/cardapio/:slug', async (req, res) => {
  try {
    const restauranteResult = await pool.query(
      'SELECT * FROM restaurantes WHERE slug = $1',
      [req.params.slug]
    );

    if (restauranteResult.rows.length === 0) {
      return res.status(404).send('Cardápio não encontrado.');
    }

    const restaurante = restauranteResult.rows[0];

    const pratosResult = await pool.query(
      'SELECT * FROM pratos WHERE restaurante_id = $1 AND ativo = true ORDER BY criado_em ASC',
      [restaurante.id]
    );

    res.render('cardapio-publico', {
      restaurante,
      pratos: pratosResult.rows,
      mesa: req.query.mesa || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar cardápio.');
  }
});

module.exports = router;

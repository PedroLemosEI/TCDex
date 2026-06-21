const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getPokedex, registerPokemon, removePokemon, getPokemonPhoto } = require('../controllers/pokedex.controller');

router.use(auth);

router.get('/', getPokedex);
router.post('/:pokemonId', registerPokemon);
router.delete('/:pokemonId', removePokemon);
router.get('/:pokemonId/photo', getPokemonPhoto);

module.exports = router;

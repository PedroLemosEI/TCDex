const User = require('../models/User');

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

exports.getPokedex = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('pokedex');
    const caught = user.pokedex.map(({ pokemonId, caughtAt }) => ({ pokemonId, caughtAt }));
    res.json(caught);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pokédex', error: err.message });
  }
};

exports.registerPokemon = async (req, res) => {
  try {
    const pokemonId = parseInt(req.params.pokemonId, 10);
    const { photo } = req.body;

    if (!pokemonId || pokemonId < 1 || pokemonId > 1025) {
      return res.status(400).json({ message: 'Invalid Pokémon ID (must be 1–1025)' });
    }

    if (!photo || !photo.startsWith('data:image/')) {
      return res.status(400).json({ message: 'A valid image is required' });
    }

    const base64Part = photo.split(',')[1] || '';
    const estimatedBytes = Math.ceil((base64Part.length * 3) / 4);
    if (estimatedBytes > MAX_PHOTO_BYTES) {
      return res.status(400).json({ message: 'Image must be under 5 MB' });
    }

    const user = await User.findById(req.user._id);
    if (user.pokedex.some(p => p.pokemonId === pokemonId)) {
      return res.status(409).json({ message: 'Pokémon already registered' });
    }

    user.pokedex.push({ pokemonId, photo });
    await user.save();

    res.status(201).json({ pokemonId, message: 'Pokémon registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to register Pokémon', error: err.message });
  }
};

exports.removePokemon = async (req, res) => {
  try {
    const pokemonId = parseInt(req.params.pokemonId, 10);
    if (!pokemonId || pokemonId < 1 || pokemonId > 1025) {
      return res.status(400).json({ message: 'Invalid Pokémon ID (must be 1–1025)' });
    }

    const user = await User.findById(req.user._id);
    const index = user.pokedex.findIndex(p => p.pokemonId === pokemonId);
    if (index === -1) {
      return res.status(404).json({ message: 'Pokémon not found in your pokédex' });
    }

    user.pokedex.splice(index, 1);
    await user.save();

    res.json({ pokemonId, message: 'Pokémon removed from pokédex' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove Pokémon', error: err.message });
  }
};

exports.getPokemonPhoto = async (req, res) => {
  try {
    const pokemonId = parseInt(req.params.pokemonId, 10);
    const user = await User.findById(req.user._id).select('pokedex');
    const entry = user.pokedex.find(p => p.pokemonId === pokemonId);

    if (!entry) {
      return res.status(404).json({ message: 'Pokémon not found in your pokédex' });
    }

    res.json({ pokemonId: entry.pokemonId, photo: entry.photo, caughtAt: entry.caughtAt });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch photo', error: err.message });
  }
};

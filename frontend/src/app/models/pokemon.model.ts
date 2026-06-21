export interface PokemonListItem {
  id: number;
  name: string;
}

export interface CaughtPokemon {
  pokemonId: number;
  caughtAt: string;
}

export interface PokemonPhoto {
  pokemonId: number;
  photo: string;
  caughtAt: string;
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CaughtPokemon, PokemonListItem, PokemonPhoto } from '../../models/pokemon.model';
import { environment } from '../../../environments/environment';

const CACHE_KEY = 'tcdex_pokemon_list';

@Injectable({ providedIn: 'root' })
export class PokedexService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/pokedex`;
  private readonly pokeApiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0';

  getAllPokemon(): Observable<PokemonListItem[]> {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) return of(JSON.parse(cached));

    return this.http.get<{ results: { name: string }[] }>(this.pokeApiUrl).pipe(
      map(res => res.results.map((p, i) => ({
        id: i + 1,
        name: p.name
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      }))),
      tap(list => localStorage.setItem(CACHE_KEY, JSON.stringify(list)))
    );
  }

  getUserPokedex(): Observable<CaughtPokemon[]> {
    return this.http.get<CaughtPokemon[]>(this.apiUrl);
  }

  registerPokemon(pokemonId: number, photo: string): Observable<{ pokemonId: number }> {
    return this.http.post<{ pokemonId: number }>(`${this.apiUrl}/${pokemonId}`, { photo });
  }

  removePokemon(pokemonId: number): Observable<{ pokemonId: number }> {
    return this.http.delete<{ pokemonId: number }>(`${this.apiUrl}/${pokemonId}`);
  }

  getPokemonPhoto(pokemonId: number): Observable<PokemonPhoto> {
    return this.http.get<PokemonPhoto>(`${this.apiUrl}/${pokemonId}/photo`);
  }
}

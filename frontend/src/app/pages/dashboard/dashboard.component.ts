import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { PokedexService } from '../../core/services/pokedex.service';
import { PokemonListItem } from '../../models/pokemon.model';
import { PokemonCardComponent } from '../../shared/components/pokemon-card/pokemon-card.component';
import { UploadModalComponent } from '../../shared/components/upload-modal/upload-modal.component';
import { PokemonDetailModalComponent } from '../../shared/components/pokemon-detail-modal/pokemon-detail-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PokemonCardComponent, UploadModalComponent, PokemonDetailModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private auth    = inject(AuthService);
  private pokedex = inject(PokedexService);
  private router  = inject(Router);

  pokemonList   = signal<PokemonListItem[]>([]);
  caughtIds     = signal<Set<number>>(new Set());
  loading       = signal(true);
  error         = signal('');
  searchQuery   = signal('');

  uploadTarget = signal<PokemonListItem | null>(null);
  viewTarget   = signal<PokemonListItem | null>(null);

  readonly currentUser = this.auth.currentUser;
  readonly caughtCount = computed(() => this.caughtIds().size);

  readonly filteredList = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.pokemonList();
    return this.pokemonList().filter(p =>
      p.name.toLowerCase().includes(q) ||
      String(p.id).includes(q)
    );
  });

  ngOnInit(): void {
    forkJoin([
      this.pokedex.getAllPokemon(),
      this.pokedex.getUserPokedex()
    ]).subscribe({
      next: ([list, caught]) => {
        this.pokemonList.set(list);
        this.caughtIds.set(new Set(caught.map(c => c.pokemonId)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load Pokédex data. Please refresh.');
        this.loading.set(false);
      }
    });
  }

  onCardClick(pokemon: PokemonListItem): void {
    if (this.caughtIds().has(pokemon.id)) {
      this.viewTarget.set(pokemon);
    } else {
      this.uploadTarget.set(pokemon);
    }
  }

  onUploadSuccess(pokemonId: number): void {
    this.caughtIds.update(ids => new Set([...ids, pokemonId]));
    this.uploadTarget.set(null);
  }

  onRemoved(pokemonId: number): void {
    this.caughtIds.update(ids => {
      const next = new Set(ids);
      next.delete(pokemonId);
      return next;
    });
    this.viewTarget.set(null);
  }

  logout(): void { this.auth.logout(); }
  goToAdmin(): void { this.router.navigate(['/admin']); }
}

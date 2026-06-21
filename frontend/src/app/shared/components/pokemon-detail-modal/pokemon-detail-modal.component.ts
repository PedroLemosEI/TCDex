import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PokedexService } from '../../../core/services/pokedex.service';
import { PokemonListItem } from '../../../models/pokemon.model';

@Component({
  selector: 'app-pokemon-detail-modal',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './pokemon-detail-modal.component.html',
  styleUrl: './pokemon-detail-modal.component.scss'
})
export class PokemonDetailModalComponent implements OnInit {
  @Input({ required: true }) pokemon!: PokemonListItem;
  @Output() close   = new EventEmitter<void>();
  @Output() removed = new EventEmitter<number>();

  private pokedex = inject(PokedexService);

  photo     = signal<string | null>(null);
  caughtAt  = signal<string | null>(null);
  loading   = signal(true);
  removing  = signal(false);
  error     = signal('');

  get paddedId(): string {
    return '#' + String(this.pokemon.id).padStart(4, '0');
  }

  ngOnInit(): void {
    this.pokedex.getPokemonPhoto(this.pokemon.id).subscribe({
      next: res => {
        this.photo.set(res.photo);
        this.caughtAt.set(res.caughtAt);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load photo.');
        this.loading.set(false);
      }
    });
  }

  remove(): void {
    if (!confirm(`Remove ${this.pokemon.name} from your Pokédex? The photo will be deleted.`)) return;
    this.removing.set(true);

    this.pokedex.removePokemon(this.pokemon.id).subscribe({
      next: () => this.removed.emit(this.pokemon.id),
      error: err => {
        this.error.set(err.error?.message ?? 'Failed to remove. Please try again.');
        this.removing.set(false);
      }
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as Element).classList.contains('overlay')) {
      this.close.emit();
    }
  }
}

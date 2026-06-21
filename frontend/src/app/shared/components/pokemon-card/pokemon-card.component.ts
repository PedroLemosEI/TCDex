import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { PokemonListItem } from '../../../models/pokemon.model';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokemonCardComponent {
  @Input({ required: true }) pokemon!: PokemonListItem;
  @Input({ required: true }) isCaught!: boolean;
  @Output() clicked = new EventEmitter<PokemonListItem>();

  get paddedId(): string {
    return '#' + String(this.pokemon.id).padStart(4, '0');
  }
}

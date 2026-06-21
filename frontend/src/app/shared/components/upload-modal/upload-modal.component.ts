import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { PokedexService } from '../../../core/services/pokedex.service';
import { PokemonListItem } from '../../../models/pokemon.model';

@Component({
  selector: 'app-upload-modal',
  standalone: true,
  templateUrl: './upload-modal.component.html',
  styleUrl: './upload-modal.component.scss'
})
export class UploadModalComponent {
  @Input({ required: true }) pokemon!: PokemonListItem;
  @Output() uploadSuccess = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>();

  private pokedex = inject(PokedexService);

  preview = signal<string | null>(null);
  loading = signal(false);
  error   = signal('');

  get paddedId(): string {
    return '#' + String(this.pokemon.id).padStart(4, '0');
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error.set('Please select a valid image file (JPG, PNG, WEBP…)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('Image must be under 5 MB');
      return;
    }

    this.error.set('');
    const reader = new FileReader();
    reader.onload = e => this.preview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (!this.preview() || this.loading()) return;
    this.loading.set(true);
    this.error.set('');

    this.pokedex.registerPokemon(this.pokemon.id, this.preview()!).subscribe({
      next: () => this.uploadSuccess.emit(this.pokemon.id),
      error: err => {
        this.error.set(err.error?.message ?? 'Upload failed. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as Element).classList.contains('overlay')) {
      this.close.emit();
    }
  }
}

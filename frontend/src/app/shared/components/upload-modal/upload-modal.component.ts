import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { PokedexService } from '../../../core/services/pokedex.service';
import { PokemonListItem } from '../../../models/pokemon.model';

const MAX_DIMENSION = 900;   // px — longest side after resize
const JPEG_QUALITY  = 0.78;  // 0–1
const MAX_RAW_MB    = 20;    // reject files larger than this before compression

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

  preview     = signal<string | null>(null);
  compressing = signal(false);
  loading     = signal(false);
  error       = signal('');

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
    if (file.size > MAX_RAW_MB * 1024 * 1024) {
      this.error.set(`Image must be under ${MAX_RAW_MB} MB`);
      return;
    }

    this.error.set('');
    this.compressing.set(true);

    this.compress(file)
      .then(dataUrl => {
        this.preview.set(dataUrl);
        this.compressing.set(false);
      })
      .catch(() => {
        this.error.set('Failed to process image. Please try another file.');
        this.compressing.set(false);
      });
  }

  private compress(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        let { width, height } = img;
        if (width > height) {
          if (width > MAX_DIMENSION) { height = Math.round(height * MAX_DIMENSION / width); width = MAX_DIMENSION; }
        } else {
          if (height > MAX_DIMENSION) { width = Math.round(width * MAX_DIMENSION / height); height = MAX_DIMENSION; }
        }

        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not available')); return; }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };

      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
      img.src = objectUrl;
    });
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

import { Component, inject, output } from '@angular/core';
import { CaffeService } from '../../services/caffe';

@Component({
  selector: 'app-sorteggio',
  imports: [],
  templateUrl: './sorteggio.html',
  styleUrl: './sorteggio.scss',
})
export class Sorteggio {
  private readonly caffe = inject(CaffeService);
  readonly sorteggioRichiesto = output<void>();

  onSorteggia(): void {
    this.sorteggioRichiesto.emit();
  }
}

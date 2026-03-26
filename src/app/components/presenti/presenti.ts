import { Component, inject } from '@angular/core';
import { CaffeService, NOMI } from '../../services/caffe';

@Component({
  selector: 'app-presenti',
  imports: [],
  templateUrl: './presenti.html',
  styleUrl: './presenti.scss',
})
export class Presenti {
  readonly caffe = inject(CaffeService);
  readonly nomi = NOMI;

  toggle(nome: string): void {
    this.caffe.togglePresente(nome);
  }

  selezionaTutti(stato: boolean): void {
    this.caffe.selezionaTutti(stato);
  }
}

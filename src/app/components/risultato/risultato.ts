import { Component, input } from '@angular/core';

@Component({
  selector: 'app-risultato',
  imports: [],
  templateUrl: './risultato.html',
  styleUrl: './risultato.scss',
})
export class Risultato {
  readonly emoji = input('');
  readonly testo = input('Premi il pulsante per sorteggiare! 🎲');
  readonly sottotesto = input('');
  readonly classeExtra = input('');
  readonly confetti = input<string[]>([]);

  getConfettiLeft(i: number): number {
    return (i * 17 + 7) % 100;
  }

  getConfettiDelay(i: number): number {
    return (i * 0.13) % 0.6;
  }
}

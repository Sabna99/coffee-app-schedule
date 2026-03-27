import { Component, inject, signal } from '@angular/core';
import { Orologio } from './components/orologio/orologio';
import { Presenti } from './components/presenti/presenti';
import { Sorteggio } from './components/sorteggio/sorteggio';
import { Risultato } from './components/risultato/risultato';
import { CaffeService } from './services/caffe';

@Component({
  selector: 'app-root',
  imports: [Orologio, Presenti, Sorteggio, Risultato],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly caffe = inject(CaffeService);

  // Stato risultato
  readonly emoji = signal('');
  readonly testo = signal('Premi il pulsante per sorteggiare! 🎲');
  readonly sottotesto = signal('');
  readonly classeExtra = signal('');
  readonly confetti = signal<string[]>([]);
  readonly ultimoBar = signal('');
  readonly classifica = this.caffe.classifica;
  private animazioneAttiva = false;

  constructor() {
    this.aggiornaUltimoBar();
  }

  onSorteggia(): void {
    if (this.animazioneAttiva) return;

    const presenti = this.caffe.nomiPresenti();

    if (presenti.length === 0) {
      this.emoji.set('😱');
      this.testo.set('⚠️ Seleziona almeno una persona!');
      this.sottotesto.set('Non c\'è nessuno? Chi fa il caffè allora?!');
      this.classeExtra.set('errore');
      this.confetti.set([]);
      return;
    }

    const vincitore = this.caffe.sorteggia()!;
    this.animazioneAttiva = true;
    this.confetti.set([]);
    this.classeExtra.set('');
    this.sottotesto.set('');
    this.animaRoulette(presenti, vincitore, presenti.length, 0);
  }

  private animaRoulette(presenti: string[], vincitore: string, presentiCount: number, step: number): void {
    const totale = 22 + Math.floor(Math.random() * 3);

    if (step < totale) {
      const random = this.caffe.getNomeCasuale(presenti);
      this.emoji.set('🎰');
      this.testo.set(`🎰 ${random} 🎰`);
      this.classeExtra.set('');

      const delay = 50 + Math.pow(step / totale, 2) * 350;
      setTimeout(() => this.animaRoulette(presenti, vincitore, presentiCount, step + 1), delay);
    } else {
      this.mostraVincitore(vincitore, presentiCount);
    }
  }

  private mostraVincitore(nome: string, presentiCount: number): void {
    const frase = this.caffe.getFraseCasuale(nome);
    const estrazione = this.caffe.registraSorteggio(nome, presentiCount);
    const totali = this.classifica().find((r) => r.nome === nome)?.caffeTotali ?? estrazione.caffeAssegnati;

    this.emoji.set('🏆☕🏆');
    this.testo.set(frase);
    this.sottotesto.set(this.getFraseAssegnazioneCaffe(nome, estrazione.caffeAssegnati, totali));
    this.classeExtra.set('vittoria');

    // Confetti
    const particelle = ['☕', '🔥', '⭐', '🎉', '✨', '🏆', '💛', '🎊'];
    const confettiArr: string[] = [];
    for (let i = 0; i < 14; i++) {
      confettiArr.push(particelle[Math.floor(Math.random() * particelle.length)]);
    }
    this.confetti.set(confettiArr);
    setTimeout(() => this.confetti.set([]), 3000);

    // Suono & salvataggio
    this.caffe.suona();
    this.caffe.salvaDati(nome);
    this.aggiornaUltimoBar();

    this.animazioneAttiva = false;
  }

  private getFraseAssegnazioneCaffe(_nome: string, caffeAssegnati: number, _caffeTotali: number): string {
    if (caffeAssegnati <= 2) {
      return `Devi fare ${caffeAssegnati} caffè. Vai tranquillo, campione 😎☕`;
    }
    if (caffeAssegnati <= 5) {
      return `Devi fare ${caffeAssegnati} caffè. Carica la moka, si parte! 🚀☕`;
    }
    if (caffeAssegnati <= 8) {
      return `Devi fare ${caffeAssegnati} caffè. Oggi sei il barista ufficiale 💪☕`;
    }
    return `Devi fare ${caffeAssegnati} caffè. Modalità leggenda attivata 👑☕`;
  }

  onReset(): void {
    this.caffe.selezionaTutti(true);
    this.emoji.set('');
    this.testo.set('Premi il pulsante per sorteggiare! 🎲');
    this.sottotesto.set('');
    this.classeExtra.set('');
    this.confetti.set([]);
  }

  private aggiornaUltimoBar(): void {
    const dati = this.caffe.caricaDati();
    if (dati?.ultimo_vincitore) {
      this.ultimoBar.set(`📋 Ultimo barista: ${dati.ultimo_vincitore} (${dati.data})`);
    } else {
      this.ultimoBar.set('📋 Nessun sorteggio precedente');
    }
  }
}

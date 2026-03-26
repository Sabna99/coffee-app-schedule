import { Injectable, signal, computed } from '@angular/core';

// ─── CONFIGURAZIONE (facile da modificare!) ──────────────────────

export const NOMI: string[] = [
  'Sabrina', 'Marco', 'Antonio', 'Pasquale',
  'Francesco', 'Eugenio', 'Serena', 'Gabriele',
  'Carlo', 'Vincenzino', 'Mimmo',
];

export const FRASI_DIVERTENTI: string[] = [
  'Oggi il barista è: {nome} ☕🔥',
  '🎉 {nome}, tocca a te! Fai un caffè da urlo! ☕',
  '☕ {nome} è stato scelto dal destino del caffè!',
  '🏆 Il campione del caffè di oggi è: {nome}!',
  '⚡ {nome}, il popolo ha bisogno del tuo caffè!',
  '🎯 {nome}, la macchina del caffè ti aspetta!',
  '☕ {nome}! Niente scuse, è il tuo turno!',
  '🔥 {nome}, facci sognare con un caffè perfetto!',
  '🌟 Rullo di tamburi... {nome} al caffè!',
  '☕ {nome}, oggi sei la nostra salvezza caffeinata!',
];

export interface DatiSalvati {
  ultimo_vincitore: string;
  data: string;
}

const CHIAVE_STORAGE = 'caffeTurnoDati';

@Injectable({
  providedIn: 'root',
})
export class CaffeService {

  // Stato presenti: mappa nome → selezionato
  readonly presenti = signal<Record<string, boolean>>(
    NOMI.reduce((acc, n) => ({ ...acc, [n]: true }), {} as Record<string, boolean>)
  );

  // Lista nomi selezionati
  readonly nomiPresenti = computed(() => {
    const p = this.presenti();
    return NOMI.filter((n) => p[n]);
  });

  // ─── CHECKBOX ────────────────────────────────────────

  togglePresente(nome: string): void {
    this.presenti.update((p) => ({ ...p, [nome]: !p[nome] }));
  }

  selezionaTutti(stato: boolean): void {
    this.presenti.update((p) => {
      const nuovo: Record<string, boolean> = {};
      for (const n of NOMI) nuovo[n] = stato;
      return nuovo;
    });
  }

  // ─── SORTEGGIO ──────────────────────────────────────

  sorteggia(): string | null {
    const presenti = this.nomiPresenti();
    if (presenti.length === 0) return null;

    const ultimo = this.getUltimoVincitore();
    const candidati = presenti.length > 1
      ? presenti.filter((n) => n !== ultimo)
      : presenti;

    return candidati[Math.floor(Math.random() * candidati.length)];
  }

  getNomeCasuale(nomi: string[]): string {
    return nomi[Math.floor(Math.random() * nomi.length)];
  }

  getFraseCasuale(nome: string): string {
    const frase = FRASI_DIVERTENTI[Math.floor(Math.random() * FRASI_DIVERTENTI.length)];
    return frase.replace('{nome}', nome);
  }

  // ─── PERSISTENZA ────────────────────────────────────

  salvaDati(nome: string): void {
    const dati: DatiSalvati = {
      ultimo_vincitore: nome,
      data: new Date().toISOString().split('T')[0],
    };
    localStorage.setItem(CHIAVE_STORAGE, JSON.stringify(dati));
  }

  caricaDati(): DatiSalvati | null {
    try {
      const raw = localStorage.getItem(CHIAVE_STORAGE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  getUltimoVincitore(): string | null {
    const dati = this.caricaDati();
    if (!dati) return null;
    try {
      const dataSalvata = new Date(dati.data);
      const ieri = new Date();
      ieri.setDate(ieri.getDate() - 1);
      ieri.setHours(0, 0, 0, 0);
      if (dataSalvata >= ieri) return dati.ultimo_vincitore;
    } catch {
      /* ignora */
    }
    return null;
  }

  // ─── SUONO ──────────────────────────────────────────

  suona(): void {
    try {
      const ctx = new AudioContext();
      [600, 800, 1000].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.value = 0.15;
        const start = ctx.currentTime + i * 0.15;
        osc.start(start);
        osc.stop(start + (i === 2 ? 0.2 : 0.1));
      });
    } catch {
      /* browser non supporta AudioContext */
    }
  }
}

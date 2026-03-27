import { Injectable, signal, computed } from '@angular/core';

// ─── CONFIGURAZIONE (facile da modificare!) ──────────────────────

export const NOMI: string[] = [
  'Sabrina', 'Marco', 'Antonio', 'Pasquale',
  'Francesco', 'Eugenio', 'Serena', 'Gabriele',
  'Carlo', 'Vincenzino', 'Mimmo', 'Palma', 'Danilo', 'Miriam',
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
const CHIAVE_STATS = 'caffeStatistiche_v2';
const CHIAVE_ESTRAZIONI = 'caffeCronologiaEstrazioni_v2';

interface StatPersona {
  sorteggi: number;
  caffeTotali: number;
}

export interface RigaClassifica {
  nome: string;
  sorteggi: number;
  caffeTotali: number;
}

export interface Estrazione {
  nome: string;
  data: string;
  presenti: number;
  caffeAssegnati: number;
}

@Injectable({
  providedIn: 'root',
})
export class CaffeService {

  // Stato presenti: mappa nome → selezionato
  readonly presenti = signal<Record<string, boolean>>(
    NOMI.reduce((acc, n) => ({ ...acc, [n]: true }), {} as Record<string, boolean>)
  );
  private readonly statistiche = signal<Record<string, StatPersona>>(this.inizializzaStatistiche());
  private readonly estrazioni = signal<Estrazione[]>(this.caricaEstrazioni());

  // Lista nomi selezionati
  readonly nomiPresenti = computed(() => {
    const p = this.presenti();
    return NOMI.filter((n) => p[n]);
  });
  readonly classifica = computed<RigaClassifica[]>(() => {
    const stats = this.statistiche();
    return NOMI
      .map((nome) => ({
        nome,
        sorteggi: stats[nome]?.sorteggi ?? 0,
        caffeTotali: stats[nome]?.caffeTotali ?? 0,
      }))
      .sort((a, b) => {
        if (b.caffeTotali !== a.caffeTotali) return b.caffeTotali - a.caffeTotali;
        if (b.sorteggi !== a.sorteggi) return b.sorteggi - a.sorteggi;
        return a.nome.localeCompare(b.nome);
      });
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

  registraSorteggio(nome: string, presenti: number): Estrazione {
    const caffeAssegnati = Math.max(1, presenti);
    const nuovaEstrazione: Estrazione = {
      nome,
      data: new Date().toISOString(),
      presenti: caffeAssegnati,
      caffeAssegnati,
    };

    this.statistiche.update((stats) => {
      const corrente = stats[nome] ?? { sorteggi: 0, caffeTotali: 0 };
      const aggiornate = {
        ...stats,
        [nome]: {
          sorteggi: corrente.sorteggi + 1,
          caffeTotali: corrente.caffeTotali + caffeAssegnati,
        },
      };
      localStorage.setItem(CHIAVE_STATS, JSON.stringify(aggiornate));
      return aggiornate;
    });

    this.estrazioni.update((lista) => {
      const aggiornata = [nuovaEstrazione, ...lista].slice(0, 200);
      localStorage.setItem(CHIAVE_ESTRAZIONI, JSON.stringify(aggiornata));
      return aggiornata;
    });

    return nuovaEstrazione;
  }

  caricaDati(): DatiSalvati | null {
    try {
      const raw = localStorage.getItem(CHIAVE_STORAGE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  getUltimaEstrazione(): Estrazione | null {
    return this.estrazioni()[0] ?? null;
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

  private inizializzaStatistiche(): Record<string, StatPersona> {
    const daStorage = this.caricaStatistiche();
    const complete: Record<string, StatPersona> = {};
    for (const nome of NOMI) {
      complete[nome] = daStorage[nome] ?? { sorteggi: 0, caffeTotali: 0 };
    }
    return complete;
  }

  private caricaStatistiche(): Record<string, StatPersona> {
    try {
      const raw = localStorage.getItem(CHIAVE_STATS);
      if (!raw) return {};
      return JSON.parse(raw) as Record<string, StatPersona>;
    } catch {
      return {};
    }
  }

  private caricaEstrazioni(): Estrazione[] {
    try {
      const raw = localStorage.getItem(CHIAVE_ESTRAZIONI);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Estrazione[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

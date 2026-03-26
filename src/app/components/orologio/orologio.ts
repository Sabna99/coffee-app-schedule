import { Component, signal, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-orologio',
  imports: [],
  templateUrl: './orologio.html',
  styleUrl: './orologio.scss',
})
export class Orologio implements OnInit, OnDestroy {
  readonly ora = signal('00:00:00');
  readonly data = signal('');
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.aggiorna();
    this.timer = setInterval(() => this.aggiorna(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private aggiorna(): void {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    this.ora.set(`${h}:${m}:${s}`);

    const opzioni: Intl.DateTimeFormatOptions = {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    };
    const dataStr = now.toLocaleDateString('it-IT', opzioni);
    this.data.set(dataStr.charAt(0).toUpperCase() + dataStr.slice(1));
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  apiUrl = environment.apiUrl;
  periodos: any[] = [];
  selectedPeriodo = '';
  kpis: any = {
    total_menus: 0,
    total_restricciones: 0,
    promedio_calorico: 0,
    total_becarios: 0,
    responsable_nombre: '',
    responsable_cargo: ''
  };

  chartCalorias: any[] = [];
  chartRestricciones: any[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPeriodos();
  }

  cargarPeriodos(): void {
    this.http.get<any[]>(`${this.apiUrl}/reportes/periodos`).subscribe({
      next: (data) => {
        this.periodos = data;
        if (data.length > 0) {
          this.selectedPeriodo = data[0].value;
          this.cargarDashboard();
        } else {
          // Fallback if no menus are registered yet
          const now = new Date();
          this.selectedPeriodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          this.cargarDashboard();
        }
      },
      error: (err) => {
        console.error('Error cargando periodos:', err);
        const now = new Date();
        this.selectedPeriodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        this.cargarDashboard();
      }
    });
  }

  cargarDashboard(): void {
    if (!this.selectedPeriodo) return;
    this.loading = true;

    // Load KPIs
    this.http.get<any>(`${this.apiUrl}/reportes/kpis?periodo=${this.selectedPeriodo}`).subscribe({
      next: (data) => {
        this.kpis = data;
      },
      error: (err) => console.error('Error KPIs:', err)
    });

    // Load Calorie Chart
    this.http.get<any[]>(`${this.apiUrl}/reportes/chart-calorias?periodo=${this.selectedPeriodo}`).subscribe({
      next: (data) => {
        this.chartCalorias = data;
      },
      error: (err) => console.error('Error calorias chart:', err)
    });

    // Load Restrictions Chart
    this.http.get<any[]>(`${this.apiUrl}/reportes/chart-restricciones`).subscribe({
      next: (data) => {
        this.chartRestricciones = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error restricciones chart:', err);
        this.loading = false;
      }
    });
  }

  onPeriodoChange(): void {
    this.cargarDashboard();
  }

  getMaxCalorias(): number {
    if (this.chartCalorias.length === 0) return 1000;
    const maxVal = Math.max(...this.chartCalorias.map(c => c.value));
    return maxVal > 0 ? maxVal + 200 : 1000;
  }

  getBarHeight(value: number): string {
    const max = this.getMaxCalorias();
    const pct = (value / max) * 100;
    return `${pct}%`;
  }

  getTotalRestriccionesCount(): number {
    return this.chartRestricciones.reduce((acc, curr) => acc + (curr.count || 0), 0);
  }

  getPiePath(index: number): string {
    const total = this.getTotalRestriccionesCount();
    if (total === 0) return '';

    let cumulativePercent = 0;
    for (let i = 0; i < index; i++) {
      cumulativePercent += (this.chartRestricciones[i].count || 0) / total;
    }

    const startPercent = cumulativePercent;
    const slicePercent = (this.chartRestricciones[index].count || 0) / total;
    const endPercent = startPercent + slicePercent;

    const startX = Math.cos(2 * Math.PI * startPercent);
    const startY = Math.sin(2 * Math.PI * startPercent);
    const endX = Math.cos(2 * Math.PI * endPercent);
    const endY = Math.sin(2 * Math.PI * endPercent);

    const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

    return `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  }
}

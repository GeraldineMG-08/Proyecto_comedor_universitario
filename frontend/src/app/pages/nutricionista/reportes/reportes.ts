import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes implements OnInit {
  apiUrl = environment.apiUrl;

  periodos: any[] = [];
  selectedMonth = '';
  selectedType = 'menus_completos';

  kpiData: any = {
    total_menus: 0,
    total_restricciones: 0,
    promedio_calorico: 0,
    total_becarios: 0,
    responsable_nombre: 'Carlos Alberto Quispe Mamani',
    responsable_cargo: 'Licenciado en Nutrición'
  };

  chartData: any[] = [];
  pieData: any[] = [];
  tableData: any[] = [];

  // Preview simulations
  showSimulatedPreview = false;
  totalPages = 3;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPeriodos();
  }

  loadPeriodos(): void {
    this.http.get<any[]>(`${this.apiUrl}/reportes/periodos`).subscribe({
      next: (data) => {
        this.periodos = data;
        if (data.length > 0) {
          this.selectedMonth = data[0].value;
          this.fetchDashboardData();
        }
      },
      error: (err) => console.error('Error report periodos:', err)
    });
  }

  onMonthChange(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    if (!this.selectedMonth) return;

    // Load KPIs
    this.http.get<any>(`${this.apiUrl}/reportes/kpis?periodo=${this.selectedMonth}`).subscribe({
      next: (data) => {
        this.kpiData = data;
      },
      error: (err) => console.error('Error KPIs:', err)
    });

    // Load Calories Chart
    this.http.get<any[]>(`${this.apiUrl}/reportes/chart-calorias?periodo=${this.selectedMonth}`).subscribe({
      next: (data) => {
        this.chartData = data;
      },
      error: (err) => console.error('Error chart calorias:', err)
    });

    // Load Restrictions Chart
    this.http.get<any[]>(`${this.apiUrl}/reportes/chart-restricciones`).subscribe({
      next: (data) => {
        this.pieData = data;
      },
      error: (err) => console.error('Error chart restricciones:', err)
    });
  }

  generarReporte(): void {
    if (!this.selectedMonth) return;

    const endpoint = this.selectedType === 'menus_completos'
      ? `${this.apiUrl}/reportes/tabla-menus?periodo=${this.selectedMonth}`
      : `${this.apiUrl}/reportes/tabla-restricciones`;

    this.http.get<any[]>(endpoint).subscribe({
      next: (data) => {
        this.tableData = data;
        this.showSimulatedPreview = false; // Hide preview sheet, just show on-screen table preview
        Swal.fire({
          icon: 'success',
          title: 'Datos Cargados',
          text: `Se encontraron ${data.length} registros para visualizar.`,
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar los datos de reporte.', 'error');
      }
    });
  }

  vistaPreviaPDF(): void {
    if (this.tableData.length === 0) {
      Swal.fire('Atención', 'Primero presione "Generar" para cargar los registros y luego ver la vista previa.', 'warning');
      return;
    }

    const ITEMS_PER_PAGE = 8;
    const totalDetailPages = Math.ceil(this.tableData.length / ITEMS_PER_PAGE);
    this.totalPages = 2 + totalDetailPages;

    this.showSimulatedPreview = true;
  }

  // --- SVG Chart Helpers ---
  getMaxCalorias(): number {
    if (this.chartData.length === 0) return 1000;
    const maxVal = Math.max(...this.chartData.map(c => c.value));
    return maxVal > 0 ? maxVal + 200 : 1000;
  }

  getBarHeight(value: number): string {
    const max = this.getMaxCalorias();
    const pct = (value / max) * 100;
    return `${pct}%`;
  }

  getTotalRestriccionesCount(): number {
    return this.pieData.reduce((acc, curr) => acc + (curr.count || 0), 0);
  }

  getPiePath(index: number): string {
    const total = this.getTotalRestriccionesCount();
    if (total === 0) return '';

    let cumulativePercent = 0;
    for (let i = 0; i < index; i++) {
      cumulativePercent += (this.pieData[i].count || 0) / total;
    }

    const startPercent = cumulativePercent;
    const slicePercent = (this.pieData[index].count || 0) / total;
    const endPercent = startPercent + slicePercent;

    const startX = Math.cos(2 * Math.PI * startPercent);
    const startY = Math.sin(2 * Math.PI * startPercent);
    const endX = Math.cos(2 * Math.PI * endPercent);
    const endY = Math.sin(2 * Math.PI * endPercent);

    const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

    return `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  }

  // --- Simulated Preview Helpers ---
  getFormattedPeriodoHeader(): string {
    if (!this.selectedMonth) return '';
    const [y, m] = this.selectedMonth.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, 1);
    const monthName = dateObj.toLocaleString('es-PE', { month: 'long' });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${y}`;
  }

  getPeriodoTexto(): string {
    if (!this.selectedMonth) return '';
    const [y, m] = this.selectedMonth.split('-');
    const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate();
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, 1);
    const monthName = dateObj.toLocaleString('es-PE', { month: 'long' });
    const monthNameCap = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    return `Del 01 al ${lastDay} de ${monthNameCap} de ${y}`;
  }

  getCurrentYear(): string {
    if (this.selectedMonth) {
      return this.selectedMonth.split('-')[0];
    }
    return String(new Date().getFullYear());
  }

  getDetailChunks(): any[][] {
    const chunked: any[][] = [];
    const ITEMS_PER_PAGE = 8;
    for (let i = 0; i < this.tableData.length; i += ITEMS_PER_PAGE) {
      chunked.push(this.tableData.slice(i, i + ITEMS_PER_PAGE));
    }
    return chunked;
  }

  // --- formal PDF Download using jsPDF ---
  async generatePDFReport(): Promise<void> {
    if (this.tableData.length === 0) {
      Swal.fire('Atención', 'Primero debes generar y cargar los datos de reporte.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Generando Reporte PDF',
      html: 'Procesando datos y formateando documento...<br><b>Por favor espere.</b>',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const year = this.getCurrentYear();
      const formattedMonth = this.getFormattedPeriodoHeader();

      // --- PAGE 1: COVER ---
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('UNIVERSIDAD NACIONAL DE MOQUEGUA', doc.internal.pageSize.getWidth() / 2, 120, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Dirección de Bienestar Universitario', doc.internal.pageSize.getWidth() / 2, 140, { align: 'center' });
      doc.text('Servicio de Comedor', doc.internal.pageSize.getWidth() / 2, 155, { align: 'center' });

      doc.setLineWidth(1.5);
      doc.line(100, 300, doc.internal.pageSize.getWidth() - 100, 300);

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const title = this.selectedType === 'menus_completos' ? 'PROGRAMACIÓN DE MENÚ MENSUAL' : 'REPORTE DE RESTRICCIONES';
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 325, { align: 'center' });

      const subTitle = this.selectedType === 'menus_completos' ? formattedMonth.toUpperCase() : `VIGENTES ${year}`;
      doc.text(subTitle, doc.internal.pageSize.getWidth() / 2, 350, { align: 'center' });
      doc.line(100, 365, doc.internal.pageSize.getWidth() - 100, 365);

      const respNombre = this.kpiData.responsable_nombre || 'Carlos Alberto Quispe Mamani';
      const respCargo = this.kpiData.responsable_cargo || 'Licenciado en Nutrición';

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('EVALUADO Y APROBADO POR:', doc.internal.pageSize.getWidth() / 2, 450, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.text(respNombre, doc.internal.pageSize.getWidth() / 2, 480, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(respCargo, doc.internal.pageSize.getWidth() / 2, 495, { align: 'center' });

      doc.setFontSize(11);
      doc.text(`Ilo, Moquegua - Perú`, doc.internal.pageSize.getWidth() / 2, 700, { align: 'center' });
      doc.text(year, doc.internal.pageSize.getWidth() / 2, 715, { align: 'center' });

      // --- PAGE 2: GENERAL STATS ---
      doc.addPage();
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN GENERAL', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
      doc.setLineWidth(1);
      doc.line(40, 50, doc.internal.pageSize.getWidth() - 40, 50);

      if (this.selectedType === 'menus_completos') {
        const diasOperativos = this.tableData.length;
        const totalBecarios = this.kpiData.total_becarios || 0;
        const avgKcal = this.kpiData.promedio_calorico || 0;

        autoTable(doc, {
          startY: 100,
          theme: 'plain',
          styles: { fontSize: 11 },
          columnStyles: { 0: { fontStyle: 'bold', cellWidth: 150 } },
          body: [
            ['Período:', this.getPeriodoTexto()],
            ['Semestre Académico:', `${year}-II`],
            ['Días operativos:', `${diasOperativos} días (Lunes a Viernes)`],
            ['Población beneficiaria:', `${totalBecarios} becarios activos`],
            ['Responsable:', respNombre],
            ['Fecha de emisión:', new Date().toLocaleDateString('es-ES')],
          ]
        });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('II. RESUMEN NUTRICIONAL', 40, (doc as any).lastAutoTable.finalY + 30);

        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 45,
          theme: 'grid',
          headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
          head: [['Concepto', 'Valor']],
          body: [
            ['Valor Calórico Total (VCT) promedio', `${avgKcal} kcal/día`],
            ['VCT mínimo requerido', `2700 kcal/día`],
            ['Estado', avgKcal >= 2700 ? 'CUMPLE' : 'OBSERVADO'],
          ]
        });
      } else {
        const statsBody = this.pieData.map(item => [item.label, item.count]);
        const totalStats = this.pieData.reduce((acc, curr) => acc + curr.count, 0);
        statsBody.push(['TOTAL', totalStats]);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('I. RESUMEN ESTADÍSTICO', 40, 100);

        autoTable(doc, {
          startY: 115,
          theme: 'grid',
          headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
          head: [['Tipo de Restricción', 'Cantidad de Estudiantes']],
          body: statsBody,
          columnStyles: {
            0: { cellWidth: 250, fontStyle: 'bold' },
            1: { halign: 'center' }
          },
          didParseCell: (data) => {
            if (data.section === 'body' && (data.row.raw as any)[0] === 'TOTAL') {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [240, 240, 240];
            }
          }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 60;
        doc.setLineWidth(0.5);
        doc.line(doc.internal.pageSize.getWidth() / 2 - 80, finalY, doc.internal.pageSize.getWidth() / 2 + 80, finalY);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(respNombre, doc.internal.pageSize.getWidth() / 2, finalY + 15, { align: 'center' });

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(respCargo, doc.internal.pageSize.getWidth() / 2, finalY + 28, { align: 'center' });
      }

      // Add page footers
      this.addPdfFooter(doc, 2);

      // --- PAGE 3+: DETAIL TABLES ---
      doc.addPage();
      const tableMargin = { top: 80, bottom: 40 };

      if (this.selectedType === 'menus_completos') {
        const tableBody = this.tableData.map(dia => [
          `${dia.dia}\n${dia.fecha}`,
          dia.desayuno.items.join('\n- '),
          dia.desayuno.kcal,
          dia.almuerzo.items.join('\n- '),
          dia.almuerzo.kcal,
          dia.cena.items.join('\n- '),
          dia.cena.kcal,
          dia.total
        ]);

        autoTable(doc, {
          startY: 80,
          margin: tableMargin,
          head: [['Fecha', 'Desayuno', 'Kcal', 'Almuerzo', 'Kcal', 'Cena', 'Kcal', 'Total']],
          body: tableBody,
          theme: 'grid',
          styles: { fontSize: 8, valign: 'middle', cellPadding: 4, overflow: 'linebreak' },
          headStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255], halign: 'center' },
          columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            2: { cellWidth: 30, halign: 'center' },
            4: { cellWidth: 30, halign: 'center' },
            6: { cellWidth: 30, halign: 'center' },
            7: { cellWidth: 35, halign: 'center', fontStyle: 'bold' }
          },
          didDrawPage: (data) => {
            this.addPdfHeader(doc, 'DETALLE DE MENÚS');
            this.addPdfFooter(doc, data.pageNumber + 2);
          }
        });
      } else {
        const tableBody = this.tableData.map((row, index) => [
          index + 1,
          row.codigo_universitario,
          row.nombre_completo,
          row.tipo_restriccion,
          row.alimentos_restringidos || '-',
          row.fecha_inicio
        ]);

        autoTable(doc, {
          startY: 80,
          margin: tableMargin,
          head: [['N°', 'Código', 'Estudiante', 'Tipo', 'Detalle', 'Inicio']],
          body: tableBody,
          theme: 'grid',
          styles: { fontSize: 9, valign: 'middle' },
          headStyles: { fillColor: [52, 73, 94] },
          didDrawPage: (data) => {
            this.addPdfHeader(doc, 'PADRÓN DETALLADO');
            this.addPdfFooter(doc, data.pageNumber + 2);
          }
        });
      }

      doc.save(`Reporte_${this.selectedType}_${this.selectedMonth}.pdf`);

      Swal.fire({
        icon: 'success',
        title: 'Descarga Completada',
        text: 'El reporte formal ha sido generado y descargado correctamente.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Hubo un error al compilar el PDF de reporte.', 'error');
    }
  }

  addPdfHeader(doc: jsPDF, title: string): void {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
    doc.setLineWidth(1);
    doc.line(40, 50, doc.internal.pageSize.getWidth() - 40, 50);
  }

  addPdfFooter(doc: jsPDF, pageNum: number): void {
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Universidad Nacional de Moquegua', 40, footerY);
    doc.text(`Página ${pageNum}`, doc.internal.pageSize.getWidth() - 40, footerY, { align: 'right' });
  }
}

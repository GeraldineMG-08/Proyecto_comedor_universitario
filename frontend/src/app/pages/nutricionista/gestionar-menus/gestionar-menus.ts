import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

interface MenuItemDetail {
  plato: string;
  kcal: string | number;
}

interface ServiceDetail {
  [componentId: number]: MenuItemDetail;
}

interface MenuDetail {
  id?: number;
  fecha: string;
  estado: 'pendiente' | 'publicado' | 'sin_registrar';
  total_kcal: number;
  desayuno: ServiceDetail;
  almuerzo: ServiceDetail;
  cena: ServiceDetail;
}

@Component({
  selector: 'app-gestionar-menus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-menus.html',
  styleUrl: './gestionar-menus.scss',
})
export class GestionarMenus implements OnInit {
  apiUrl = environment.apiUrl;
  currentDate = new Date();
  selectedDate = new Date();
  menuData: { [date: string]: 'pendiente' | 'publicado' | 'sin_registrar' } = {};
  currentMenuDetail: MenuDetail | null = null;

  isEditing = false;
  editFormData: MenuDetail | null = null;
  loadingDetails = false;

  // Calendar structures
  daysInMonth: number[] = [];
  firstDayIndex = 0;
  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Structure definitions (Mapeos)
  MENU_STRUCTURE = {
    desayuno: [
      { id: 1, nombre: 'Jugo de Frutas / Fruta' },
      { id: 2, nombre: 'Bebida Caliente' },
      { id: 3, nombre: 'Pan Proteico' },
      { id: 4, nombre: 'Pan Calórico' }
    ],
    almuerzo: [
      { id: 5, nombre: 'Entrada' },
      { id: 6, nombre: 'Plato de Fondo' },
      { id: 7, nombre: 'Postre / Fruta' },
      { id: 8, nombre: 'Refresco' }
    ],
    cena: [
      { id: 6, nombre: 'Plato de Fondo' },
      { id: 9, nombre: 'Infusión' }
    ]
  };

  // Accordion state
  accordionOpen = {
    desayuno: true,
    almuerzo: false,
    cena: false
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.generateCalendar();
    this.fetchCalendarStatus();
    this.fetchMenuDetail(this.formatDate(this.selectedDate));
  }

  // --- Date Helpers ---
  formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatHumanDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    return date.toLocaleDateString('es-PE', options);
  }

  getDayName(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    return date.toLocaleDateString('es-PE', options);
  }

  // --- Calendar Generator ---
  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

    this.firstDayIndex = firstDay;
    this.daysInMonth = Array.from({ length: days }, (_, i) => i + 1);
  }

  changeMonth(offset: number): void {
    if (this.isEditing) {
      Swal.fire({
        title: '¿Salir sin guardar?',
        text: 'Se perderán los cambios no guardados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, salir'
      }).then((result) => {
        if (result.isConfirmed) {
          this.isEditing = false;
          this.currentDate.setMonth(this.currentDate.getMonth() + offset);
          this.generateCalendar();
          this.fetchCalendarStatus();
        }
      });
    } else {
      this.currentDate.setMonth(this.currentDate.getMonth() + offset);
      this.generateCalendar();
      this.fetchCalendarStatus();
    }
  }

  getCurrentMonthDisplay(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  isSameDay(day: number, date2: Date): boolean {
    return (
      day === date2.getDate() &&
      this.currentDate.getMonth() === date2.getMonth() &&
      this.currentDate.getFullYear() === date2.getFullYear()
    );
  }

  isToday(day: number): boolean {
    return this.isSameDay(day, new Date());
  }

  isSelected(day: number): boolean {
    return this.isSameDay(day, this.selectedDate);
  }

  getDayStatus(day: number): 'pendiente' | 'publicado' | 'sin_registrar' {
    const dateStr = this.formatDate(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day));
    return this.menuData[dateStr] || 'sin_registrar';
  }

  selectDay(day: number): void {
    const targetDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
    const dateStr = this.formatDate(targetDate);

    if (this.isEditing) {
      Swal.fire({
        title: '¿Salir sin guardar?',
        text: 'Se perderán los cambios no guardados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, salir'
      }).then((result) => {
        if (result.isConfirmed) {
          this.isEditing = false;
          this.selectedDate = targetDate;
          this.fetchMenuDetail(dateStr);
        }
      });
    } else {
      this.selectedDate = targetDate;
      this.fetchMenuDetail(dateStr);
    }
  }

  // --- Backend Actions ---
  fetchCalendarStatus(): void {
    const year = this.currentDate.getFullYear();
    const month = String(this.currentDate.getMonth() + 1).padStart(2, '0');
    const monthStr = `${year}-${month}`;

    this.http.get<any>(`${this.apiUrl}/menu/calendar-status?month=${monthStr}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.menuData = res.data;
        }
      },
      error: (err) => console.error('Error calendar status:', err)
    });
  }

  fetchMenuDetail(dateStr: string): void {
    this.loadingDetails = true;
    this.http.get<any>(`${this.apiUrl}/menu/detail?date=${dateStr}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.currentMenuDetail = res.data;
        } else {
          this.currentMenuDetail = null;
        }
        this.loadingDetails = false;
      },
      error: (err) => {
        console.error('Error fetching menu details:', err);
        this.currentMenuDetail = null;
        this.loadingDetails = false;
      }
    });
  }

  startEdit(): void {
    if (this.currentMenuDetail) {
      this.editFormData = JSON.parse(JSON.stringify(this.currentMenuDetail));
    } else {
      this.editFormData = {
        fecha: this.formatDate(this.selectedDate),
        estado: 'pendiente',
        total_kcal: 0,
        desayuno: {},
        almuerzo: {},
        cena: {}
      };
    }
    this.isEditing = true;
    this.accordionOpen = { desayuno: true, almuerzo: false, cena: false };
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editFormData = null;
  }

  setEditStatus(status: 'pendiente' | 'publicado'): void {
    if (this.editFormData) {
      this.editFormData.estado = status;
    }
  }

  toggleAccordion(service: 'desayuno' | 'almuerzo' | 'cena'): void {
    this.accordionOpen[service] = !this.accordionOpen[service];
  }

  updateField(service: 'desayuno' | 'almuerzo' | 'cena', componentId: number, field: 'plato' | 'kcal', value: any): void {
    if (!this.editFormData) return;

    if (!this.editFormData[service]) {
      this.editFormData[service] = {};
    }
    if (!this.editFormData[service][componentId]) {
      this.editFormData[service][componentId] = { plato: '', kcal: '' };
    }

    if (field === 'kcal') {
      this.editFormData[service][componentId].kcal = value ? parseInt(value) : '';
    } else {
      this.editFormData[service][componentId].plato = value;
    }

    // Recalculate total calories
    this.editFormData.total_kcal = this.calculateTotalKcal();
  }

  calculateTotalKcal(): number {
    if (!this.editFormData) return 0;
    let total = 0;
    const services: ('desayuno' | 'almuerzo' | 'cena')[] = ['desayuno', 'almuerzo', 'cena'];

    services.forEach(service => {
      const items = this.editFormData?.[service];
      if (items) {
        Object.values(items).forEach((item: any) => {
          total += parseInt(item.kcal || 0);
        });
      }
    });
    return total;
  }

  saveMenu(): void {
    if (!this.editFormData) return;

    const payload = {
      fecha: this.editFormData.fecha,
      estado: this.editFormData.estado,
      total_kcal: this.editFormData.total_kcal,
      data: {
        desayuno: this.editFormData.desayuno,
        almuerzo: this.editFormData.almuerzo,
        cena: this.editFormData.cena
      }
    };

    this.http.post<any>(`${this.apiUrl}/menu/save`, payload).subscribe({
      next: (res) => {
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Operación Exitosa!',
            text: 'El menú diario ha sido actualizado.',
            timer: 1500,
            showConfirmButton: false
          });
          this.isEditing = false;
          this.editFormData = null;
          this.fetchCalendarStatus();
          this.fetchMenuDetail(this.formatDate(this.selectedDate));
        }
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudieron guardar los cambios en el servidor.', 'error');
        console.error(err);
      }
    });
  }

  deleteMenu(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se eliminará de forma permanente toda la programación para este día.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = { fecha: this.formatDate(this.selectedDate) };
        this.http.post<any>(`${this.apiUrl}/menu/delete`, payload).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire('Eliminado', 'La programación ha sido borrada.', 'success');
              this.fetchCalendarStatus();
              this.fetchMenuDetail(this.formatDate(this.selectedDate));
            }
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo eliminar el menú diario.', 'error');
            console.error(err);
          }
        });
      }
    });
  }

  getEmptyArray(len: number): any[] {
    return Array.from({ length: len });
  }
}

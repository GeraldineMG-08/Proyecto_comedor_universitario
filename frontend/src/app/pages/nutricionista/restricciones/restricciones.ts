import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

interface Restriccion {
  id: number;
  id_becario: number;
  id_tipo_restriccion: number;
  alimentos_restringidos: string;
  fecha_inicio: string;
  fecha_termino: string;
  ruta_sustento: string | null;
  estado: 'activo' | 'inactivo';
  nombre_completo: string;
  codigo_universitario: string;
  nombre_escuela: string;
  nombre_tipo: string;
}

interface BecarioBusqueda {
  id_becario: number;
  codigo: string;
  nombre: string;
  dni: string;
  escuela: string;
}

interface TipoRestriccion {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-restricciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restricciones.html',
  styleUrl: './restricciones.scss',
})
export class Restricciones implements OnInit {
  apiUrl = environment.apiUrl;
  uploadBaseUrl = `${environment.apiUrl.replace('/api', '')}/uploads/restricciones/`;

  allRestrictions: Restriccion[] = [];
  filteredRestrictions: Restriccion[] = [];
  tipos: TipoRestriccion[] = [];

  // Search & Filters
  searchText = '';
  filterType = 'all';
  filterStatus = 'all';

  // Modals visibility
  mainModalOpen = false;
  searchModalOpen = false;

  // Modal mode: 'create' | 'edit' | 'view'
  modalMode: 'create' | 'edit' | 'view' = 'create';
  selectedFile: File | null = null;
  selectedFileUrl: string | null = null;
  selectedFileName = '';
  selectedFileType = '';

  // Form Fields
  formId: number | null = null;
  formIdBecario: number | null = null;
  formCodigo = '';
  formEscuela = '---';
  formNombre = 'Seleccione un estudiante mediante el buscador...';
  formTipo = 1;
  formAlimentos = '';
  formInicio = '';
  formTermino = '';

  // Student Search Modal
  studentSearchText = '';
  studentResults: BecarioBusqueda[] = [];
  loadingStudents = false;

  TYPE_STYLES: { [id: number]: { name: string; color: string; bg: string; border: string; icon: string } } = {
    1: { name: 'Alergia', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: 'bi-exclamation-circle-fill' },
    2: { name: 'Intolerancia', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', icon: 'bi-shield-fill-exclamation' },
    3: { name: 'Diabetes', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100', icon: 'bi-activity' },
    4: { name: 'Vegetariano', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'bi-flower1' },
    5: { name: 'Preferencia', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', icon: 'bi-info-circle-fill' }
  };

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadTypes();
    this.loadData();
  }

  loadTypes(): void {
    this.http.get<TipoRestriccion[]>(`${this.apiUrl}/restricciones/tipos`).subscribe({
      next: (types) => {
        this.tipos = types;
      },
      error: (err) => console.error('Error cargando tipos:', err)
    });
  }

  loadData(): void {
    this.http.get<Restriccion[]>(`${this.apiUrl}/restricciones/listar`).subscribe({
      next: (data) => {
        this.allRestrictions = Array.isArray(data) ? data : [];
        this.applyFilters();
      },
      error: (err) => console.error('Error cargando restricciones:', err)
    });
  }

  applyFilters(): void {
    const search = this.searchText.toLowerCase().trim();
    this.filteredRestrictions = this.allRestrictions.filter(item => {
      const matchText =
        item.nombre_completo.toLowerCase().includes(search) ||
        item.codigo_universitario.toLowerCase().includes(search);
      const matchType = this.filterType === 'all' || String(item.id_tipo_restriccion) === this.filterType;
      const matchStatus = this.filterStatus === 'all' || item.estado === this.filterStatus;

      return matchText && matchType && matchStatus;
    });
  }

  getStyle(typeId: number): any {
    return this.TYPE_STYLES[typeId] || this.TYPE_STYLES[5];
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  // --- Modal Open/Close ---
  openModal(mode: 'create' | 'edit' | 'view', item: Restriccion | null = null): void {
    this.modalMode = mode;
    this.clearFileState();

    // Reset Form
    this.formId = null;
    this.formIdBecario = null;
    this.formCodigo = '';
    this.formEscuela = '---';
    this.formNombre = 'Seleccione un estudiante mediante el buscador...';
    this.formTipo = this.tipos.length > 0 ? this.tipos[0].id : 1;
    this.formAlimentos = '';
    this.formInicio = this.formatDateForInput(new Date());
    this.formTermino = '';

    if (mode === 'create') {
      this.mainModalOpen = true;
    } else if (item) {
      this.formId = item.id;
      this.formIdBecario = item.id_becario;
      this.formCodigo = item.codigo_universitario;
      this.formEscuela = item.nombre_escuela;
      this.formNombre = item.nombre_completo;
      this.formTipo = item.id_tipo_restriccion;
      this.formAlimentos = item.alimentos_restringidos;
      this.formInicio = item.fecha_inicio;
      this.formTermino = item.fecha_termino;

      if (item.ruta_sustento) {
        const fullPath = this.uploadBaseUrl + item.ruta_sustento;
        const ext = item.ruta_sustento.split('.').pop()?.toLowerCase() || '';
        const type = (ext === 'pdf') ? 'application/pdf' : `image/${ext}`;
        this.selectedFileUrl = fullPath;
        this.selectedFileType = type;
        this.selectedFileName = item.ruta_sustento;
      }
      this.mainModalOpen = true;
    }
  }

  closeModal(): void {
    this.mainModalOpen = false;
    this.clearFileState();
  }

  formatDateForInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // --- Document File Selection & Visual Previews ---
  onFileSelected(e: any): void {
    const file = e.target.files[0];
    if (!file) return;

    if (this.selectedFileUrl && this.selectedFileUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.selectedFileUrl);
    }

    this.selectedFile = file;
    this.selectedFileUrl = URL.createObjectURL(file);
    this.selectedFileName = file.name;
    this.selectedFileType = file.type;
  }

  clearFileState(): void {
    if (this.selectedFileUrl && this.selectedFileUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.selectedFileUrl);
    }
    this.selectedFile = null;
    this.selectedFileUrl = null;
    this.selectedFileName = '';
    this.selectedFileType = '';
  }

  removeFile(): void {
    Swal.fire({
      title: '¿Quitar archivo?',
      text: 'El documento seleccionado será removido.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.clearFileState();
      }
    });
  }

  isPdf(): boolean {
    return !!this.selectedFileType && this.selectedFileType.includes('pdf');
  }

  isImage(): boolean {
    return !!this.selectedFileType && (this.selectedFileType.includes('image') || this.selectedFileType.includes('jpeg') || this.selectedFileType.includes('png') || this.selectedFileType.includes('jpg'));
  }

  getSafeUrl(url: string | null): SafeResourceUrl {
    if (!url) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // --- Student Search Modal ---
  openStudentSearch(): void {
    this.studentSearchText = '';
    this.studentResults = [];
    this.searchModalOpen = true;
    this.handleStudentSearch();
  }

  closeStudentSearch(): void {
    this.searchModalOpen = false;
  }

  handleStudentSearch(): void {
    this.loadingStudents = true;
    const query = this.studentSearchText.trim();
    this.http.get<any[]>(`${this.apiUrl}/restricciones/buscar-estudiante?q=${query}`).subscribe({
      next: (students) => {
        this.studentResults = students;
        this.loadingStudents = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingStudents = false;
      }
    });
  }

  selectStudent(s: BecarioBusqueda): void {
    this.formIdBecario = s.id_becario;
    this.formCodigo = s.codigo;
    this.formEscuela = s.escuela;
    this.formNombre = s.nombre;
    this.closeStudentSearch();
  }

  // --- Save / Delete logic ---
  saveData(): void {
    if (!this.formIdBecario) {
      Swal.fire('Atención', 'Debe seleccionar un estudiante becario activo.', 'warning');
      return;
    }
    if (!this.formAlimentos.trim() || !this.formInicio || !this.formTermino) {
      Swal.fire('Atención', 'Complete todos los campos obligatorios.', 'warning');
      return;
    }

    const formData = new FormData();
    if (this.formId) formData.append('id', String(this.formId));
    formData.append('id_becario', String(this.formIdBecario));
    formData.append('id_tipo_restriccion', String(this.formTipo));
    formData.append('alimentos_restringidos', this.formAlimentos);
    formData.append('fecha_inicio', this.formInicio);
    formData.append('fecha_termino', this.formTermino);

    if (this.selectedFile) {
      formData.append('archivo', this.selectedFile);
    }

    this.http.post<any>(`${this.apiUrl}/restricciones/guardar`, formData).subscribe({
      next: (res) => {
        if (res.success) {
          Swal.fire('Éxito', 'El expediente médico de restricción ha sido guardado correctamente.', 'success');
          this.closeModal();
          this.loadData();
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo guardar la restricción en el servidor.', 'error');
      }
    });
  }

  deleteItem(id: number): void {
    Swal.fire({
      title: '¿Está seguro de desactivar?',
      text: 'El estudiante dejará de figurar con condición alimentaria especial activa.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.post<any>(`${this.apiUrl}/restricciones/eliminar`, { id }).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire('Desactivado', 'El registro ha sido inhabilitado.', 'success');
              this.loadData();
            }
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo desactivar el registro.', 'error');
          }
        });
      }
    });
  }
}

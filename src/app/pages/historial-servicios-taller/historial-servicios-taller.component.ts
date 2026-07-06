import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AsignacionService } from '../../core/services/asignacion.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-historial-servicios-taller',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, NavbarComponent],
  templateUrl: './historial-servicios-taller.component.html',
  styleUrls: ['./historial-servicios-taller.component.scss']
})
export class HistorialServiciosTallerComponent implements OnInit {
  loading = true;
  error = '';

  historial: any = null;
  servicios: any[] = [];
  clientesAtendidos: any[] = [];
  servicioSeleccionado: any | null = null;

  codigoCliente = '';
  estadoAsignacion = '';
  limit = 20;
  offset = 0;

  readonly estados = [
    { id: '', nombre: 'Todos' },
    { id: '1', nombre: 'Pendiente' },
    { id: '2', nombre: 'Aceptada' },
    { id: '3', nombre: 'Rechazada' },
    { id: '4', nombre: 'En ruta' },
    { id: '5', nombre: 'En servicio' },
    { id: '6', nombre: 'Finalizada' }
  ];

  constructor(private asignacionService: AsignacionService) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.loading = true;
    this.error = '';

    this.asignacionService.obtenerHistorialServiciosTaller({
      codigo_cliente: this.codigoCliente.trim() || undefined,
      estado_asignacion: this.estadoAsignacion || undefined,
      limit: this.limit,
      offset: this.offset
    }).subscribe({
      next: data => {
        this.historial = data || {};
        this.servicios = data?.servicios || [];
        this.clientesAtendidos = data?.clientes_atendidos || [];
        this.loading = false;
      },
      error: err => {
        console.error('ERROR HISTORIAL SERVICIOS TALLER:', err);
        this.error = this.getMensajeError(err, 'No se pudo cargar el historial de servicios.');
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.offset = 0;
    this.cargarHistorial();
  }

  limpiarFiltros(): void {
    this.codigoCliente = '';
    this.estadoAsignacion = '';
    this.offset = 0;
    this.cargarHistorial();
  }

  paginaAnterior(): void {
    if (this.offset <= 0) return;
    this.offset = Math.max(this.offset - this.limit, 0);
    this.cargarHistorial();
  }

  paginaSiguiente(): void {
    if (!this.puedeAvanzar()) return;
    this.offset += this.limit;
    this.cargarHistorial();
  }

  cambiarLimit(): void {
    this.limit = Number(this.limit || 20);
    this.offset = 0;
    this.cargarHistorial();
  }

  puedeAvanzar(): boolean {
    return this.offset + this.limit < Number(this.historial?.total || 0);
  }

  abrirDetalle(servicio: any): void {
    this.servicioSeleccionado = servicio;
  }

  cerrarDetalle(): void {
    this.servicioSeleccionado = null;
  }

  estadoClase(servicio: any): string {
    const nombre = this.getEstadoNombre(servicio)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');

    return `estado-${nombre || 'default'}`;
  }

  getEstadoNombre(servicio: any): string {
    return servicio?.estado_asignacion?.nombre || 'Sin estado';
  }

  getNombrePersona(persona: any): string {
    const nombre = [persona?.nombre, persona?.apellido].filter(Boolean).join(' ').trim();
    return nombre || 'Sin nombre';
  }

  getPagoTexto(servicio: any): string {
    const pago = servicio?.pago;
    if (!pago) return 'Sin pago';
    const monto = pago.monto_total || pago.monto || pago.total;
    const estado = pago.estado?.nombre || pago.estado || 'registrado';
    return monto ? `Bs ${monto} - ${estado}` : estado;
  }

  getCotizacionTexto(servicio: any): string {
    const cotizacion = servicio?.cotizacion;
    if (!cotizacion) return 'Sin cotizacion';
    const monto = cotizacion.monto_estimado || cotizacion.monto || cotizacion.total;
    const estado = cotizacion.estado?.nombre || cotizacion.estado || 'registrada';
    return monto ? `Bs ${monto} - ${estado}` : estado;
  }

  getEvaluacionTexto(servicio: any): string {
    const evaluacion = servicio?.evaluacion;
    if (!evaluacion) return 'Sin evaluacion';
    const puntaje = evaluacion.puntaje || evaluacion.calificacion || evaluacion.estrellas;
    return puntaje ? `${puntaje}/5` : 'Registrada';
  }

  getTotalEvidencias(servicio: any): number {
    return Array.isArray(servicio?.evidencias) ? servicio.evidencias.length : 0;
  }

  getRangoTexto(): string {
    const total = Number(this.historial?.total || 0);
    if (!total) return '0 de 0';
    const inicio = this.offset + 1;
    const fin = Math.min(this.offset + this.limit, total);
    return `${inicio}-${fin} de ${total}`;
  }

  private getMensajeError(err: any, fallback: string): string {
    const detail = err?.error?.detail || err?.error?.mensaje || err?.message;
    if (!detail) return fallback;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map(item => item?.msg || item?.message || JSON.stringify(item)).join(' ');
    }
    return detail?.msg || detail?.message || fallback;
  }
}

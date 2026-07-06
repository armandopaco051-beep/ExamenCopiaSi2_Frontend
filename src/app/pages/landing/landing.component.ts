import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  ChatbotAccion,
  ChatbotLandingService,
  ChatbotRespuesta
} from '../../core/services/chatbot-landing.service';

interface ChatbotMensajeUi {
  texto: string;
  autor: 'bot' | 'usuario';
  acciones?: ChatbotAccion[];
  datos?: ChatbotRespuesta['datos'];
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: 'landing.component.html',
  styleUrls: ['landing.component.scss']
})
export class LandingComponent {
  emergencias = [
    { icon: '🔋', titulo: 'Batería', desc: 'Arranque y carga' },
    { icon: '🛞', titulo: 'Llanta', desc: 'Pinchazo y cambio' },
    { icon: '⚙️', titulo: 'Motor', desc: 'Fallas mecánicas' },
    { icon: '🚗', titulo: 'Choque', desc: 'Asistencia vial' },
    { icon: '🔑', titulo: 'Otros', desc: 'Cerrajería, etc.' }
  ];

  pasos = [
    {
      num: 'Paso 1',
      titulo: 'Reporta tu Emergencia',
      desc: 'Envía tu ubicación GPS, fotos y audio para describir el problema de tu vehículo',
      color: 'orange'
    },
    {
      num: 'Paso 2',
      titulo: 'IA Clasifica el Problema',
      desc: 'Nuestro sistema de IA analiza la información y clasifica el tipo de emergencia automáticamente',
      color: 'teal'
    },
    {
      num: 'Paso 3',
      titulo: 'Recibe Asistencia',
      desc: 'Un técnico del taller más cercano es asignado automáticamente para ayudarte',
      color: 'green'
    }
  ];

  chatbotAbierto = false;
  chatbotLoading = false;
  chatbotError = '';
  mensajeChatbot = '';
  preguntasRapidas: string[] = [
    'Como funciona la plataforma',
    'Planes y suscripciones',
    'Requisitos para registrar mi taller'
  ];
  mensajesChatbot: ChatbotMensajeUi[] = [
    {
      autor: 'bot',
      texto: 'Hola, soy el asistente de Vialert. Puedo ayudarte con planes, requisitos, beneficios o el registro de tu taller.'
    }
  ];

  constructor(
    private chatbotService: ChatbotLandingService,
    private router: Router
  ) {
    this.cargarContextoChatbot();
  }

  toggleChatbot(): void {
    this.chatbotAbierto = !this.chatbotAbierto;
  }

  enviarMensajeChatbot(): void {
    const mensaje = this.mensajeChatbot.trim();
    if (!mensaje || this.chatbotLoading) return;

    this.mensajesChatbot.push({ autor: 'usuario', texto: mensaje });
    this.mensajeChatbot = '';
    this.consultarChatbot(mensaje);
  }

  usarPreguntaRapida(pregunta: string): void {
    if (this.chatbotLoading) return;
    this.mensajesChatbot.push({ autor: 'usuario', texto: pregunta });
    this.consultarChatbot(pregunta);
  }

  ejecutarAccion(accion: ChatbotAccion): void {
    const tipo = accion.tipo || '';

    if (['iniciar_solicitud_taller', 'abrir_formulario_solicitud_taller'].includes(tipo)) {
      this.irRegistroTaller();
      return;
    }

    if (tipo === 'ver_requisitos') {
      this.usarPreguntaRapida('Que necesito para registrar mi taller');
      return;
    }

    if (tipo === 'ver_planes') {
      this.usarPreguntaRapida('Quiero saber los planes y suscripciones');
      return;
    }

    if (accion.label) {
      this.usarPreguntaRapida(accion.label);
    }
  }

  irRegistroTaller(): void {
    this.router.navigate(['/registro'], {
      queryParams: { tipo: 'taller' }
    });
  }

  getListaDato(datos: ChatbotRespuesta['datos'] | undefined, clave: 'planes' | 'requisitos' | 'beneficios'): any[] {
    const lista = datos?.[clave];
    return Array.isArray(lista) ? lista : [];
  }

  getTituloDato(item: any): string {
    if (typeof item === 'string') return item;
    return item?.nombre || item?.titulo || item?.plan || item?.label || 'Detalle';
  }

  getDescripcionDato(item: any): string {
    if (typeof item === 'string') return '';
    return item?.descripcion || item?.detalle || item?.beneficio || item?.requisito || item?.precio || '';
  }

  private cargarContextoChatbot(): void {
    this.chatbotService.obtenerPreguntasFrecuentes().subscribe({
      next: data => {
        const preguntas = this.extraerPreguntas(data);
        if (preguntas.length > 0) this.preguntasRapidas = preguntas.slice(0, 4);
      },
      error: err => console.error('ERROR FAQ CHATBOT:', err)
    });

    this.chatbotService.obtenerContexto().subscribe({
      error: err => console.error('ERROR CONTEXTO CHATBOT:', err)
    });
  }

  private consultarChatbot(mensaje: string): void {
    this.chatbotLoading = true;
    this.chatbotError = '';

    this.chatbotService.enviarMensaje(mensaje).subscribe({
      next: resp => {
        this.mensajesChatbot.push({
          autor: 'bot',
          texto: resp?.respuesta || 'No tengo una respuesta disponible en este momento.',
          acciones: resp?.acciones || [],
          datos: resp?.datos || {}
        });
        this.chatbotLoading = false;
      },
      error: err => {
        console.error('ERROR CHATBOT LANDING:', err);
        this.chatbotError = this.getMensajeError(err, 'No pude responder ahora. Intenta de nuevo en unos segundos.');
        this.mensajesChatbot.push({
          autor: 'bot',
          texto: this.chatbotError
        });
        this.chatbotLoading = false;
      }
    });
  }

  private extraerPreguntas(data: any): string[] {
    const fuente = Array.isArray(data) ? data : data?.preguntas || data?.preguntas_frecuentes || data?.items || [];
    if (!Array.isArray(fuente)) return [];

    return fuente
      .map((item: any) => typeof item === 'string' ? item : item?.pregunta || item?.mensaje || item?.titulo)
      .filter(Boolean);
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

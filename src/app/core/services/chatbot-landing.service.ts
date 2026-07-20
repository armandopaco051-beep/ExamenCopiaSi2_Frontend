import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../enviroments/enviroments';

export interface ChatbotAccion {
  tipo: string;
  label: string;
  payload?: any;
}

export interface ChatbotRespuesta {
  respuesta: string;
  intencion: string;
  confianza: number;
  acciones?: ChatbotAccion[];
  datos?: {
    planes?: any[];
    requisitos?: any[];
    beneficios?: any[];
    [key: string]: any;
  };
}

export interface SolicitudTallerChatbot {
  codigo_usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
  nombre_taller: string;
  telefono_taller: string;
  direccion_taller: string;
  latitud_taller: number | null;
  longitud_taller: number | null;
  horario_inicio: string;
  horario_fin: string;
  origen: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotLandingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Recupera el contexto editable que usa el bot para responder en el landing.
  obtenerContexto(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chatbot/landing/contexto`);
  }

  // Carga preguntas sugeridas para mostrarlas como accesos rapidos en el widget.
  obtenerPreguntasFrecuentes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chatbot/landing/preguntas-frecuentes`);
  }

  // Envia el texto del usuario y recibe respuesta, intencion, acciones y datos renderizables.
  enviarMensaje(mensaje: string): Observable<ChatbotRespuesta> {
    return this.http.post<ChatbotRespuesta>(`${this.apiUrl}/chatbot/landing/mensaje`, {
      mensaje
    });
  }

  // Endpoint disponible para solicitud directa desde bot; el landing redirige al registro oficial.
  enviarSolicitudTaller(datos: SolicitudTallerChatbot): Observable<any> {
    return this.http.post(`${this.apiUrl}/chatbot/landing/solicitud-taller`, datos);
  }
}

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

  obtenerContexto(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chatbot/landing/contexto`);
  }

  obtenerPreguntasFrecuentes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chatbot/landing/preguntas-frecuentes`);
  }

  enviarMensaje(mensaje: string): Observable<ChatbotRespuesta> {
    return this.http.post<ChatbotRespuesta>(`${this.apiUrl}/chatbot/landing/mensaje`, {
      mensaje
    });
  }

  enviarSolicitudTaller(datos: SolicitudTallerChatbot): Observable<any> {
    return this.http.post(`${this.apiUrl}/chatbot/landing/solicitud-taller`, datos);
  }
}

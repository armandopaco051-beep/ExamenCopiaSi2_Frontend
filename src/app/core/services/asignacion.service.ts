import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../enviroments/enviroments";

export interface HistorialServiciosTallerParams {
  codigo_cliente?: string;
  estado_asignacion?: number | string;
  limit?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  listarPorTaller(idTaller: number ): Observable<any> {
    return this.http.get(`${this.apiUrl}/asignacion/taller/${idTaller}`);
  }

  aceptarAsignacion(idAsignacion: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/asignacion/${idAsignacion}/aceptar`, {});
  }
  rechazarAsignacion(idAsignacion :number, observacion :string){
     return this.http.put<any>(
    `${this.apiUrl}/asignacion/${idAsignacion}/rechazar`,
    { observacion }
  )
  }
  asignarTecnico(idAsignacion : number , codigoTecnico : string){
    return this.http.put<any>(
      `${this.apiUrl}/asignacion/${idAsignacion}/tecnico/${codigoTecnico}`,
      {codigo_tecnico: codigoTecnico,
        observacion: 'Técnico asignado desde el panel del taller'
      }
    )
  }
  iniciarRuta(idAsignacion:number){
    return this.http.put(`${this.apiUrl}/asignacion/${idAsignacion}/iniciar-ruta`, {});
  }
  finalizarServicio(idAsignacion:number){
    return this.http.put(`${this.apiUrl}/asignacion/${idAsignacion}/finalizar`, {});
  }

  obtenerHistorialServiciosTaller(params: HistorialServiciosTallerParams): Observable<any> {
    let httpParams = new HttpParams()
      .set('limit', String(params.limit ?? 20))
      .set('offset', String(params.offset ?? 0));

    if (params.codigo_cliente) {
      httpParams = httpParams.set('codigo_cliente', params.codigo_cliente);
    }

    if (params.estado_asignacion !== undefined && params.estado_asignacion !== null && params.estado_asignacion !== '') {
      httpParams = httpParams.set('estado_asignacion', String(params.estado_asignacion));
    }

    return this.http.get(`${this.apiUrl}/asignacion/mi-taller/historial-servicios`, {
      params: httpParams
    });
  }
  
}

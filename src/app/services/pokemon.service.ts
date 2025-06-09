import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  constructor(private http: HttpClient) {}

getAllPokemon(filter: string | null): Observable<any> {
  return this.http.get<any>('https://pokeapi.co/api/v2/pokemon?limit=100').pipe(
    map(res => ({
      results: res.results.filter((p: any) =>
        p.name.toLowerCase().includes((filter ?? '').toLowerCase())
      )
    }))
  );
}

  getEncounters(name: string): Observable<any> {
    return this.http.get(`https://pokeapi.co/api/v2/pokemon/${name}/encounters`);
  }
}
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { PokemonService } from 'src/app/services/pokemon.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchControl = new FormControl('');
  suggestions: { name: string }[] = [];
  activeIndex: number = -1;
  isFocused = false;
  isLoading = false;

  constructor(private pokemonService: PokemonService, private router: Router) {}

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => {
          this.isLoading = true;
          this.suggestions = [];
        }),
        switchMap(query =>
          this.pokemonService.getAllPokemon(query).pipe(
            tap(() => (this.isLoading = false)),
            tap(pokemonList => {
              const all = pokemonList?.results || [];
              const filtered = all.filter((p: any) =>
                p.name.toLowerCase().includes((query ?? '').toLowerCase())
              );
              this.suggestions = filtered.slice(0, 9);
              this.activeIndex = -1;
            })
          )
        )
      )
      .subscribe({
        error: () => {
          this.suggestions = [];
          this.isLoading = false;
        }
      });
  }

  onSearch(query: string | null): void {
    if (!query || !query.trim()) return;
    this.router.navigate(['/results'], { queryParams: { pokemon: query.toLowerCase() } });
    this.suggestions = [];
    this.activeIndex = -1;
  }

  onSuggestionClick(name: string): void {
    this.onSearch(name);
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (!this.suggestions.length) return;

    if (event.key === 'ArrowDown') {
      this.activeIndex = (this.activeIndex + 1) % this.suggestions.length;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.activeIndex = (this.activeIndex - 1 + this.suggestions.length) % this.suggestions.length;
      event.preventDefault();
    } else if (event.key === 'Enter') {
      if (this.activeIndex >= 0) {
        this.onSuggestionClick(this.suggestions[this.activeIndex].name);
        event.preventDefault();
      } else {
        this.onSearch(this.searchControl.value);
      }
    } else if (event.key === 'Escape') {
      this.suggestions = [];
      this.activeIndex = -1;
    }
  }

  onBlur(): void {
    this.isFocused = false;
    setTimeout(() => (this.suggestions = []), 150);
  }

  onFocus(): void {
    this.isFocused = true;
  }
}


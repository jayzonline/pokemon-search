import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap, of } from 'rxjs';
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
  noResults = false;
  cache = new Map<string, { name: string }[]>();

  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(private pokemonService: PokemonService, private router: Router) { }

  ngOnInit(): void {
    const cachedQuery = sessionStorage.getItem('searchQuery');
    if (cachedQuery) {
      this.searchControl.setValue(cachedQuery);
    }

    this.searchControl.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged((prev, curr) =>
          prev?.trim().toLowerCase() === curr?.trim().toLowerCase()
        ),
        tap(() => {
          this.isLoading = true;
          this.suggestions = [];
          this.noResults = false;
        }),
        switchMap(query => {
          const trimmedQuery = query?.trim().toLowerCase() ?? '';
          if (trimmedQuery.length < 2) {
            this.isLoading = false;
            return of([]);
          }

          if (this.cache.has(trimmedQuery)) {
            const cachedResults = this.cache.get(trimmedQuery)!;
            this.suggestions = cachedResults.slice(0, 10);
            this.noResults = this.suggestions.length === 0;
            this.activeIndex = -1;
            this.isLoading = false;
            return of([]);
          }

          return this.pokemonService.getAllPokemon(trimmedQuery).pipe(
            tap(pokemonList => {
              const all = pokemonList?.results || [];
              const filtered = all.filter((p: any) =>
                p.name.toLowerCase().includes(trimmedQuery)
              );
              this.cache.set(trimmedQuery, filtered);
              this.suggestions = filtered.slice(0, 10);
              this.noResults = this.suggestions.length === 0;
              this.activeIndex = -1;
              this.isLoading = false;
            })
          );
        })
      )
      .subscribe({
        error: () => {
          this.suggestions = [];
          this.noResults = true;
          this.isLoading = false;
        }
      });
  }

  onSearch(query: string | null): void {
    if (!query || !query.trim()) return;

    const formatted = query.trim().toLowerCase();
    this.searchControl.setValue(formatted, { emitEvent: false });
    sessionStorage.setItem('searchQuery', formatted);

    this.router.navigate(['/results'], {
      queryParams: { pokemon: formatted }
    });

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
      this.searchInput?.nativeElement.blur();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.searchInput?.nativeElement.contains(event.target)) {
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

  highlightMatch(name: string): string {
    const query = this.searchControl.value?.toLowerCase() ?? '';
    return name.replace(new RegExp(`(${query})`, 'i'), '<strong>$1</strong>');
  }
}

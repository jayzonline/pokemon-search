import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonService } from 'src/app/services/pokemon.service';
import { Encounter } from 'src/app/models/pokemon.model';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  pokemonName: string = '';
  allEncounters: Encounter[] = [];
  paginatedEncounters: Encounter[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  searchInitiated: boolean = false;
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pokemonService: PokemonService
  ) { }

  ngOnInit(): void {
    const cachedState = sessionStorage.getItem('resultsState');
    this.route.queryParams.subscribe(params => {
      const name = params['pokemon'];

      if (name) {
        this.searchInitiated = true;
        this.pokemonName = name;

        if (cachedState) {
          const parsed = JSON.parse(cachedState);
          if (parsed.pokemonName === name) {
            this.allEncounters = parsed.allEncounters;
            this.currentPage = parsed.currentPage;
            this.updatePagination();
            return;
          }
        }

        this.fetchEncounters(name);
      } else {
        this.searchInitiated = false;
        this.allEncounters = [];
        this.paginatedEncounters = [];
      }
    });
  }

  fetchEncounters(name: string): void {
    this.isLoading = true;

    this.pokemonService.getEncounters(name).subscribe({
      next: (data: Encounter[]) => {
        this.allEncounters = data || [];
        this.currentPage = 1;
        this.isLoading = false;
        this.saveState();
        this.updatePagination();
      },
      error: () => {
        this.allEncounters = [];
        this.currentPage = 1;
        this.isLoading = false;
        this.updatePagination();
      }
    });
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEncounters = this.allEncounters.slice(startIndex, endIndex);
  }

  onPageChange(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.updatePagination();
      this.saveState();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.allEncounters.length / this.pageSize);
  }

  saveState(): void {
    const state = {
      pokemonName: this.pokemonName,
      allEncounters: this.allEncounters,
      currentPage: this.currentPage
    };
    sessionStorage.setItem('resultsState', JSON.stringify(state));
  }

  formatLocation(name: string): string {
    return name.replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }
}

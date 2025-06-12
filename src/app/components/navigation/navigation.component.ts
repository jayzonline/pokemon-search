import { AfterViewInit, Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { NavItem } from 'src/app/models/pokemon.model';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})

export class NavigationComponent implements AfterViewInit, OnDestroy {
  private readonly allItems: NavItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Results', route: '/results' },
    { label: 'Pokédex' },
    { label: 'Types' },
    { label: 'Abilities' },
    { label: 'Moves' },
    { label: 'Favorites' },
    { label: 'Login' }
  ];
  visibleItems: NavItem[] = [];
  overflowItems: NavItem[] = [];

  @ViewChild('navContainer', { static: false }) private navContainer!: ElementRef<HTMLElement>;

  private readonly destroy$ = new Subject<void>();
  private resizeObserver?: ResizeObserver;

  constructor(private router: Router) { }

  ngAfterViewInit(): void {
    this.initResizeHandling();
    setTimeout(() => this.adjustMenuItems(), 0);
  }

  private initResizeHandling(): void {
    this.resizeObserver = new ResizeObserver(() => this.adjustMenuItems());

    const containerEl = this.navContainer?.nativeElement;
    if (containerEl) this.resizeObserver.observe(containerEl);

    fromEvent(window, 'resize')
      .pipe(debounceTime(100), takeUntil(this.destroy$))
      .subscribe(() => this.adjustMenuItems());
  }

  private adjustMenuItems(): void {
    const container = this.navContainer.nativeElement;
    const containerWidth = container.offsetWidth;
    const buffer = 60;
    let usedWidth = 350;
    this.visibleItems = [];

    for (const item of this.allItems) {
      const width = this.measureTextWidth(item.label, 'nav-item-temp', container);
      if (usedWidth + width + buffer < containerWidth) {
        this.visibleItems.push(item);
        usedWidth += width;
      } else {
        break;
      }
    }

    this.overflowItems = this.allItems.slice(this.visibleItems.length);
  }

  private measureTextWidth(text: string, className: string, container: HTMLElement): number {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = className;

    Object.assign(span.style, {
      visibility: 'hidden',
      position: 'absolute'
    });

    container.appendChild(span);
    const width = span.offsetWidth;
    container.removeChild(span);

    return width;
  }


  selectLink({ target }: Event): void {
    const value = (target as HTMLSelectElement).value;
    if (value) {
      const navItem = this.allItems.find(item => item.label === value);
      if (navItem) {
        this.navigateTo(navItem);
      }
    }
  }

  navigateTo(item: NavItem): void {
    const key = item.label.toLowerCase();
    if (key === 'results') {
      const cached = sessionStorage.getItem('resultsState');
      if (cached) {
        const state = JSON.parse(cached);
        if (state?.pokemonName) {
          this.router.navigate(['/results'], {
            queryParams: { pokemon: state.pokemonName }
          });
          return;
        }
      }
    }

    if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  isActive(item: NavItem): boolean {
    if (!item.route) return false;

    const currentUrl = this.router.url;
    if (item.route === '/results') {
      return currentUrl.startsWith('/results');
    }

    return currentUrl === item.route;
  }


  getActiveItem(items: NavItem[]): NavItem | null {
    return items.find(item => this.isActive(item)) || null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.resizeObserver?.disconnect();
  }
}

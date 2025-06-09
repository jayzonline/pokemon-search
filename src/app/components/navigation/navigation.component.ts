import { AfterViewInit, Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements AfterViewInit, OnDestroy {
  private readonly allItems: string[] = ['Home', 'Results', 'Pokédex', 'Types', 'Abilities', 'Moves', 'Favorites', 'Login'];
  visibleItems: string[] = [];
  overflowItems: string[] = [];

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
      const width = this.measureTextWidth(item, 'nav-item-temp', container);
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
    const temp = document.createElement('span');
    Object.assign(temp.style, {
      visibility: 'hidden',
      position: 'absolute'
    });
    temp.className = className;
    temp.textContent = text;
    container.appendChild(temp);
    const width = temp.offsetWidth;
    container.removeChild(temp);
    return width;
  }

  selectLink({ target }: Event): void {
    const value = (target as HTMLSelectElement).value;
    if (value) {
      this.navigateTo(value);
    }
  }

  navigateTo(item: string): void {
    const path = this.getRoutePath(item);
    if (path) {
      this.router.navigate([path]);
    }
  }

  getRoutePath(item: string): string | null {
    const routes: Record<string, string> = {
      home: '/',
      results: '/results'
    };
    return routes[item.toLowerCase()] ?? null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.resizeObserver?.disconnect();
  }
}

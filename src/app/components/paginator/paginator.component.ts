import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.css']
})
export class PaginatorComponent {
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Output() pageChanged = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChanged.emit(page);
    }
  }
}

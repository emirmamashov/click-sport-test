import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    NzInputModule,
    NzIconModule
  ],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent {
  @Input() value: any = '';
  @Input() label = '';
  @Input() type = '';
  @Input() required = false;
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() icon = '';
  @Input() rightIcon = '';
  @Input() form: FormGroup | any;
  @Input() fieldName = '';
  @Input() mismatchError = false;

  @Output() changed = new EventEmitter();
  @Output() entered = new EventEmitter();
  @Output() rightIconClick = new EventEmitter();

  public onChange(value: any): void {
    this.changed.emit(value);
  }
}

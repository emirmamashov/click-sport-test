import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { InputComponent } from '../../components';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ShoppingListService } from '../../services';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { iShoppingList } from '../../models';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [
    NzButtonModule,
    NzInputModule,
    FormsModule,
    ReactiveFormsModule,
    InputComponent,
    CommonModule,
    NzSelectModule,
    NzIconModule,
    NzPopconfirmModule,
    NzCardModule
  ],
  templateUrl: './shopping-list.component.html',
  styleUrl: './shopping-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  public shoppingList: Array<iShoppingList> = [];

  public shoppingItemForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    price: ['', [Validators.required]],
    description: [''],
  } as AbstractControlOptions);

  public isLoading = false;
  public removeLoading = false;
  public nzFilterOption = (): boolean => true;

  private destroyed$ = new Subject();

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private shoppingListService: ShoppingListService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getIncomings();
  }

  public getIncomings(text?: string): void {
    this.shoppingListService.getAll(text).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.shoppingList = res.docs;
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
      }
    });
  }

  public add(): void {
    if (this.shoppingItemForm.invalid) {
      this.messageService.error('Заполните все поля!');
      return;
    }

    this.isLoading = true;
    this.shoppingListService.add(this.shoppingItemForm.value).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.shoppingList.push(res);
        this.shoppingItemForm.reset();
        this.messageService.success('Успешно создано!');
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
        this.isLoading = false;
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  public remove(shoppingList: iShoppingList): void {
    this.removeLoading = true;
    this.shoppingListService.remove(shoppingList._id).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.removeLoading = false;
        this.shoppingList = this.shoppingList.filter(x => x._id !== shoppingList._id);
        this.messageService.success('Успешно удалено!');
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
        this.removeLoading = false;
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

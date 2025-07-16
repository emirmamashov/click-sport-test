import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { InputComponent } from '../../components';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CurrencyService, StateService } from '../../services';
import { Subject, takeUntil } from 'rxjs';
import { Currency } from '../../models/currency';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-currencies',
  standalone: true,
  imports: [
    NzButtonModule,
    NzInputModule,
    FormsModule,
    InputComponent,
    CommonModule,
    NzIconModule
  ],
  providers: [
    CurrencyService
  ],
  templateUrl: './currencies.component.html',
  styleUrl: './currencies.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrenciesComponent implements OnInit, OnDestroy {
  public currencies: Array<Currency> = [];
  public selectedCurrencyId: string = '';
  public PagesAccess = this.stateService.pageAccess$.value;

  public currencyAddForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    sellValue: ['', [Validators.required]],
    buyValue: ['', [Validators.required]],
    currentValue: [0],
  } as AbstractControlOptions);

  public isLoading = false;
  public editLoading = false;
  public removeLoading = false;
  public isOwner = this.stateService.isOwner$.value;

  private destroyed$ = new Subject();

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private currencyService: CurrencyService,
    private stateService: StateService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getCurrencies();
  }

  public getCurrencies(): void {
    this.currencyService.getAll().pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.currencies = res.docs;
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
      }
    });
  }

  public add(): void {
    if (this.currencyAddForm.invalid) {
      this.messageService.error('Заполните все поля!');
      return;
    }

    this.isLoading = true;
    this.currencyService.add(this.currencyAddForm.value).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.currencies.push(res);
        this.currencyAddForm.reset();
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

  public edit(currency: Currency): void {
    console.log('currency', currency);

    this.editLoading = true;
    this.currencyService.edit(currency).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.editLoading = false;
        this.selectedCurrencyId = '';
        this.messageService.success('Успешно изменено!');
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
        this.editLoading = false;
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  public remove(currency: Currency): void {
    console.log('currency', currency);

    this.removeLoading = true;
    this.currencyService.remove(currency).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.removeLoading = false;
        this.selectedCurrencyId = '';
        this.currencies = this.currencies.filter(x => x._id !== currency._id);
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

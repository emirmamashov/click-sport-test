import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { InputComponent } from '../../components';
import { CommonModule } from '@angular/common';
import { CityService, FilialService, StateService } from '../../services';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Filial } from '../../models/filial';
import { City } from '../../models/shopping-list';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-filials',
  standalone: true,
  imports: [
    NzButtonModule,
    NzInputModule,
    FormsModule,
    InputComponent,
    CommonModule,
    NzSelectModule,
    NzIconModule
  ],
  providers: [
    FilialService,
    CityService
  ],
  templateUrl: './filials.component.html',
  styleUrl: './filials.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilialsComponent implements OnInit, OnDestroy {
  public filials: Array<Filial> = [];
  public cities: Array<City> = [];
  public selectedClientId = '';
  public selectedCityId = '';
  public nzFilterOption = (): boolean => true;

  public PagesAccess = this.stateService.pageAccess$.value;

  public filialAddForm: FormGroup = this.fb.group({
    name: ['', [Validators.required], Validators.minLength(2)],
    address: [''],
    email: ['', Validators.email],
    phone: [''],
    cityId: [''],
  } as AbstractControlOptions);

  public isLoading = false;
  public editLoading = false;
  public removeLoading = false;

  private destroyed$ = new Subject();

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private filialService: FilialService,
    private cityService: CityService,
    private stateService: StateService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getCities();
    this.getfilials();
  }

  public getCities(): void {
    this.cityService.getAll().pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.cities = res.docs;
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
      }
    });
  }


  public getfilials(): void {
    this.filialService.getAll().pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.filials = res.docs;
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
      }
    });
  }

  public add(): void {
    if (this.filialAddForm.invalid) {
      this.messageService.error('Заполните все поля!');
      return;
    }

    this.isLoading = true;
    const data = this.filialAddForm.value;
    data.cityId = this.selectedCityId;
    console.log('data', data);
    this.filialService.add(data).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.filials.unshift(res);
        this.messageService.success('Успешно создано!');
        this.filialAddForm.reset();
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
        this.isLoading = false;
        this.filialAddForm.reset();
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  public edit(filial: Filial): void {
    console.log('filial', filial, this.selectedCityId);

    this.editLoading = true;
    filial.cityId = this.selectedCityId;
    this.filialService.edit(filial).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.editLoading = false;
        this.selectedClientId = '';
        this.getfilials();
        this._changeDetectorRef.detectChanges();
        this.messageService.success('Успешно изменено!');
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
        this.editLoading = false;
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  public remove(filial: Filial): void {
    console.log('filial', filial);

    this.removeLoading = true;
    this.filialService.remove(filial).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.removeLoading = false;
        this.selectedClientId = '';
        this.filials = this.filials.filter(x => x._id !== filial._id);
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

  public searchCities(value: string): void {
    console.log('searchCities', value);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

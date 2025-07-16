import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { InputComponent } from '../../components';
import { CommonModule } from '@angular/common';
import { ClientService, StateService } from '../../services';
import { Client } from '../../models/client';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NumberModule } from '../../pipes';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    NzButtonModule,
    NzInputModule,
    FormsModule,
    InputComponent,
    CommonModule,
    NumberModule,
    NzIconModule
  ],
  providers: [
    ClientService
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientsComponent implements OnInit, OnDestroy {
  public clients: Array<Client> = [];
  public selectedClientId: string = '';
  public PagesAccess = this.stateService.pageAccess$.value;

  public clientAddForm: FormGroup = this.fb.group({
    name: ['', [Validators.required], Validators.minLength(2)],
    phone: ['', [Validators.required]]
  } as AbstractControlOptions);

  public isLoading = false;
  public editLoading = false;
  public removeLoading = false;

  private destroyed$ = new Subject();

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private clientService: ClientService,
    private stateService: StateService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getClients();
  }

  public searchClients(val: string): void {
    console.log('searchClients', val);
    this.getClients(val);
  }

  public getClients(text?: string): void {
    this.clientService.getAll(text).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.clients = res.docs;
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
      }
    });
  }

  public add(): void {
    if (this.clientAddForm.invalid) {
      this.messageService.error('Заполните все поля!');
      return;
    }

    this.isLoading = true;
    this.clientService.add(this.clientAddForm.value).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.clients.unshift(res);
        this.messageService.success('Успешно создано!');
        this.clientAddForm.reset();
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
        this.isLoading = false;
        this.clientAddForm.reset();
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  public edit(client: Client): void {
    console.log('client', client);

    this.editLoading = true;
    this.clientService.edit(client).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.editLoading = false;
        this.selectedClientId = '';
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

  public remove(client: Client): void {
    console.log('client', client);

    this.removeLoading = true;
    this.clientService.remove(client).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.removeLoading = false;
        this.selectedClientId = '';
        this.clients = this.clients.filter(x => x._id !== client._id);
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

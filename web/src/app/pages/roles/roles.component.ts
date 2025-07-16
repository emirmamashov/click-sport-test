import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { InputComponent } from '../../components';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RoleService } from '../../services/role/role.service';
import { Role, RolePageAccess } from '../../models/role';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { AllPages, Pages } from '../../consts';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { StateService } from '../../services';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    NzButtonModule,
    NzInputModule,
    FormsModule,
    InputComponent,
    CommonModule,
    NzModalModule,
    NzCheckboxModule,
    NzIconModule
  ],
  providers: [
    RoleService
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesComponent implements OnInit, OnDestroy {
  public PAGES = Pages;
  public ALLPages = AllPages;
  public PagesAccess = this.stateService.pageAccess$.value;

  public roles: Array<Role> = [];
  public selectedRole?: Role;

  public roleAddForm: FormGroup = this.fb.group({
    name: ['', [Validators.required], Validators.minLength(2)],
    description: ['']
  } as AbstractControlOptions);

  public isLoading = false;
  public editLoading = false;
  public removeLoading = false;
  public isVisibleAccessModal = false;
  public checked = false;

  private destroyed$ = new Subject();

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private roleService: RoleService,
    private stateService: StateService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getRoles();
  }

  public getRoles(): void {
    this.roleService.getAll().pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.roles = res.docs;
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
      }
    });
  }

  public add(): void {
    if (this.roleAddForm.invalid) {
      this.messageService.error('Заполните все поля!');
      return;
    }

    this.isLoading = true;
    const data = this.roleAddForm.value;
    data.accesses = this.getDefaultAccess();
    console.log('data', data);

    this.roleService.add(this.roleAddForm.value).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.roles.unshift(res);
        this.messageService.success('Успешно создано!');
        this.roleAddForm.reset();
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
        this.isLoading = false;
        this.roleAddForm.reset();
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  private getDefaultAccess() {
    const access: Array<RolePageAccess> = [];
    this.ALLPages.forEach((page) => {
      access.push({
        page: page.id,
        pageTitle: page.name,
        read: true,
        edit: false,
        add: false,
        delete: false
      });
    });
    console.log('access', access);
    return access;
  }

  public edit(role?: Role): void {
    console.log('role', role);
    if (!role) {
      return;
    }

    this.editLoading = true;
    this.roleService.edit(role).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.messageService.success('Успешно изменено!');
        this.editLoading = false;
        this.selectedRole = undefined;
        this.isVisibleAccessModal = false;
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
        this.editLoading = false;
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  public remove(role: Role): void {
    console.log('role', role);

    this.removeLoading = true;
    this.roleService.remove(role).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.removeLoading = false;
        this.selectedRole = undefined;
        this.roles = this.roles.filter(x => x._id !== role._id);
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

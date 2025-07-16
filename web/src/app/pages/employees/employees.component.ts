import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { InputComponent } from '../../components';
import { CommonModule } from '@angular/common';
import { CityService, EmployeeService, FilialService, RoleService, StateService, UserService } from '../../services';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { City, Employee, Filial, Role, User } from '../../models';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-employees',
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
    CityService,
    EmployeeService,
    RoleService,
    UserService
  ],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeesComponent implements OnInit, OnDestroy {
  public filials: Array<Filial> = [];
  public cities: Array<City> = [];
  public roles: Array<Role> = [];
  public employees: Array<Employee> = [];

  public PagesAccess = this.stateService.pageAccess$.value;

  public selectedFilialId = '';
  public selectedRoleId = '';
  public selectedCityId = '';
  public selectedEmployeeId = '';

  public selectedUser: User | any;
  public nzFilterOption = (): boolean => true;

  public userAddForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    name: ['', [Validators.required]],
    password: ['', [Validators.required]],
    phone: ['']
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
    private roleService: RoleService,
    private userService: UserService,
    private employeeService: EmployeeService,
    private stateService: StateService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getCities();
    this.getRoles();
    this.getfilials();
    this.getEmployees();
  }

  private getEmployees(): void {
    this.employeeService.getAll().pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.employees = res.docs;
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
      }
    });
  }

  private getCities(): void {
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

  private getRoles(): void {
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

  private getfilials(): void {
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
    if (this.userAddForm.invalid || !this.selectedRoleId || !this.selectedFilialId) {
      this.messageService.error('Заполните все поля!');
      return;
    }

    this.isLoading = true;
    const data = this.userAddForm.value;
    data.cityId = this.selectedCityId;
    // data.filialId = this.selectedFilialId;
    // data.roleId = this.selectedRoleId;
    console.log('data', data);

    this.userService.add(data).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        console.log('res', res);
        const employee: Employee = {
          userId: res.id,
          filialId: this.selectedFilialId,
          roleId: this.selectedRoleId
        };
        this.addEmployee(employee);
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
        this.isLoading = false;
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  private addEmployee(data: Employee): void {
    if (!data.userId) {
      this.isLoading = false;
      this._changeDetectorRef.detectChanges();
      this.messageService.error('Ошибка при создании пользователя в системе!');
      return;
    }

    this.employeeService.add(data).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.userAddForm.reset();
        this.reset();
        this.getEmployees();
        this.messageService.success('Успешно создано!');
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
        this.isLoading = false;
        this.userAddForm.reset();
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  public edit(employee: Employee): void {
    console.log('edit employee', employee);

    this.editLoading = true;
    this.selectedUser.cityId = this.selectedCityId;
    console.log('edit employee', employee, this.selectedUser);
    this.userService.edit(this.selectedUser).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        console.log('res', res);
        const employee: Employee = {
          userId: this.selectedUser._id,
          filialId: this.selectedFilialId,
          roleId: this.selectedRoleId
        };
        this.editEmployee(employee);
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
        this.editLoading = false;
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  private editEmployee(employee: Employee): void {
    this.employeeService.edit(employee).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.editLoading = false;
        this.reset();
        this.getEmployees();
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

  public remove(employee: Employee): void {
    console.log('employee', employee);

    this.removeLoading = true;
    this.employeeService.remove({
      _id: employee._id || '',
      userId: employee.userId
    }).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.removeLoading = false;
        this.reset();
        this.employees = this.employees.filter(x => x._id !== employee._id);
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

  public searchRoles(value: string): void {
    console.log('searchRoles', value);
  }

  public selectEmployee(employee: Employee): void {
    this.selectedEmployeeId = employee._id || '';
    this.selectedRoleId = employee.roleId._id;
    this.selectedFilialId = employee.filialId._id;
    this.selectedUser = employee.userId;
    this.selectedCityId = employee.userId.cityId._id;
  }

  public reset() {
    this.selectedRoleId = '';
    this.selectedCityId = '';
    this.selectedEmployeeId = '';
    this.selectedFilialId = '';
    this.selectedUser = undefined;
    this._changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService, LocalStroageService, StateService } from '../../services';
import { InputComponent } from '../../components';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

declare const window: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NzButtonModule,
    NzInputModule,
    FormsModule,
    NzIconModule,
    InputComponent
  ],
  providers: [
    AuthService,
    NzMessageService
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnDestroy {
  public isLoading = false;
  public passwordVisible = false;
  public password = '';
  public loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required], Validators.minLength(2)],
    password: ['', [Validators.required, Validators.minLength(4)]],
  } as AbstractControlOptions);

  private destroyed$ = new Subject();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private localStorageService: LocalStroageService,
    private messageService: NzMessageService,
    private stateService: StateService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  public login(): void {
    if (this.loginForm.valid) {
      return;
    }

    this.isLoading = true;
    this.authService.login(this.loginForm.value).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(data => {
      this.localStorageService.setAccessToken(data.accessToken);
      this.localStorageService.setUserData(data.user);
      this.stateService.isOwner$.next(data.isOwner);
      this.isLoading = false;
      console.log('data', data);
      window.location.href = '/';
    }, (err) => {
      console.log('err', err);
      this.isLoading = false;
      this.messageService.error(err?.error?.msg);
      this._changeDetectorRef.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { OrderService, StateService } from '../../services';
import { Order } from '../../models';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { CheckComponent } from '../check/check.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { OrderTypes } from '../../consts';
import { NzInputModule } from 'ng-zorro-antd/input';
import { InputComponent } from '../../components';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzButtonModule,
    NzDropDownModule,
    NzInputModule,
    InputComponent
  ],
  providers: [
    OrderService,
    NzModalService
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderListComponent implements OnInit, OnDestroy {
  public orders: Array<Order> = [];
  public PagesAccess = this.stateService.pageAccess$.value;

  public isLoading = false;
  public removeLoading = false;
  public OrderTypes = OrderTypes;

  private destroyed$ = new Subject();

  constructor(
    private orderService: OrderService,
    private messageService: NzMessageService,
    private modal: NzModalService,
    private stateService: StateService,
    private viewContainerRef: ViewContainerRef,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getOrders();
  }

  public searchOrders(val: string): void {
    console.log('searchOrders', val);
    this.getOrders(val);
  }

  private getOrders(text?: string): void {
    this.isLoading = true;
    console.log('getOrders')
    this.orderService.getAll(text).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.orders = res.docs;
        this.isLoading = false;
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.error(err?.error?.msg);
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  public remove(orderId: string): void {
    if (!orderId) {
      return;
    }

    this.removeLoading = true;
    this.orderService.remove(orderId).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        console.log('res', res);
        this.removeLoading = false;
        this.orders = this.orders.filter(x => x._id !== orderId);
        this.messageService.info('Заказ удален!');
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.removeLoading = false;
        this.messageService.error(err?.error?.msg);
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  public showCheck(order: Order): void {
    this.modal.create<CheckComponent>({
      nzTitle: '',
      nzContent: CheckComponent,
      nzWidth: '100%',
      nzClassName: 'check-modal',
      nzViewContainerRef: this.viewContainerRef,
      nzData: order
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

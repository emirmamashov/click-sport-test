import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { Order } from '../../models/order';
import { LocalStroageService } from '../../services';
import { User } from '../../models';
import { OrderTypes } from '../../consts';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';

declare const window: any;

@Component({
  selector: 'app-check',
  standalone: true,
  imports: [
    NzButtonModule,
    NzIconModule,
    CommonModule
  ],
  templateUrl: './check.component.html',
  styleUrl: './check.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckComponent implements OnInit {
  listOfData = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park'
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park'
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park'
    }
  ];
  readonly #modal = inject(NzModalRef);
  readonly nzOrderData: Order = inject(NZ_MODAL_DATA);
  public user?: User;
  public OrderTypes = OrderTypes;

  public openedPrintingWindow = false;

  @HostListener('window:afterprint')
  onAfterPrint() {
    this.openedPrintingWindow = false;
  }

  constructor(
    private localStorageService: LocalStroageService
  ) {
    this.user = this.localStorageService.getUserData();
  }

  ngOnInit(): void {
    console.log('nzModalData', this.nzOrderData);
  }

  public print(): void {
    console.log('print');
    this.openedPrintingWindow = true;

    setTimeout(() => {
      window.print();
    }, 300);
  }

  public close(): void {
    this.#modal.close();
  }

  destroyModal(): void {
    this.#modal.destroy({ data: 'this the result data' });
  }
}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { InputComponent } from '../../components';
import { CommonModule } from '@angular/common';
import { CityService, ClientService, CurrencyService, FilialService, LocalStroageService } from '../../services';
import { Client } from '../../models/client';
import { Subject, debounceTime, forkJoin, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { City, Currency, Filial, User } from '../../models';
import { OrderTypes } from '../../consts';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { Order, OrderDetails } from '../../models/order';
import { OrderService } from '../../services/order/order.service';
import { RouterModule } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CheckComponent } from '../check/check.component';


@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    NzButtonModule,
    NzInputModule,
    FormsModule,
    InputComponent,
    CommonModule,
    NzIconModule,
    NzSelectModule,
    NzSwitchModule,
    NzDropDownModule,
    RouterModule
  ],
  providers: [
    ClientService,
    CityService,
    FilialService,
    CurrencyService,
    OrderService,
    NzModalService
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderComponent implements OnInit, OnDestroy {
  public OrderTypes = OrderTypes;
  public currentUser?: User;

  public clients: Array<Client> = [];
  public cities: Array<City> = [];
  public filials: Array<Filial> = [];
  public currencies: Array<Currency> = [];

  public baseCurrency?: Currency;
  public eachangeAvailableCurrencies: Array<Currency> = [];
  public order: Order = {
    checkNumber: 0, // номер чека
    cityId: '', // город
    city: undefined, // город
    clientId: '', //Клиент
    client: {
      name: '',
      phone: ''
    }, //Клиент
    filialId: '', //офисы
    filial: undefined, //офисы
    userId: '', // кто ответственен
    user: undefined, // кто ответственен
    totalSom: 0,
    totalCurrencySum: [],
    details: [{
      number: 1,
      clientCurrencyId: '', //валюты
      clientCurrency: undefined, //валюты
      sum: 0,
      exchangeCurrencyId: '', //валюты
      exchangeCurrency: undefined, //валюты
      exchangeSum: 0,
      type: OrderTypes.BUY, // SELL - продажа, BUY - покупка
      selectedType: true,
      paid: true,
      rate: 0
    }]
  };

  public changedClientName = false;
  public openPrintingWindow = false;

  public nzFilterOption = (): boolean => true;

  public isLoading = false;
  public editLoading = false;
  public removeLoading = false;
  public saveLoading = false;
  public addNewClientLoading = false;

  private destroyed$ = new Subject();

  constructor(
    private messageService: NzMessageService,
    private clientService: ClientService,
    private cityService: CityService,
    private filialService: FilialService,
    private currencyService: CurrencyService,
    private localStorageService: LocalStroageService,
    private orderService: OrderService,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.currentUser = this.localStorageService.getUserData();
    if (this.currentUser && this.currentUser.id) {
      this.order.user = this.currentUser;
      this.order.userId = this.currentUser.id;
    }
  }

  ngOnInit(): void {
    this.getClients();
    this.getCities();
    this.getFilials();
    this.getCurrencies();
  }

  public async save(order: Order) {
    console.log('save', order);

    if (!order) {
      return;
    }

    this.saveLoading = true;
    const res = await this.checkValCurrencies(order);
    if (!res) {
      this.saveLoading = false;
      return;
    }

    order.clientId = order.client?._id || '';
    order.details = order.details.filter(x => x.clientCurrencyId && x.exchangeCurrencyId);
    console.log('save2', order);
    // await this.setExchangeCurrenciesVal(order);

    this.orderService.add(order).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: async (res) => {
        console.log('res2', res);
        this.saveLoading = false;
        this.messageService.success('Заказ успешно создано!');
        this.order._id = res._id;
        this.order.checkNumber = res.checkNumber;
        this.order.createdAt = res.createdAt;
        await this.saveCurrenciesVal(order);
        this.getCurrencies();
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
        this.saveLoading = false;
        this._changeDetectorRef.detectChanges();
      }
    })
  }

  private checkValCurrencies(order: Order) {
    return new Promise((resolve) => {
      for(let i=0; i<order.totalCurrencySum.length; i++) {
        const realExchangeCurrency = this.currencies.find(x => x._id === order.totalCurrencySum[i].exchangeCurrency?._id);
        if (realExchangeCurrency) {
          let exchangeCurrencyResVal = +(realExchangeCurrency?.currentValue || 0) - (+order.totalCurrencySum[i].exchangeSum);
          console.log('exchangeCurrencyResVal', exchangeCurrencyResVal);
          if (!exchangeCurrencyResVal || exchangeCurrencyResVal < 0) {
            this.messageService.error('На кассе не хватает валюты ' + realExchangeCurrency?.name + ', сейчас на кассе: ' + (realExchangeCurrency?.currentValue || '0') + ' ' + realExchangeCurrency?.name);
            return resolve(false);
          }
        }
      }
      resolve(true);
    });
  }

  private setExchangeCurrenciesVal(order: Order) {
    console.log('setExchangeCurrenciesVal', order);
    return new Promise((resolve) => {
      order.totalCurrencySum.forEach((total) => {
        const realExchangeCurrency = this.currencies.find(x => x._id === total.exchangeCurrency?._id);
        const realCurrency = this.currencies.find(x => x._id === total.currency?._id);

        if (realExchangeCurrency) {
          realExchangeCurrency.currentValue = +(realExchangeCurrency?.currentValue || 0) - (+total.exchangeSum);
        }

        if (realCurrency) {
          realCurrency.currentValue = +(realCurrency?.currentValue || 0) + (+total.sum);
        }

        resolve(true);
      });
    });
  }

  private saveCurrenciesVal(order: Order) {
    console.log('saveCurrenciesVal', this.currencies);
    return new Promise((resolve) => {
      const currencies: any = [];
      order.totalCurrencySum.forEach((total) => {
        const realExchangeCurrency = this.currencies.find(x => x._id === total.exchangeCurrency?._id);
        const realCurrency = this.currencies.find(x => x._id === total.currency?._id);

        if(realExchangeCurrency) {
          currencies.push(this.currencyService.edit(realExchangeCurrency));
        }

        if (realCurrency) {
          currencies.push(this.currencyService.edit(realCurrency));
        }
      });

      forkJoin(currencies).subscribe((res) => {
        console.log('res', res);
        resolve(true);
      });
    });
  }

  public reset(): void {
    console.log("reset");
    this.order = {
      checkNumber: 0, // номер чека
      cityId: this.cities[0]._id, // город
      city: this.cities[0], // город
      clientId: '', //Клиент
      client: {
        name: '',
        phone: ''
      }, //Клиент
      filialId: this.filials[0]._id, //офисы
      filial: this.filials[0], //офисы
      userId: this.currentUser?.id || '', // кто ответственен
      user: this.currentUser, // кто ответственен
      totalSom: 0,
      totalCurrencySum: [],
      details: [{
        number: 1,
        clientCurrencyId: this.currencies[0]._id || '', //валюты
        clientCurrency: this.currencies[0], //валюты
        sum: 0,
        exchangeCurrencyId: '', //валюты
        exchangeCurrency: undefined, //валюты
        exchangeSum: 0,
        type: OrderTypes.BUY, // SELL - продажа, BUY - покупка
        selectedType: true,
        paid: true,
        rate: 0
      }]
    };

    if (this.currentUser && this.currentUser.id) {
      this.order.user = this.currentUser;
      this.order.userId = this.currentUser.id;
    }
  }

  public changeClientName(value: string): void {
    console.log('changeClientName', value);
    this.order.client.name = value;
    this.changedClientName = true;
    this._changeDetectorRef.detectChanges();
  }

  public changeClientPhone(value: string): void {
    console.log('changeClientPhone', value);
    this.order.client.phone = value;
    this.changedClientName = true;
    this._changeDetectorRef.detectChanges();
  }

  public addNewClient(order: Order): void {
    console.log("addNewClient", order);
    if (!order?.client || !order?.client?.name) {
      this.messageService.error('Заполните поля клиента!');
      return;
    }
    this.addNewClientLoading = true;

    this.clientService.add(order.client).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        console.log('res', res);
        this.order.client = res;
        this.order.clientId = res._id || '';
        this.changedClientName = false;
        this.addNewClientLoading = false;
        console.log('changedClientName', this.changedClientName);
        this.messageService.success('Успешно создан!');
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.addNewClientLoading = false;
        this.messageService.error(err?.error?.msg);
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  public searchCities(val: string): void {
    console.log('searchCities', val);
  }

  public searchFilials(val: string): void {
    console.log('searchFilials', val);
  }

  public searchClients(text: string): void {
    console.log('searchClients', text);
    this.changedClientName = false;
    this.order.client = {
      name: '',
      phone: ''
    };
    if (!text) {
      return;
    }

    this.clientService.getAll(text).pipe(
      debounceTime(500),
      takeUntil(this.destroyed$)
    ).subscribe((res) => {
      console.log('res', res);
      this.order.client = res.docs[0];
      if (!this.order.client) {
        this.changedClientName = true;
      }
      this._changeDetectorRef.detectChanges();
    });
  }

  private getFilials(): void {
    this.filialService.getAll().pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.filials = res.docs;
        this.order.filialId = this.filials[0]._id;
        this.order.filial = this.filials[0];
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
      }
    });
  }

  public getClients(): void {
    this.clientService.getAll().pipe(
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

  public getCities(): void {
    this.cityService.getAll().pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.cities = res.docs;
        this.order.cityId = this.cities[0]._id;
        this.order.city = this.cities[0];
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
      }
    });
  }

  public getCurrencies(): void {
    this.currencyService.getAll().pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        this.currencies = res.docs;
        this.order.details[0].clientCurrencyId = this.currencies[0]._id || '';
        this.baseCurrency = this.currencies.find(x => x.isBase);
        this.changeSelectedClientCurrencyId(this.order.details[0], 0);
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.messageService.error(err?.error?.msg);
      }
    });
  }

  public resetOrderDetail(orderDetail: OrderDetails): void {
    orderDetail = {
      number: 1,
      clientCurrencyId: '', //валюты
      clientCurrency: undefined, //валюты
      sum: 0,
      exchangeCurrencyId: '', //валюты
      exchangeCurrency: undefined, //валюты
      exchangeSum: 0,
      type: OrderTypes.BUY, // SELL - продажа, BUY - покупка
      selectedType: true,
      paid: true,
      rate: 0
    };
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

  public changeSelectedClientCurrencyId(orderDetail: OrderDetails, index: number): void {
    orderDetail.exchangeCurrencyId = '';
    orderDetail.exchangeCurrency = undefined;
    orderDetail.exchangeSum = 0;
    orderDetail.sum = 0;
    orderDetail.clientCurrency = this.currencies.find(x => x._id === orderDetail.clientCurrencyId);

    if (orderDetail.clientCurrency?.isBase) {
      this.eachangeAvailableCurrencies = this.currencies.filter(x => x._id !== orderDetail.clientCurrencyId);
      this.calcExchangeSum(orderDetail, index);
      return;
    }

    if (this.baseCurrency) {
      this.eachangeAvailableCurrencies = [this.baseCurrency];
      orderDetail.exchangeCurrencyId = this.baseCurrency._id;
      orderDetail.exchangeCurrency = this.baseCurrency;
      this.calcExchangeSum(orderDetail, index);
    }
    console.log('changeselectedClientCurrencyId', orderDetail);
  }

  public changeSelectedExchangeCurrencyId(orderDetail: OrderDetails, index: number): void {
    orderDetail.exchangeCurrency = this.currencies.find(x => x._id === orderDetail.exchangeCurrencyId);
    this.calcExchangeSum(orderDetail, index);
    console.log('changeSelectedExchangeCurrencyId', orderDetail);
  }

  public calcExchangeSum(orderDetail: OrderDetails, index: number): void {
    if (!orderDetail.exchangeCurrency || !orderDetail.clientCurrency) {
      return;
    }

    console.log('calcExchangeSum', orderDetail.exchangeCurrency, orderDetail.exchangeCurrency);

    const clientExchangeRate = orderDetail.selectedType ? orderDetail.clientCurrency?.buyValue || 0 : orderDetail.clientCurrency?.sellValue || 0;
    const exchangeRate = orderDetail.selectedType ? orderDetail.exchangeCurrency?.buyValue || 0 : orderDetail.exchangeCurrency?.sellValue || 0;
    console.log('exchangeRate', exchangeRate);
    if (orderDetail.clientCurrency.isBase) {
      orderDetail.exchangeSum = +(orderDetail.sum / exchangeRate).toFixed(2);
      orderDetail.rate = exchangeRate;

      this.setTotalCurrencySum(orderDetail, index);
      return;
    }

    orderDetail.rate = clientExchangeRate;
    orderDetail.exchangeSum = +(orderDetail.sum * clientExchangeRate).toFixed(2);
    this.setTotalCurrencySum(orderDetail, index);
  }

  private setTotalCurrencySum(orderDetail: OrderDetails, index: number): void {
    if (!orderDetail.sum || !orderDetail.clientCurrency) {
      return;
    }

    console.log('setTotalCurrencySum', orderDetail);

    const findTotalCurrenciesSum = this.order.totalCurrencySum.find(x => x.currency._id === orderDetail.clientCurrency?._id && x.index !== index);
    const findTotalCurrenciesSumByIndex = this.order.totalCurrencySum.find(x => x.index === index);

    const findTotalExchangeCurrenciesSum = this.order.totalCurrencySum.find(x => x.exchangeCurrency?._id === orderDetail.exchangeCurrency?._id && x.index !== index);

    if (!findTotalCurrenciesSum && !findTotalCurrenciesSumByIndex && !findTotalExchangeCurrenciesSum) {
      this.order.totalCurrencySum.push({
        index: index,
        currency: orderDetail.clientCurrency,
        sum: orderDetail.sum,
        exchangeCurrency: orderDetail.exchangeCurrency,
        exchangeSum: orderDetail.exchangeSum
      });
      return;
    }

    if (findTotalCurrenciesSumByIndex) {
      findTotalCurrenciesSumByIndex.sum = orderDetail.sum;
      findTotalCurrenciesSumByIndex.exchangeSum = orderDetail.exchangeSum;
      return;
    }

    if (findTotalCurrenciesSum) {
      findTotalCurrenciesSum.sum = +findTotalCurrenciesSum.sum + +orderDetail.sum;
    }

    if (findTotalExchangeCurrenciesSum) {
      findTotalExchangeCurrenciesSum.exchangeSum = +findTotalExchangeCurrenciesSum.exchangeSum + +orderDetail.exchangeSum;
    }
  }

  public detailChangeSum(val: number, orderDetail: OrderDetails, index: number): void {
    console.log('detailChangeSum', val, this.order);
    orderDetail.sum = val;
    this.calcExchangeSum(orderDetail, index);
  }

  public addDetail(orderDetail: OrderDetails): void {
    orderDetail.type = orderDetail.selectedType ? OrderTypes.BUY : OrderTypes.SELL;
    const newOrderDetail = {
      number: orderDetail.number+1,
      clientCurrencyId: this.order.details[0].clientCurrencyId ? this.order.details[0].clientCurrencyId : '', //валюты
      clientCurrency: this.order.details[0].clientCurrency ? this.order.details[0].clientCurrency : undefined, //валюты
      sum: this.order.totalCurrencySum[0].sum,
      exchangeCurrencyId: this.order.totalCurrencySum[0].exchangeCurrency?._id, //валюты
      exchangeCurrency: this.order.totalCurrencySum[0].exchangeCurrency, //валюты
      exchangeSum: this.order.totalCurrencySum[0].exchangeSum,
      type: orderDetail.type, // SELL - продажа, BUY - покупка,
      selectedType: true,
      paid: true,
      rate: 0
    };
    this.order.details.push(newOrderDetail);
    this._changeDetectorRef.detectChanges();
    console.log('addDetail:', this.order);

    if (newOrderDetail.clientCurrency) {
      this.changeSelectedClientCurrencyId(newOrderDetail, this.order.details.length);
    }
  }

  public removeOrderDetail(orderDetail: OrderDetails): void {
    this.order.details = this.order.details.filter(x => x.number !== orderDetail.number);
    console.log('removeOrderDetail', this.order);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

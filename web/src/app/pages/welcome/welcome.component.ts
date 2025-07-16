import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CurrencyService, LocalStroageService, OrderService, StateService } from '../../services';
import { ChartData, CurrenciesStat, Currency, User } from '../../models';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import Chart from 'chart.js/auto';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NumSeparatorModule } from '../../pipes';

declare const document: any;

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule,
    NzStatisticModule,
    NzGridModule,
    NzCardModule,
    NzRadioModule,
    FormsModule,
    NzTableModule,
    NumSeparatorModule
  ],
  providers: [
    OrderService
  ],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WelcomeComponent implements OnInit, OnDestroy {
  public currentUser?: User;
  public currentDate = new Date();
  public currencies: Array<Currency> = [];
  public chartData?: ChartData;
  public typeChart = 'day';
  public loadChartData = false;
  public PagesAccess = this.stateService.pageAccess$.value;

  public currenciesStat?: CurrenciesStat;
  private destroyed$ = new Subject();

  constructor(
    private localStorageService: LocalStroageService,
    private orderService: OrderService,
    private currencyService: CurrencyService,
    private stateService: StateService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.currentUser = this.localStorageService.getUserData();
    this.getStatistics();
    this.getCurrencies();
    this.getChartData();
  }

  public selectChartType(val: string): void {
    console.log('selectChartType', val);
    this.getChartData();
  }

  private getChartData(): void {
    this.loadChartData = true;
    this.orderService.getChartData({
      type: this.typeChart
    }).pipe(
      takeUntil(this.destroyed$)
    ).subscribe((res) => {
      console.log('getChartData', res);
      this.chartData = res;
      this.loadChartData = false;
      this._changeDetectorRef.detectChanges();

      const ctx = document.getElementById('chart').getContext('2d');
      new Chart(ctx, {type: 'line',
        data: {
          datasets: [
            {
              label: "Заказы",
              data: res.data,
              // borderColor: "#beccdc",
              fill: false,
              borderColor: '#beccdc',
              tension: 0.3
            }
          ],
          labels: res.labels
        }
      });
    });
  }

  private getCurrencies(): void {
    this.currencyService.getAll().pipe(
      takeUntil(this.destroyed$)
    ).subscribe((res) => {
      this.currencies = res.docs;
      this._changeDetectorRef.detectChanges();
    });
  }

  private getStatistics(): void {
    console.log("getStatistics");
    let date =
      this.currentDate.getFullYear() +
      "." +
      Number(this.currentDate.getMonth() + 1) +
      "." +
      this.currentDate.getDate();
    this.orderService.getOrdersBuyDate(date).pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (res) => {
        console.log('res', res);
        this.currenciesStat = res;
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../base/base.service';
import { iShoppingList } from '../../models';

@Injectable({
  providedIn: 'root'
})

export class ShoppingListService extends BaseService {

  constructor(
    http: HttpClient
  ) {
    super(http)
  }

  public add(data: iShoppingList): Observable<iShoppingList> {
    return this.post('/shopping-list/add', data, undefined);
  }

  public remove(_id: string): Observable<iShoppingList> {
    return this.post('/shopping-list/remove', {_id}, undefined);
  }

  public getAll(searchText?: string): Observable<{
    docs: Array<iShoppingList>
  }> {
    return this.get('/shopping-list?text=' + (searchText || ''), undefined);
  }
}

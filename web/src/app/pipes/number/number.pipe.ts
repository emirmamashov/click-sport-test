import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'number'
})
export class NumberPipe implements PipeTransform {

  transform(value: number, length: number): unknown {
    if (!value) return;
    return value.toFixed(length);
  }
}

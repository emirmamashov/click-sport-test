import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "numseparator" })
export class NumSeparatorPipe implements PipeTransform {
  constructor() {}

  public transform(value: any): any {
    if (value !== undefined && value !== null) {
      value = Number(value) || 0;
      value = value.toFixed(3);
      return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    return "";
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {

  transform(value: string, firstOnly: boolean): unknown {
    if (!value || typeof value !== 'string') return;
    value = value.toLowerCase();
    var words = value.split(" ");
    var word;
    for (var i = 0; i < words.length; i++) {
        if (firstOnly && i > 0) break;
        word = words[i];
        words[i] = word.substring(0,1).toUpperCase()+word.substring(1);
    }
    return words.join(" ");
  }

}

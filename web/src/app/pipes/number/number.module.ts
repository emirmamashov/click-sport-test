import { NgModule } from '@angular/core';
import { NumberPipe } from './number.pipe';

@NgModule({
  declarations: [
    NumberPipe
  ],
  exports: [
    NumberPipe
  ]
})
export class NumberModule { }

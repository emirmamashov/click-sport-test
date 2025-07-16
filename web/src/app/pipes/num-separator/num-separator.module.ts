import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NumSeparatorPipe } from './num-separator.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [NumSeparatorPipe],
  exports: [NumSeparatorPipe]
})
export class NumSeparatorModule { }

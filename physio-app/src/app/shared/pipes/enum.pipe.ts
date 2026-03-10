import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumKey',
  standalone: true
})
export class EnumKeysPipe implements PipeTransform {
  transform(enumObj: any, value: number | string): string {
    return enumObj[value];
  }
}
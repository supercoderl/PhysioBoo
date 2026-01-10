import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../types/user';
import { USER } from '../data/dummy';

@Pipe({
    name: 'defaultUser',
    standalone: true
})
export class DefaultUserPipe implements PipeTransform {
    transform(value: User | null | undefined | ''): User {
        return value || USER;
    }
}
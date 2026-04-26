import { Pipe, PipeTransform } from '@angular/core';
import { USER_PROFILE } from '../data/dummy';
import { UserProfile } from '../types/core';

@Pipe({
    name: 'defaultUser',
    standalone: true
})
export class DefaultUserPipe implements PipeTransform {
    transform(value: UserProfile | null | undefined | ''): UserProfile {
        return value || USER_PROFILE;
    }
}
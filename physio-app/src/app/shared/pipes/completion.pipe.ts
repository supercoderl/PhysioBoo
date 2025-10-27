import { Pipe, PipeTransform } from "@angular/core";


@Pipe({ name: 'completionText', standalone: true })
export class CompletionTextPipe implements PipeTransform {
    /**
     * Return a number of completions
     * @param {number} count - Number of completions
     * @returns {string} Description string
    */
    transform(count: number): string {
        if (count === 0) return 'Never completed';
        if (count === 1) return 'Completed once';
        if (count === 2) return 'Completed twice';
        return `Completed ${count} times`;
    }
}
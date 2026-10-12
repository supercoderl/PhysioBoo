import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'colorByFileType', standalone: true })
export class ColorByFileTypePipe implements PipeTransform {
    transform(type: string): string {
        const colors: Record<string, string> = {
            pdf: '#e53935',        // red
            xls: '#43a047',    // green
            doc: '#E11D48',        // rose
            txt: '#757575',    // gray
            jpg: '#ffb300',      // orange
        };

        return colors[type.toLowerCase()] ?? '#A1A1AA'; // default: light gray
    }
}
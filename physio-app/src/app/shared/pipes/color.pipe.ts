import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'colorByFileType', standalone: true })
export class ColorByFileTypePipe implements PipeTransform {
    transform(type: string): string {
        const colors: Record<string, string> = {
            pdf: '#e53935',        // red
            xls: '#43a047',    // green
            doc: '#1e88e5',        // blue
            txt: '#757575',    // gray
            jpg: '#ffb300',      // orange
        };

        return colors[type.toLowerCase()] ?? '#9ca3af'; // default: light gray
    }
}
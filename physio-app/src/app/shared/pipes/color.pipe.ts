import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'colorByType', standalone: true })
export class ColorByTypePipe implements PipeTransform {
    transform(type: string): string {
        const colors: Record<string, string> = {
            web: '#3b82f6',        // blue
            android: '#16a34a',    // green
            ios: '#000000',        // black
            desktop: '#6b7280',    // gray
            cloud: '#0ea5e9',      // cyan
            database: '#f59e0b',   // yellow
            api: '#9333ea',        // purple
            ai: '#ef4444',         // red
            firebase: '#FFCA28'   // bright yellow
        };

        return colors[type.toLowerCase()] ?? '#9ca3af'; // default: light gray
    }
}

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
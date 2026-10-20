import { TestBed } from '@angular/core/testing';
import { BooIconComponent } from './icon.component';

describe('BooIconComponent', () => {
    function create(name: string) {
        const fixture = TestBed.createComponent(BooIconComponent);
        fixture.componentRef.setInput('name', name);
        fixture.detectChanges();
        return fixture;
    }

    it('renders an icon that already loaded without waiting for another task', async () => {
        TestBed.configureTestingModule({ imports: [BooIconComponent] });
        const first = create('search');
        await first.whenStable();
        // Let the fetch chain settle.
        await new Promise(r => setTimeout(r, 200));
        first.detectChanges();
        expect(first.nativeElement.querySelector('svg')).withContext('first instance loads').not.toBeNull();

        // A list that re-creates its rows on every check (an *ngFor over a getter) creates new instances each time:
        // they must have their markup immediately, or each one schedules another change detection.
        const second = create('search');
        expect(second.nativeElement.querySelector('svg')).not.toBeNull();
    });
});

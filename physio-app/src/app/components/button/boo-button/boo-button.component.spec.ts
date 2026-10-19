import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIcons } from '../../../icon.config';
import { SharedModule } from '../../../shared/shared-imports';
import { BooButtonComponent, BooButtonSize, BooButtonVariant } from './boo-button.component';

@Component({
    standalone: true,
    imports: [SharedModule, BooButtonComponent],
    template: `
        <div style="width: 120px">
            <button
                id="ds"
                boo-button
                class="extra-class"
                [variant]="variant"
                [size]="size"
                [disabled]="disabled"
                [loading]="loading"
                [iconOnly]="iconOnly"
                [block]="block"
                (click)="clicks = clicks + 1"
            >Request an appointment today</button>
        </div>
        <a id="link" boo-button variant="secondary" routerLink="/contact" [disabled]="disabled">Contact us</a>
        <button id="legacy" boo-button size="large">A rather long legacy button label</button>
    `,
})
class HostComponent {
    variant: BooButtonVariant | undefined = 'primary';
    size: BooButtonSize = 'md';
    disabled = false;
    loading = false;
    iconOnly = false;
    block = false;
    clicks = 0;
}

describe('BooButtonComponent', () => {
    function render() {
        TestBed.configureTestingModule({
            imports: [HostComponent],
            providers: [provideRouter([]), provideIcons()],
        });
        const fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        const el = (id: string) => fixture.nativeElement.querySelector('#' + id) as HTMLElement;
        return { fixture, host: fixture.componentInstance, el };
    }

    it('keeps the label on one line even when the container is narrower than the label', () => {
        const { el } = render();
        const btn = el('ds');
        expect(getComputedStyle(btn).whiteSpace).toBe('nowrap');
        // One line: the rendered height stays the md height instead of growing with a wrapped label.
        expect(btn.getBoundingClientRect().height).toBe(44);
    });

    it('uses one height per size', () => {
        const { fixture, host, el } = render();
        const heights: Record<string, number> = {};
        for (const size of ['sm', 'md', 'lg'] as BooButtonSize[]) {
            host.size = size;
            fixture.detectChanges();
            heights[size] = el('ds').getBoundingClientRect().height;
        }
        expect(heights).toEqual({ sm: 40, md: 44, lg: 52 });
    });

    it('accepts the original size names in the design-system style', () => {
        const { fixture, host, el } = render();
        host.size = 'large';
        fixture.detectChanges();
        expect(el('ds').getBoundingClientRect().height).toBe(52);
    });

    it('keeps classes written on the element next to its own', () => {
        const { el } = render();
        expect(el('ds').classList).toContain('extra-class');
        expect(el('ds').classList).toContain('bg-primary');
    });

    it('defaults to type="button" in the design-system style so it never submits a form by accident', () => {
        const { el } = render();
        expect(el('ds').getAttribute('type')).toBe('button');
    });

    it('keeps type="submit" as the default of the original style', () => {
        const { el } = render();
        expect(el('legacy').getAttribute('type')).toBe('submit');
    });

    it('does not set a type attribute on anchors', () => {
        const { el } = render();
        expect(el('link').hasAttribute('type')).toBeFalse();
        expect(el('link').getAttribute('href')).toBe('/contact');
    });

    it('applies each variant without the original gradient', () => {
        const { fixture, host, el } = render();
        const expected: Record<BooButtonVariant, string> = {
            primary: 'bg-primary', secondary: 'border-gray-300', outline: 'border-primary', soft: 'bg-primarySoft', subtle: 'bg-gray-100', ghost: 'bg-transparent', link: 'underline',
        };
        for (const variant of Object.keys(expected) as BooButtonVariant[]) {
            host.variant = variant;
            fixture.detectChanges();
            expect(el('ds').classList).withContext(variant).toContain(expected[variant]);
            expect(el('ds').style.background).withContext(variant).toBe('');
        }
    });

    it('disables the button and ignores clicks while disabled or loading', () => {
        const { fixture, host, el } = render();
        host.disabled = true;
        fixture.detectChanges();
        expect(el('ds').hasAttribute('disabled')).toBeTrue();
        el('ds').click();
        expect(host.clicks).toBe(0);

        host.disabled = false;
        host.loading = true;
        fixture.detectChanges();
        expect(el('ds').hasAttribute('disabled')).toBeTrue();
        expect(el('ds').getAttribute('aria-busy')).toBe('true');
        expect(el('ds').querySelector('physio-icon[name="loader-circle"]')).not.toBeNull();
    });

    it('marks a disabled anchor with aria-disabled and takes it out of the tab order', () => {
        const { fixture, host, el } = render();
        host.disabled = true;
        fixture.detectChanges();
        expect(el('link').getAttribute('aria-disabled')).toBe('true');
        expect(el('link').getAttribute('tabindex')).toBe('-1');
        expect(el('link').classList).toContain('pointer-events-none');
    });

    it('renders a square hit area when icon-only', () => {
        const { fixture, host, el } = render();
        host.iconOnly = true;
        fixture.detectChanges();
        const rect = el('ds').getBoundingClientRect();
        expect(rect.height).toBe(44);
        expect(el('ds').classList).toContain('w-11');
    });

    it('fills its container when block is set', () => {
        const { fixture, host, el } = render();
        host.block = true;
        fixture.detectChanges();
        expect(el('ds').classList).toContain('w-full');
    });

    it('gives the original style a minimum width instead of a fixed one, on one line', () => {
        const { el } = render();
        const btn = el('legacy');
        expect(btn.classList).toContain('min-w-44');
        expect(btn.classList).not.toContain('w-44');
        expect(getComputedStyle(btn).whiteSpace).toBe('nowrap');
    });
});

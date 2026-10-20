import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BooButtonComponent } from '../button/button.component';
import { BooEmptyStateComponent } from './empty-state.component';
import { BooErrorStateComponent } from './error-state.component';
import { BooInlineErrorComponent, BooInlineErrorState } from './inline-error.component';

@Component({
    standalone: true,
    imports: [BooErrorStateComponent, BooEmptyStateComponent, BooInlineErrorComponent, BooButtonComponent],
    template: `
        <boo-error-state id="err" appearance="panel" icon="cloud-off" title="We couldn't load doctors" description="Try again." retryLabel="Try again" (retry)="retries = retries + 1">
            <a id="extra" boo-button variant="secondary" routerLink="/contact">Contact us</a>
        </boo-error-state>
        <boo-empty-state id="empty" appearance="panel" [headingLevel]="3" icon="search-x" title="No doctors match" description="Remove a filter.">
            <button id="clear" boo-button variant="primary">Clear all filters</button>
        </boo-empty-state>
        <boo-error-state id="admin" title="Failed" />
        <boo-inline-error id="inline" what="clinics" [state]="inlineState" (retry)="inlineRetries = inlineRetries + 1" />
    `,
})
class HostComponent {
    retries = 0;
    inlineRetries = 0;
    inlineState: BooInlineErrorState = 'default';
}

describe('State panels (error, empty, inline error)', () => {
    function render() {
        TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideRouter([])] });
        const fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        const q = (sel: string) => fixture.nativeElement.querySelector(sel) as HTMLElement;
        return { fixture, host: fixture.componentInstance, q };
    }

    it('renders the error panel as an alert with a heading, Try again and the projected actions', () => {
        const { host, q } = render();
        expect(q('#err [role="alert"]')).not.toBeNull();
        const heading = q('#err [role="heading"]');
        expect(heading.textContent).toContain("We couldn't load doctors");
        expect(heading.getAttribute('aria-level')).toBe('2');
        const retry = q('#err button[boo-button]');
        expect(retry.textContent).toContain('Try again');
        retry.click();
        expect(host.retries).toBe(1);
        expect(q('#err #extra')).not.toBeNull();
    });

    it('renders the empty panel with its heading level and projected actions, and no retry', () => {
        const { q } = render();
        expect(q('#empty [role="heading"]').getAttribute('aria-level')).toBe('3');
        expect(q('#empty #clear')).not.toBeNull();
        expect(q('#empty [role="alert"]')).toBeNull();
    });

    it('keeps the compact default appearance for existing callers', () => {
        const { q } = render();
        expect(q('#admin [role="alert"]')).toBeNull();
        expect(q('#admin').textContent).toContain('Failed');
        expect(q('#admin').textContent).toContain('Retry');
    });

    it('disables the inline error retry while retrying, and keeps its label on one line', () => {
        const { fixture, host, q } = render();
        const btn = () => q('#inline button') as HTMLButtonElement;
        expect(getComputedStyle(btn()).whiteSpace).toBe('nowrap');
        btn().click();
        expect(host.inlineRetries).toBe(1);

        host.inlineState = 'retrying';
        fixture.detectChanges();
        expect(btn().disabled).toBeTrue();
        expect(btn().textContent).toContain('Trying again');
        expect(q('#inline [role="status"]')).not.toBeNull();
    });
});

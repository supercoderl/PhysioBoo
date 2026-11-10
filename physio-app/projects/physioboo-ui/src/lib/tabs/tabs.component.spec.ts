import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BooSegmentedComponent } from './segmented.component';
import { BooTabsComponent, BooTab } from './tabs.component';
import { nextEnabledIndex } from './roving';

@Component({
  standalone: true,
  imports: [BooTabsComponent, BooSegmentedComponent],
  template: `
    <boo-tabs id="t" [tabs]="tabs" [value]="active" label="Sections" (valueChange)="active = $event" />
    <boo-segmented id="s" [options]="tabs" [value]="active" label="View" (valueChange)="active = $event" />
  `,
})
class HostComponent {
  tabs: BooTab[] = [
    { value: 'a', label: 'Alpha', count: 3 },
    { value: 'b', label: 'Beta', disabled: true },
    { value: 'c', label: 'Gamma' },
  ];
  active = 'a';
}

describe('boo-tabs and boo-segmented', () => {
  function render() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const q = (sel: string) => Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll(sel));
    return { fixture, host: fixture.componentInstance, q };
  }

  it('exposes tablist semantics with roving tabindex', () => {
    const { q } = render();
    const tabs = q('#t [role="tab"]');
    expect(q('#t [role="tablist"]').length).toBe(1);
    expect(tabs.map(t => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    expect(tabs.map(t => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
    expect(tabs[0].id).toBe('tab-a');
    expect(tabs[0].getAttribute('aria-controls')).toBe('panel-a');
    expect(tabs[0].textContent).toContain('3');
  });

  it('does not select a disabled tab', () => {
    const { fixture, host, q } = render();
    const beta = q('#t [role="tab"]')[1] as HTMLButtonElement;
    expect(beta.disabled).toBeTrue();
    beta.click();
    fixture.detectChanges();
    expect(host.active).toBe('a');
  });

  it('moves with the arrow keys, skipping disabled tabs, and wraps', () => {
    const { fixture, host, q } = render();
    const press = (key: string) => { (q('#t [role="tab"]').find(t => t.getAttribute('tabindex') === '0') as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })); fixture.detectChanges(); };
    press('ArrowRight');
    expect(host.active).toBe('c');
    expect(document.activeElement?.id).toBe('tab-c');
    press('ArrowRight');
    expect(host.active).toBe('a');
    press('End');
    expect(host.active).toBe('c');
    press('Home');
    expect(host.active).toBe('a');
  });

  it('segmented control is a radiogroup that tracks the value', () => {
    const { fixture, host, q } = render();
    const radios = q('#s [role="radio"]');
    expect(q('#s [role="radiogroup"]').length).toBe(1);
    expect(radios.map(r => r.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false']);
    radios[2].click();
    fixture.detectChanges();
    expect(host.active).toBe('c');
    expect(q('#s [role="radio"]').map(r => r.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true']);
  });

  it('keeps the strip reachable by keyboard when the value matches no option', () => {
    const { fixture, host, q } = render();
    host.active = 'custom';
    fixture.detectChanges();
    expect(q('#s [role="radio"]').map(r => r.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
    expect(q('#t [role="tab"]').map(r => r.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
  });

  it('nextEnabledIndex ignores non-navigation keys and all-disabled lists', () => {
    expect(nextEnabledIndex([{ value: 'x', label: 'X' }], 0, 'a')).toBeNull();
    expect(nextEnabledIndex([{ value: 'x', label: 'X', disabled: true }], 0, 'ArrowRight')).toBeNull();
    expect(nextEnabledIndex([], 0, 'ArrowRight')).toBeNull();
  });
});

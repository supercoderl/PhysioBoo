import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BooDialogComponent, BooDialogTone } from './dialog.component';

@Component({
  standalone: true,
  imports: [NgIf, BooDialogComponent],
  template: `
    <button id="opener" (click)="open = true">Open</button>
    <boo-dialog *ngIf="open" heading="Delete item" description="This cannot be undone." [tone]="tone" [busy]="busy" [alert]="alert" (dismiss)="dismissed = dismissed + 1; open = false">
      <input id="field" />
      <button boo-dialog-footer id="cancel">Cancel</button>
      <button boo-dialog-footer id="confirm">Delete</button>
    </boo-dialog>
  `,
})
class HostComponent {
  open = true;
  busy = false;
  alert = false;
  tone: BooDialogTone = 'danger';
  dismissed = 0;
}

describe('BooDialogComponent', () => {
  const tick = () => new Promise(r => setTimeout(r, 20));
  async function render() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await tick();
    return { fixture, host: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }
  const key = (name: string, init: KeyboardEventInit = {}) => document.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, ...init }));

  it('is a labelled modal dialog and locks page scroll', async () => {
    const { el } = await render();
    const dialog = el.querySelector('[aria-modal="true"]')!;
    expect(dialog.getAttribute('role')).toBe('dialog');
    const heading = el.querySelector('h2')!;
    expect(dialog.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('uses alertdialog semantics on request', async () => {
    const { fixture, el, host } = await render();
    host.alert = true;
    fixture.detectChanges();
    expect(el.querySelector('[aria-modal="true"]')!.getAttribute('role')).toBe('alertdialog');
  });

  it('moves focus into the dialog and returns it on close', async () => {
    const { fixture, host, el } = await render();
    (el.querySelector('#opener') as HTMLElement).focus();
    host.open = false; fixture.detectChanges();
    host.open = true; fixture.detectChanges();
    await tick();
    expect(document.activeElement?.id).toBe('field');
    host.open = false; fixture.detectChanges();
    await tick();
    expect(document.activeElement?.id).toBe('opener');
    expect(document.body.style.overflow).toBe('');
  });

  it('dismisses on Escape, the close button and the backdrop', async () => {
    const { fixture, host, el } = await render();
    key('Escape'); fixture.detectChanges();
    expect(host.dismissed).toBe(1);
    host.open = true; fixture.detectChanges(); await tick();
    (el.querySelector('button[aria-label="Close"]') as HTMLElement).click(); fixture.detectChanges();
    expect(host.dismissed).toBe(2);
    host.open = true; fixture.detectChanges(); await tick();
    el.querySelector('boo-dialog')!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); fixture.detectChanges();
    expect(host.dismissed).toBe(3);
  });

  it('cannot be dismissed while busy', async () => {
    const { fixture, host, el } = await render();
    host.busy = true; fixture.detectChanges();
    key('Escape'); fixture.detectChanges();
    expect(host.dismissed).toBe(0);
    expect((el.querySelector('button[aria-label="Close"]') as HTMLButtonElement).disabled).toBeTrue();
    expect(el.querySelector('[aria-modal="true"]')!.getAttribute('aria-busy')).toBe('true');
  });

  it('keeps Tab inside the dialog', async () => {
    const { el } = await render();
    const last = el.querySelector('#confirm') as HTMLElement;
    last.focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    last.dispatchEvent(event);
    expect(event.defaultPrevented).toBeTrue();
    expect(document.activeElement).not.toBe(last);
  });
});

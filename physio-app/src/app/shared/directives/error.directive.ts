import {
    Directive,
    DoCheck,
    ElementRef,
    Input,
    OnInit,
    Renderer2
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[booError]',
    standalone: true
})
export class BooErrorDirective implements OnInit, DoCheck {
    @Input('booErrorMsg') customMessages: Record<string, string> = {};
    private errorElement: HTMLElement;

    private lastShowStatus: boolean = false;
    private lastMessage: string = '';

    private defaultMessages: any = {
        required: 'This field is required.',
        minlength: (e: any) => `Minimum ${e.requiredLength} characters.`,
        maxlength: (e: any) => `Maximum ${e.requiredLength} characters.`,
        email: 'Email is invalid.',
        pattern: 'Pattern is invalid.',
        passwordMismatch: 'Password confirm does not correct.',
    };

    constructor(
        private control: NgControl,
        private el: ElementRef,
        private renderer: Renderer2
    ) {
        this.errorElement = this.renderer.createElement('div');
    }

    ngOnInit() {
        const parent = this.el.nativeElement.parentNode;

        // Set up error container
        this.renderer.addClass(this.errorElement, 'text-red-500');
        this.renderer.addClass(this.errorElement, 'text-xs');
        this.renderer.addClass(this.errorElement, 'mt-1');
        this.renderer.setStyle(this.errorElement, 'display', 'none');
        this.renderer.appendChild(parent, this.errorElement);
    }

    ngDoCheck() {
        this.update();
    }

    private update() {
        const ctrl = this.control.control;
        if (!ctrl) return;

        const shouldShow = !!(ctrl.invalid && (ctrl.touched || ctrl.dirty));

        let message = '';
        if (shouldShow && ctrl.errors) {
            const firstKey = Object.keys(ctrl.errors)[0];
            message = this.resolveMessage(firstKey, ctrl.errors[firstKey]);
        }

        if (this.lastShowStatus !== shouldShow || (shouldShow && this.lastMessage !== message)) {
            if (shouldShow) {
                this.errorElement.innerText = message;
                this.renderer.setStyle(this.errorElement, 'display', 'block');
            } else {
                this.renderer.setStyle(this.errorElement, 'display', 'none');
            }

            this.lastShowStatus = shouldShow;
            this.lastMessage = message;
        }
    }

    private resolveMessage(key: string, errorData: any): string {
        if (this.customMessages[key]) return this.customMessages[key];
        const msg = this.defaultMessages[key];
        if (!msg) return 'Giá trị không hợp lệ.';
        return typeof msg === 'function' ? msg(errorData) : msg;
    }
}

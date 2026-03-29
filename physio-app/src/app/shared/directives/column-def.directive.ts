import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: '[appColumnDef]',
    standalone: true
})
export class ColumnDefDirective {
    // #region Inputs, Outputs, Properties
    @Input('appColumnDef') name!: string;
    @Input() headerLabel: string = '';

    @Input() type: 'text' | 'checkbox' | 'image' | 'actions' = 'text';
    @Input() sortable: boolean = false;
    @Input() draggable: boolean = false;
    @Input() hasActions: boolean = false;

    @Input() headerClass: string = '';
    @Input() cellClass: string = '';
    @Input() width: string | number = 'auto';
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(public template: TemplateRef<any>) { }
    // #endregion
}
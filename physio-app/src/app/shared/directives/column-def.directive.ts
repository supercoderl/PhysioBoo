import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: '[appColumnDef]',
    standalone: true
})
export class ColumnDefDirective {
    // #region Inputs, Outputs, Properties
    @Input('appColumnDef') name!: string;
    @Input() headerLabel: string = '';
    @Input() headerClass: string = '';
    @Input() cellClass: string = '';
    @Input() width?: number = 40;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(public template: TemplateRef<any>) { }
    // #endregion
}
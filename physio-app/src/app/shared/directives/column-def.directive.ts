import { Directive, Input, TemplateRef, booleanAttribute } from '@angular/core';

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
    /** False keeps the column out of the table's column chooser (e.g. the row's name). Selection and unlabelled action columns never appear there. */
    @Input({ transform: booleanAttribute }) hideable: boolean = true;
    /** The column starts hidden; users can show it from the table's column chooser. */
    @Input({ transform: booleanAttribute }) defaultHidden: boolean = false;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(public template: TemplateRef<any>) { }
    // #endregion
}
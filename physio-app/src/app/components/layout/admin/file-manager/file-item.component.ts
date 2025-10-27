import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";

@Component({
    selector: 'file-item',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <div
            class="shadow-xs p-2 border border-solid rounded-[12px] w-28 h-28 relative border-[#E5E7EB]"
        >
            <button
                class="w-4 min-h-4 h-4 m-1.5 z-20 right-0 top-0 absolute inlineFlex-center-center bg-transparent align-middle text-center text-[22px] text-[#4B5563] max-h-8 outline-none p-2 rounded-[8px]"
                [style.transition]="'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)'"
                tabindex="0"
                type="button"
                *ngIf="fileInfo.isFolder"
            >
                <lucide-icon name="info" class="w-4 h-4"></lucide-icon>
            </button>
            <a
                role="button"
                class="flex h-full w-full flex-col items-center justify-center gap-0.5"
                href="/apps/file-manager/cd6897cb-acfd-4016-8b53-3f66a5b5fc68"
                data-discover="true"
            >
            <div class="relative">
                <lucide-icon [name]="fileInfo.isFolder ? 'folder' : 'file-text'" class="w-10 h-10 stroke-[#BFC4CC]"></lucide-icon>
                  <div
                    class="absolute bottom-0 left-0 rounded-[4px] px-1 text-xs leading-normal font-semibold text-white"
                    [style.background-color]="fileInfo.type | colorByFileType"
                    *ngIf="fileInfo.type"
                  >
                    {{fileInfo.type}}
                  </div>
                </div>
                <div class="flex shrink flex-col items-center">
                    <p
                      class="font-medium text-[12px] truncate m-0 leading-[1.5] text-[#1F232B]"
                    >
                      {{fileInfo.name}}
                    </p>
                    <p
                      class="font-medium text-[9px] truncate m-0 leading-[1.3] text-[#4B5563]"
                    >
                      {{totalFiles}}
                    </p>
                </div>
            </a>
        </div>
    `
})

export class FileItemComponent {
    @Input() fileInfo?: any;

    get totalFiles() {
        if (!this.fileInfo.totalFiles) return '';
        return `${this.fileInfo.totalFiles} ${this.fileInfo.totalFiles > 1 ? 'files' : 'file'}`;
    }
}
import { Component, OnInit, signal } from "@angular/core";
import { forkJoin } from "rxjs";
import { HospitalGroupService } from "../../../../services/admin/hospital-group.service";
import { HospitalService } from "../../../../services/admin/hospital.service";
import { UserService } from "../../../../services/admin/user.service";
import { RoleService } from "../../../../services/admin/role.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";

interface StatCard {
    label: string;
    value: number | null;
    icon: string;
    iconBg: string;
    iconColor: string;
    route: string;
}

@Component({
    selector: 'superadmin-dashboard',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
        <div class="space-y-6">

            <!-- Page header -->
            <div>
                <h2 class="text-xl font-bold text-primary mb-0.5">Platform Overview</h2>
                <p class="text-sm text-secondary m-0">Real-time metrics across all tenants</p>
            </div>

            <!-- Stats grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div *ngFor="let card of statCards()"
                    class="bg-surface rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                    [routerLink]="card.route"
                >
                    <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        [ngClass]="card.iconBg">
                        <boo-icon [name]="card.icon" [size]="20" [class]="card.iconColor"></boo-icon>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-primary leading-none">
                            <span *ngIf="card.value !== null">{{ card.value | number }}</span>
                            <span *ngIf="card.value === null" class="inline-block w-12 h-6 rounded bg-gray-200 animate-pulse"></span>
                        </div>
                        <div class="text-xs text-secondary mt-1">{{ card.label }}</div>
                    </div>
                </div>
            </div>

            <!-- Quick links -->
            <div class="bg-surface rounded-xl border border-gray-200 p-5">
                <h3 class="text-sm font-bold text-primary mb-4">Quick Actions</h3>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <a routerLink="/superadmin/tenants/hospital-group"
                        class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                        <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <boo-icon name="layers" [size]="15" class="text-primary"></boo-icon>
                        </div>
                        <div>
                            <div class="text-xs font-semibold text-primary">Manage Tenants</div>
                            <div class="text-[11px] text-secondary">Hospital groups & hospitals</div>
                        </div>
                        <boo-icon name="chevron-right" [size]="13" class="text-gray-300 group-hover:text-primary ml-auto transition-colors"></boo-icon>
                    </a>
                    <a routerLink="/superadmin/users"
                        class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                        <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <boo-icon name="users-round" [size]="15" class="text-blue-600"></boo-icon>
                        </div>
                        <div>
                            <div class="text-xs font-semibold text-primary">Manage Users</div>
                            <div class="text-[11px] text-secondary">All platform users</div>
                        </div>
                        <boo-icon name="chevron-right" [size]="13" class="text-gray-300 group-hover:text-primary ml-auto transition-colors"></boo-icon>
                    </a>
                    <a routerLink="/superadmin/roles"
                        class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                        <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                            <boo-icon name="shield-check" [size]="15" class="text-purple-600"></boo-icon>
                        </div>
                        <div>
                            <div class="text-xs font-semibold text-primary">Access Control</div>
                            <div class="text-[11px] text-secondary">Roles & permissions</div>
                        </div>
                        <boo-icon name="chevron-right" [size]="13" class="text-gray-300 group-hover:text-primary ml-auto transition-colors"></boo-icon>
                    </a>
                </div>
            </div>
        </div>
    `
})
export class SuperadminDashboardComponent implements OnInit {
    statCards = signal<StatCard[]>([
        { label: 'Hospital Groups', value: null, icon: 'layers', iconBg: 'bg-primary/10', iconColor: 'text-primary', route: '/superadmin/tenants/hospital-group' },
        { label: 'Hospitals', value: null, icon: 'hospital', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', route: '/superadmin/tenants/hospital' },
        { label: 'Users', value: null, icon: 'users-round', iconBg: 'bg-green-50', iconColor: 'text-green-600', route: '/superadmin/users' },
        { label: 'Roles', value: null, icon: 'shield-check', iconBg: 'bg-purple-50', iconColor: 'text-purple-600', route: '/superadmin/roles' },
    ]);

    constructor(
        private hospitalGroupSrv: HospitalGroupService,
        private hospitalSrv: HospitalService,
        private userSrv: UserService,
        private roleSrv: RoleService
    ) { }

    ngOnInit() {
        const baseRequest = { pageNumber: 1, pageSize: 1, search: '', sort: 'createdAt:desc', filter: { start: '', end: '' } };

        forkJoin({
            groups: this.hospitalGroupSrv.search({ ...baseRequest, filter: { start: '', end: '', isActive: null, subscriptionPlan: null } }),
            hospitals: this.hospitalSrv.search({ ...baseRequest, filter: { start: '', end: '', hospitalGroupId: null, type: null, isActive: null, hasEmergencyServices: null } }),
            users: this.userSrv.search({ ...baseRequest, filter: { start: '', end: '', isActive: null } }),
            roles: this.roleSrv.search({ ...baseRequest, filter: { start: '', end: '', isActive: null, isSystemRole: null } })
        }).subscribe(({ groups, hospitals, users, roles }) => {
            this.statCards.update(cards => cards.map((c, i) => ({
                ...c,
                value: [
                    groups.success ? groups.data?.totalCount ?? 0 : 0,
                    hospitals.success ? hospitals.data?.totalCount ?? 0 : 0,
                    users.success ? users.data?.totalCount ?? 0 : 0,
                    roles.success ? roles.data?.totalCount ?? 0 : 0,
                ][i]
            })));
        });
    }
}

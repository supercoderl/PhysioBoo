import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { BooButtonComponent, BooEmptyStateComponent, BooInputComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { concat, finalize, map, of, switchMap, toArray } from 'rxjs';
import { DrawerComponent } from '../../../../../components/drawer/drawer.component';
import { CommonCategoryDrawerShellComponent } from '../../../../../components/layout/admin/system/common-category/shared/category-drawer-shell.component';
import { CommonCategoryPageComponent } from '../../../../../components/layout/admin/system/common-category/shared/category-page.component';
import { EMPTY_CELL } from '../../../../../components/layout/admin/system/common-category/shared/category-table-card.base';
import { BooSelectComponent } from '../../../../../components/select/boo-select/boo-select.component';
import { BooActionAdminComponent } from '../../../../../components/table/boo-table-admin/boo-action-admin.component';
import { BooTableAdminComponent } from '../../../../../components/table/boo-table-admin/boo-table-admin.component';
import { InviteService } from '../../../../../services/admin/invite.service';
import { RoleService } from '../../../../../services/admin/role.service';
import { UserService } from '../../../../../services/admin/user.service';
import { AuthService } from '../../../../../services/auth/auth.service';
import { DialogService } from '../../../../../services/common/dialog.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { Permissions } from '../../../../../shared/constants/permission.constant';
import { ColumnDefDirective } from '../../../../../shared/directives/column-def.directive';
import { SharedModule } from '../../../../../shared/shared-imports';
import { ActionItem } from '../../../../../shared/types/common';
import { User } from '../../../../../shared/types/core.types';
import { FilterConfig } from '../../../../../shared/types/filter.types';
import { TenantInvite } from '../../../../../shared/types/invite.types';
import { Role } from '../../../../../shared/types/role.types';
import { SortOption } from '../../../../../shared/types/sort';
import { CommonCategoryListBase } from '../../common-category/common-category-list.base';

// Invites carry a built-in role code (backend Role enum, SUPER_ADMIN excluded); custom roles are assigned after sign-up.
const INVITABLE_ROLE_CODES = [
  'ADMIN', 'NURSE', 'PHAMACIST', 'CASHIER', 'LAB_TECHNICIAN', 'RADIOLOGIST',
  'RECEPTIONIST', 'ACCOUNTANT', 'INVENTORY_MANAGER', 'IT_SUPPORT', 'DOCTOR',
];

/** GetAllUsersQueryHandler sorts by email or creation date only. */
const TEAM_SORT_OPTIONS: SortOption[] = [
  { label: 'Recently added', value: '-createdAt' },
  { label: 'Oldest first', value: '+createdAt' },
  { label: 'Email (A-Z)', value: '+email' },
  { label: 'Email (Z-A)', value: '-email' },
];

const TEAM_FILTERS: FilterConfig[] = [
  { key: 'isActive', label: 'Status', type: 'boolean', trueLabel: 'Active', falseLabel: 'Inactive' },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Settings > Team: the clinic's members (POST /api/users/search, server-side search by email, status filter, paging
 * sized to the screen), their roles (POST/DELETE /api/users/{id}/roles/{roleId}), account deletion
 * (DELETE /api/users/{id}, a soft delete) and invitations (/api/invites). Every action follows the caller's permissions.
 */
@Component({
  selector: 'setting-team',
  standalone: true,
  imports: [
    SharedModule,
    CommonCategoryPageComponent,
    CommonCategoryDrawerShellComponent,
    DrawerComponent,
    BooTableAdminComponent,
    BooActionAdminComponent,
    ColumnDefDirective,
    BooSelectComponent,
    BooInputComponent,
    BooStatusBadgeComponent,
    BooEmptyStateComponent,
    BooButtonComponent
  ],
  templateUrl: './team.component.html',
  host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' }
})
export class TeamComponent extends CommonCategoryListBase<User> implements OnInit {
  private readonly userSrv = inject(UserService);
  private readonly roleSrv = inject(RoleService);
  private readonly inviteSrv = inject(InviteService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(DialogService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  override readonly sortOptions = TEAM_SORT_OPTIONS;
  readonly empty = EMPTY_CELL;

  readonly canReadInvites = this.auth.hasPermission(Permissions.Admin.InviteRead);
  readonly canRevokeInvites = this.auth.hasPermission(Permissions.Admin.InviteRevoke);
  readonly currentUserId = computed(() => this.currentUser()?.id ?? null);
  private readonly currentUser = toSignal(this.auth.userInfo$, { initialValue: null });

  readonly roles = signal<Role[]>([]);
  readonly invitableRoles = computed(() => this.roles()
    .filter(r => INVITABLE_ROLE_CODES.includes(r.code))
    .map(r => ({ label: r.name, value: r.id })));
  readonly roleOptions = computed(() => this.roles().map(r => ({ label: r.name, value: r.id })));

  // #region Invitations
  readonly invites = signal<TenantInvite[]>([]);
  readonly invitesLoading = signal(false);
  readonly invitesFailed = signal(false);
  readonly invitesOpen = signal(false);
  readonly revokingInvite = signal<string | null>(null);

  isInviteOpen = false;
  inviting = false;
  readonly inviteForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.pattern(EMAIL), Validators.maxLength(256)]],
    roleId: ['', Validators.required],
  });
  // #endregion

  // #region Role change
  roleMember: User | null = null;
  savingRole = false;
  readonly roleForm = this.fb.nonNullable.group({
    roleId: ['', Validators.required],
  });
  // #endregion

  /** Row menu per member; your own row has none, so you can't delete yourself or change your own role here. */
  readonly rowActions = computed(() => {
    const me = this.currentUserId();
    const actions = new Map<string, ActionItem[]>();
    for (const m of this.tableData()?.items ?? []) {
      if (m.id === me) { actions.set(m.id, []); continue; }
      actions.set(m.id, [
        ...(this.canUpdate ? [{ label: 'Change role', icon: 'user-cog', onClick: (u: User) => this.openRole(u) }] : []),
        ...(this.canDelete ? [{ label: 'Delete account', icon: 'trash', isDanger: true, onClick: (u: User) => this.onDelete(u.id) }] : []),
      ]);
    }
    return actions;
  });

  constructor() {
    const service = inject(UserService);
    super({
      service,
      noun: ['member', 'members'],
      permissions: {
        create: Permissions.Admin.InviteCreate,
        update: Permissions.Iam.UserAssignRole,
        delete: Permissions.Iam.UserDelete
      },
      filters: TEAM_FILTERS,
      itemName: user => displayNameOf(user),
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    if (this.canReadInvites) this.loadInvites();
  }

  // #region Display helpers
  displayName(u: User): string {
    return displayNameOf(u);
  }

  initials(u: User): string {
    const parts = displayNameOf(u).split(/[\s@.]+/).filter(Boolean);
    if (!parts.length) return '?';
    return (parts[0].charAt(0) + (parts.length > 1 ? parts[1].charAt(0) : '')).toUpperCase();
  }

  roleNames(u: User): string[] {
    return (u.roles ?? []).map(r => r.name).filter(Boolean);
  }

  roleNameForCode(code: string): string {
    return this.roles().find(r => r.code === code)?.name ?? code;
  }
  // #endregion

  private loadRoles(): void {
    this.roleSrv.search({
      pageNumber: 1,
      pageSize: 100,
      search: '',
      sort: '+name',
      filter: { start: '', end: '', isActive: true, isSystemRole: null }
    }).subscribe({
      next: res => {
        if (res?.success && res.data) this.roles.set((res.data.items ?? []).filter(r => r.code !== 'SUPER_ADMIN'));
      },
      error: () => undefined
    });
  }

  // #region Invitations
  loadInvites(): void {
    this.invitesLoading.set(true);
    this.invitesFailed.set(false);
    this.inviteSrv.getPending()
      .pipe(finalize(() => this.invitesLoading.set(false)))
      .subscribe({
        next: res => {
          if (!res?.success) { this.invitesFailed.set(true); return; }
          this.invites.set([...(res.data ?? [])].sort((a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime()));
        },
        error: () => this.invitesFailed.set(true)
      });
  }

  openInvite(): void {
    if (!this.canCreate) return;
    this.inviteForm.reset({ email: '', roleId: '' });
    this.isInviteOpen = true;
  }

  requestCloseInvite(): void {
    if (this.inviting) return;
    if (this.inviteForm.dirty) this.dialog.confirmUnsavedChanges(() => this.isInviteOpen = false);
    else this.isInviteOpen = false;
  }

  onInvite(): void {
    if (this.inviting) return;
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }

    const email = this.inviteForm.controls.email.value.trim();
    const role = this.roles().find(r => r.id === this.inviteForm.controls.roleId.value);
    if (!role) return;

    if (this.invites().some(i => i.email?.toLowerCase() === email.toLowerCase())) {
      this.toast.error(`${email} already has a pending invitation`);
      return;
    }

    this.inviting = true;
    // Search matches emails by substring, so compare exactly before inviting someone who is already a member.
    this.userSrv.search({ pageNumber: 1, pageSize: 20, search: email, sort: '+email', filter: { isActive: null } }).pipe(
      map(res => (res.data?.items ?? []).some(u => u.email?.toLowerCase() === email.toLowerCase())),
      switchMap(isMember => isMember ? of(null) : this.inviteSrv.create({ email, intendedRole: role.code })),
      finalize(() => this.inviting = false)
    ).subscribe({
      next: res => {
        if (res === null) { this.toast.error(`${email} is already a member`); return; }
        if (!res.success) { this.toast.error('The invitation could not be sent'); return; }
        this.isInviteOpen = false;
        this.toast.success(`Invitation sent to ${email}`);
        if (this.canReadInvites) this.loadInvites();
      },
      // The interceptor shows the server's reason; the drawer keeps the email and role.
      error: () => undefined
    });
  }

  onRevokeInvite(inv: TenantInvite): void {
    if (!this.canRevokeInvites || this.revokingInvite()) return;
    this.dialog.confirm(
      `The invitation link sent to ${inv.email ?? 'this address'} will stop working.`,
      () => {
        this.revokingInvite.set(inv.id);
        this.inviteSrv.revoke(inv.id)
          .pipe(finalize(() => this.revokingInvite.set(null)))
          .subscribe({
            next: res => {
              if (!res?.success) { this.toast.error('The invitation could not be revoked'); return; }
              this.invites.update(list => list.filter(i => i.id !== inv.id));
              this.toast.success('Invitation revoked');
            },
            error: () => undefined
          });
      },
      'Revoke invitation?',
      'danger',
      'Revoke'
    );
  }
  // #endregion

  // #region Role change
  openRole(member: User): void {
    if (!this.canUpdate || member.id === this.currentUserId()) return;
    const current = (member.roles ?? []).find(r => this.roles().some(x => x.id === r.id));
    this.roleMember = member;
    this.roleForm.reset({ roleId: current?.id ?? '' });
  }

  requestCloseRole(): void {
    if (this.savingRole) return;
    if (this.roleForm.dirty) this.dialog.confirmUnsavedChanges(() => this.roleMember = null);
    else this.roleMember = null;
  }

  /**
   * Grants the new role first, then revokes the others one by one: if a step fails the member still has a role,
   * and the list is reloaded so it shows what the server actually holds.
   */
  onSaveRole(): void {
    const member = this.roleMember;
    if (!member || this.savingRole) return;
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const roleId = this.roleForm.controls.roleId.value;
    const others = (member.roles ?? []).map(r => r.id).filter(id => id !== roleId);
    const alreadyHas = (member.roles ?? []).some(r => r.id === roleId);

    this.savingRole = true;
    concat(
      alreadyHas ? of(null) : this.userSrv.assignRole({ userId: member.id, roleId }),
      ...others.map(id => this.userSrv.removeRole({ userId: member.id, roleId: id }))
    ).pipe(
      toArray(),
      finalize(() => this.savingRole = false)
    ).subscribe({
      next: () => {
        this.roleMember = null;
        this.toast.success(`${displayNameOf(member)} is now ${this.roles().find(r => r.id === roleId)?.name ?? 'updated'}`);
        this.load();
      },
      error: () => this.load()
    });
  }
  // #endregion

  /** Deletes the member's account (soft delete on the server): they can no longer sign in. */
  override onDelete(id: string | null): void {
    if (!id || !this.canDelete || id === this.currentUserId()) return;
    const member = this.tableData()?.items.find(u => u.id === id);
    const name = member ? displayNameOf(member) : 'this member';

    this.dialog.confirm(
      `${name}’s account will be deleted and they will no longer be able to sign in. Their past records are kept.`,
      () => {
        const data = this.tableData();
        const wasLastOnPage = !!data && data.items.length === 1 && data.pageNumber > 1;
        this.userSrv.delete(id).subscribe({
          // 204 No Content: success carries no body.
          next: () => {
            this.toast.success(`${name}’s account was deleted`);
            if (wasLastOnPage) this.params.pageNumber -= 1;
            this.load();
          },
          error: () => undefined
        });
      },
      'Delete account?',
      'danger',
      'Delete account'
    );
  }
}

function displayNameOf(u: User): string {
  const p = u.profile;
  if (p?.fullName) return p.fullName;
  const name = [p?.firstName, p?.lastName].filter(Boolean).join(' ');
  return name || u.email;
}

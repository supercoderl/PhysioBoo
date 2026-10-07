import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminBreadcrumbComponent } from "../../../../../components/breadcrumb/admin-breadcrumb.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { InviteService } from '../../../../../services/admin/invite.service';
import { RoleService } from '../../../../../services/admin/role.service';
import { UserService } from '../../../../../services/admin/user.service';
import { AuthService } from '../../../../../services/auth/auth.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { SharedModule } from '../../../../../shared/shared-imports';
import { User } from '../../../../../shared/types/core.types';
import { Role } from '../../../../../shared/types/role.types';

interface PendingInvite {
  id: string;
  email: string;
  invitedAt: string;
  expiresAt: string;
  roleCode: string;
}

// Invites carry a built-in role code (backend Role enum); custom roles are assigned after sign-up.
const INVITABLE_ROLE_CODES = [
  'ADMIN', 'NURSE', 'PHAMACIST', 'CASHIER', 'LAB_TECHNICIAN', 'RADIOLOGIST',
  'RECEPTIONIST', 'ACCOUNTANT', 'INVENTORY_MANAGER', 'IT_SUPPORT', 'DOCTOR',
];

@Component({
  selector: 'setting-team',
  standalone: true,
  imports: [
    SharedModule,
    FormsModule,
    AdminBreadcrumbComponent,
    BooIconComponent
  ],
  templateUrl: './team.component.html'
})
export class TeamComponent implements OnInit {
  private userSrv = inject(UserService);
  private roleSrv = inject(RoleService);
  private inviteSrv = inject(InviteService);
  private authSrv = inject(AuthService);
  private toastSrv = inject(ToastService);

  loading = signal(false);
  inviting = signal(false);
  removing = signal<string | null>(null);
  changingRoleFor = signal<string | null>(null);

  members = signal<User[]>([]);
  roles = signal<Role[]>([]);
  pendingInvites = signal<PendingInvite[]>([]);
  invitableRoles = computed(() => this.roles().filter(r => INVITABLE_ROLE_CODES.includes(r.code)));

  search = signal('');
  inviteEmail = signal('');
  inviteRoleId = signal('');

  currentUserId = '';

  filteredMembers = computed(() => {
    const term = this.search().toLowerCase().trim();
    if (!term) return this.members();
    return this.members().filter(m =>
      m.email.toLowerCase().includes(term) ||
      this.displayNameFor(m).toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.authSrv.userInfo$.subscribe(u => { if (u) this.currentUserId = u.id; });
    this.loadMembers();
    this.loadRoles();
    this.loadInvites();
  }

  loadMembers(): void {
    this.loading.set(true);
    this.userSrv.search({
      pageNumber: 1,
      pageSize: 100,
      search: '',
      sort: '+email',
      filter: { isActive: null }
    }).pipe(
      finalize(() => this.loading.set(false)),
      catchError(() => { this.toastSrv.error('Failed to load members'); return of(null); })
    ).subscribe(res => {
      if (res?.success && res.data) this.members.set(res.data.items ?? []);
    });
  }

  loadRoles(): void {
    this.roleSrv.search({
      pageNumber: 1,
      pageSize: 100,
      search: '',
      sort: '+name',
      filter: { start: '', end: '', isActive: true, isSystemRole: null }
    }).pipe(
      catchError(() => { this.toastSrv.error('Failed to load roles'); return of(null); })
    ).subscribe(res => {
      if (res?.success && res.data) this.roles.set((res.data.items ?? []).filter(r => r.code !== 'SUPER_ADMIN'));
    });
  }

  loadInvites(): void {
    this.inviteSrv.getPending().pipe(
      catchError(() => of(null))
    ).subscribe(res => {
      if (!res?.success) return;
      this.pendingInvites.set(res.data.map(i => ({
        id: i.id,
        email: i.email ?? '(no email)',
        invitedAt: new Date(i.invitedAt).toLocaleDateString(),
        expiresAt: new Date(i.expiresAt).toLocaleDateString(),
        roleCode: i.intendedRole
      })));
    });
  }

  onInvite(): void {
    const email = this.inviteEmail().trim();
    const role = this.roles().find(r => r.id === this.inviteRoleId());
    if (!email || !role || this.inviting()) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.toastSrv.error('Please enter a valid email address');
      return;
    }
    if (this.members().some(m => m.email.toLowerCase() === email.toLowerCase())) {
      this.toastSrv.error('That person is already a member');
      return;
    }

    this.inviting.set(true);
    this.inviteSrv.create({ email, intendedRole: role.code })
      .pipe(
        finalize(() => this.inviting.set(false)),
        catchError(() => { this.toastSrv.error('Failed to send invite'); return of(null); })
      )
      .subscribe(res => {
        if (!res?.success) return;
        this.inviteEmail.set('');
        this.inviteRoleId.set('');
        this.toastSrv.success(`Invited ${email}`);
        this.loadInvites();
      });
  }

  onChangeRole(member: User, roleId: string): void {
    if (this.changingRoleFor()) return;
    this.changingRoleFor.set(member.id);
    // The team table shows one role per member, so switching replaces the previous role(s).
    const previous = (member.roles ?? []).map(r => r.id).filter(id => id !== roleId);
    forkJoin([
      this.userSrv.assignRole({ userId: member.id, roleId }),
      ...previous.map(id => this.userSrv.removeRole({ userId: member.id, roleId: id }))
    ]).pipe(
      finalize(() => this.changingRoleFor.set(null)),
      catchError(() => { this.toastSrv.error('Failed to update role'); return of(null); })
    ).subscribe(results => {
      if (!results || results.some(r => !r.success)) return;
      const role = this.roles().find(r => r.id === roleId);
      this.members.update(list => list.map(m => m.id === member.id ? { ...m, roles: role ? [role] : [] } : m));
      this.toastSrv.success('Role updated');
    });
  }

  onRemove(member: User): void {
    if (member.id === this.currentUserId) return;
    if (!confirm(`Remove ${this.displayNameFor(member)} from the team?`)) return;

    this.removing.set(member.id);
    this.userSrv.delete(member.id)
      .pipe(
        finalize(() => this.removing.set(null)),
        catchError(() => { this.toastSrv.error('Failed to remove member'); return of(null); })
      )
      .subscribe(res => {
        if (!res?.success) return;
        this.members.update(list => list.filter(m => m.id !== member.id));
        this.toastSrv.success('Member removed');
      });
  }

  onRevokeInvite(inv: PendingInvite): void {
    if (!confirm(`Revoke invitation for ${inv.email}?`)) return;
    this.inviteSrv.revoke(inv.id).pipe(
      catchError(() => { this.toastSrv.error('Failed to revoke invitation'); return of(null); })
    ).subscribe(res => {
      if (!res?.success) return;
      this.pendingInvites.update(list => list.filter(i => i.id !== inv.id));
      this.toastSrv.success('Invitation revoked');
    });
  }

  displayNameFor(u: User): string {
    const p: any = (u as any).profile;
    if (p?.fullName) return p.fullName;
    if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ');
    return u.email;
  }

  initialsFor(u: User): string {
    const name = this.displayNameFor(u);
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  roleIdFor(u: User): string {
    const ids = (u.roles ?? []).map(r => r.id);
    return this.roles().find(r => ids.includes(r.id))?.id ?? '';
  }

  roleNameFor(code: string): string {
    return this.roles().find(r => r.code === code)?.name ?? code;
  }
}

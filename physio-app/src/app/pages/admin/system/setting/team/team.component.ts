import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminBreadcrumbComponent } from "../../../../../components/breadcrumb/admin-breadcrumb.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { AuthService } from '../../../../../services/auth/auth.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { UserService } from '../../../../../services/admin/user.service';
import { SharedModule } from '../../../../../shared/shared-imports';
import { User } from '../../../../../shared/types/core';
import { Role } from '../../../../../shared/types/role';

interface PendingInvite {
  id: string;
  email: string;
  invitedAt: string;
  expiresAt: string;
  roleId: string;
}

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
  private authSrv = inject(AuthService);
  private toastSrv = inject(ToastService);

  loading = signal(false);
  inviting = signal(false);
  removing = signal<string | null>(null);
  changingRoleFor = signal<string | null>(null);

  members = signal<User[]>([]);
  roles = signal<Role[]>([]);
  pendingInvites = signal<PendingInvite[]>([]);

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
  }

  loadMembers(): void {
    this.loading.set(true);
    this.userSrv.search({
      pageNumber: 1,
      pageSize: 100,
      search: '',
      sort: '+email',
      filter: { start: '', end: '', isActive: null }
    }).pipe(
      finalize(() => this.loading.set(false)),
      catchError(() => { this.toastSrv.error('Failed to load members'); return of(null); })
    ).subscribe(res => {
      if (res?.success && res.data) this.members.set(res.data.items ?? []);
    });
  }

  loadRoles(): void {
    // TODO: replace with real role service when available
    this.roles.set([
      { id: 'admin', name: 'Admin', code: 'ADMIN', isSystemRole: true, isActive: true } as Role,
      { id: 'manager', name: 'Manager', code: 'MANAGER', isSystemRole: false, isActive: true } as Role,
      { id: 'member', name: 'Member', code: 'MEMBER', isSystemRole: false, isActive: true } as Role,
      { id: 'viewer', name: 'Viewer', code: 'VIEWER', isSystemRole: false, isActive: true } as Role,
    ]);
  }

  onInvite(): void {
    const email = this.inviteEmail().trim();
    const roleId = this.inviteRoleId();
    if (!email || !roleId || this.inviting()) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.toastSrv.error('Please enter a valid email address');
      return;
    }
    if (this.members().some(m => m.email.toLowerCase() === email.toLowerCase())) {
      this.toastSrv.error('That person is already a member');
      return;
    }

    this.inviting.set(true);
    // TODO: wire to real backend — POST /api/team/members  body: { email, roleId }
    setTimeout(() => {
      this.pendingInvites.update(list => [
        ...list,
        {
          id: `inv_${Date.now()}`,
          email,
          invitedAt: new Date().toLocaleDateString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          roleId
        }
      ]);
      this.inviteEmail.set('');
      this.inviteRoleId.set('');
      this.inviting.set(false);
      this.toastSrv.success(`Invited ${email}`);
    }, 400);
  }

  onChangeRole(member: User, roleId: string): void {
    if (this.changingRoleFor()) return;
    this.changingRoleFor.set(member.id);
    this.userSrv.assignRole({ userId: member.id, roleId })
      .pipe(
        finalize(() => this.changingRoleFor.set(null)),
        catchError(() => { this.toastSrv.error('Failed to update role'); return of(null); })
      )
      .subscribe(res => {
        if (res?.success !== false) this.toastSrv.success('Role updated');
      });
  }

  onRemove(member: User): void {
    if (member.id === this.currentUserId) return;
    if (!confirm(`Remove ${this.displayNameFor(member)} from the team?`)) return;

    this.removing.set(member.id);
    // TODO: wire to real backend — DELETE /api/team/members/{userId}
    setTimeout(() => {
      this.members.update(list => list.filter(m => m.id !== member.id));
      this.removing.set(null);
      this.toastSrv.success('Member removed');
    }, 300);
  }

  onRevokeInvite(inv: PendingInvite): void {
    if (!confirm(`Revoke invitation for ${inv.email}?`)) return;
    // TODO: wire to real backend — DELETE /api/team/invitations/{id}
    this.pendingInvites.update(list => list.filter(i => i.id !== inv.id));
    this.toastSrv.success('Invitation revoked');
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
    const roles: string[] | undefined = (u as any).roles;
    if (!roles?.length) return this.roles()[0]?.id ?? '';
    const match = this.roles().find(r => roles.includes(r.code) || roles.includes(r.id));
    return match?.id ?? this.roles()[0]?.id ?? '';
  }
}

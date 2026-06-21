import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AdminService, AdminUser } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private auth         = inject(AuthService);
  private adminService = inject(AdminService);
  private router       = inject(Router);

  users      = signal<AdminUser[]>([]);
  loading    = signal(true);
  error      = signal('');
  deletingId = signal<string | null>(null);

  readonly currentUser = this.auth.currentUser;

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.adminService.getUsers().subscribe({
      next: users => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load users.');
        this.loading.set(false);
      }
    });
  }

  deleteUser(user: AdminUser): void {
    if (!confirm(`Delete "${user.username}"? This cannot be undone.`)) return;
    this.deletingId.set(user._id);

    this.adminService.deleteUser(user._id).subscribe({
      next: () => {
        this.users.update(list => list.filter(u => u._id !== user._id));
        this.deletingId.set(null);
      },
      error: err => {
        this.error.set(err.error?.message ?? 'Failed to delete user.');
        this.deletingId.set(null);
      }
    });
  }

  goToDashboard(): void { this.router.navigate(['/dashboard']); }
  logout(): void { this.auth.logout(); }
}

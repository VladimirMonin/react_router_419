// src/components/AdminBadge.tsx
interface AdminBadgeProps {
  isAdmin: boolean;
}

export const AdminBadge = ({ isAdmin }: AdminBadgeProps) => {
  return (
    <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-user'}`}>
      {isAdmin ? '👑 Администратор' : '👤 Пользователь'}
    </span>
  );
};

// src/components/VerifiedBadge.tsx
interface VerifiedBadgeProps {
  isVerified: boolean;
}

export const VerifiedBadge = ({ isVerified }: VerifiedBadgeProps) => {
  return (
    <span className={`badge ${isVerified ? 'badge-verified' : 'badge-unverified'}`}>
      {isVerified ? '✓ Подтверждён' : '⏳ Не подтверждён'}
    </span>
  );
};

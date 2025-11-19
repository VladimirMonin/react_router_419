import { useAuth } from '../hooks/useAuth';
import { AdminBadge } from './AdminBadge';
import { VerifiedBadge } from './VerifiedBadge';
import './ProfilePage.css';

export function ProfilePage() {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="container profile-container">
                <h1 className="profile-title">Личный кабинет</h1>
                <p>Загрузка данных пользователя...</p>
            </div>
        );
    }

    return (
        <div className="container profile-container">
            <h1 className="profile-title">Личный кабинет</h1>
            
            <div className="profile-info">
                <div className="profile-info-item">
                    <span className="profile-info-label">Email:</span>
                    <span className="profile-info-value">{user.email}</span>
                </div>

                <div className="profile-info-item">
                    <span className="profile-info-label">ID:</span>
                    <span className="profile-info-value">{user.id}</span>
                </div>

                <div className="profile-info-item">
                    <span className="profile-info-label">Статус:</span>
                    <span className="profile-info-value">
                        {user.is_active ? '✓ Активен' : '✗ Неактивен'}
                    </span>
                </div>
            </div>

            <div className="profile-badges">
                <AdminBadge isAdmin={user.is_superuser} />
                <VerifiedBadge isVerified={user.is_verified} />
            </div>
        </div>
    );
}
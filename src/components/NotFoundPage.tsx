// src/components/NotFoundPage.tsx
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '50px' }}>
      <h1>404 - Страница не найдена</h1>
      <p>К сожалению, страница, которую вы ищете, не существует.</p>
      <p>
        <Link to="/">Вернуться на главную</Link>
      </p>
    </div>
  );
}

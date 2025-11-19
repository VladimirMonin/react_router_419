# Лекция: Интеграция авторизации React + FastAPI

## Введение

Сегодня мы интегрировали полноценную систему авторизации во фронтенде на React с бэкендом на FastAPI. Работа велась в **5 этапов**, каждый зафиксирован отдельным коммитом.

Вы можете переключаться между коммитами и смотреть код:

```bash
# Посмотреть список коммитов
git log --oneline

# Переключиться на конкретный коммит
git checkout <commit-hash>

# Вернуться на main
git checkout main
```

---

## Шаг 0. Подготовка (Контракт API)

### Что делаем ПЕРЕД началом работы?

1. **Запускаем бэкенд FastAPI** и проверяем что он работает
2. Открываем `http://localhost:8000/openapi.json` или `http://localhost:8000/docs`
3. **Изучаем контракт** — какие эндпоинты, какой формат данных

### Ключевые находки из schema.json

**Эндпоинт `/auth/jwt/login`:**

- Тип контента: `application/x-www-form-urlencoded` (НЕ JSON!)
- Поля: `username` и `password` (но в username мы будем передавать email)
- Это **стандарт OAuth2 Password Flow** от fastapi-users

**Эндпоинт `/auth/register`:**

- Тип контента: `application/json`
- Поля: `email` и `password`

**Эндпоинт `/users/me`:**

- Требует заголовок `Authorization: Bearer <token>`
- Возвращает данные пользователя

### Почему это важно?

Многие разработчики начинают кодить наугад и получают ошибку 422. Мы сначала **читаем контракт**, понимаем требования API, и только потом пишем код.

---

## Шаг 1. Настройка прокси сервера

**Коммит:** `build(vite): настройка прокси сервера`

### В чем проблема?

- Фронтенд: `http://localhost:5173` (Vite dev server)
- Бэкенд: `http://localhost:8000` (FastAPI)

Это **разные origin** → браузер блокирует запросы из-за CORS (Cross-Origin Resource Sharing).

### Решение: Vite Proxy

Мы добавили конфигурацию в `vite.config.ts` которая говорит:

- "Все запросы на `/api/*` перенаправляй на `http://localhost:8000`"
- "И убери префикс `/api` перед отправкой"

**Файл:** `vite.config.ts`

Теперь когда фронтенд делает `fetch('/api/auth/jwt/login')`, Vite:

1. Перехватывает запрос
2. Убирает `/api` → получается `/auth/jwt/login`
3. Отправляет на `http://localhost:8000/auth/jwt/login`
4. Браузер думает что это тот же домен → CORS не срабатывает

### Как проверить?

1. Запустите `npm run dev`
2. Откройте DevTools → Network
3. Любой запрос к `/api/...` должен проходить без CORS ошибок

### На что обратить внимание

- Прокси **работает только в dev-режиме**
- В продакшене нужно настроить CORS на бэкенде
- Префикс `/api` можно менять на любой

---

## Шаг 2. Умный API-клиент

**Коммит:** `feat(api): базовый клиент для HTTP запросов`

### В чем проблема?

Без централизации в каждом компоненте мы писали бы:

```typescript
fetch('/api/users/me', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
```

Это нарушает принцип **DRY (Don't Repeat Yourself)**.

### Решение: API Service

Мы создали центральное место для всех запросов к API.

**Файлы:**

- `src/services/api.ts` — методы для работы с API
- `src/types/api.ts` — TypeScript типы (LoginResponse, User, RegisterData)

### Что там внутри?

Три метода в объекте `authApi`:

1. **`login(formData)`** — отправляет form-data на `/auth/jwt/login`
2. **`register(data)`** — отправляет JSON на `/auth/register`
3. **`getProfile(token)`** — получает данные пользователя с Bearer токеном

### Ключевой момент

Для логина используется **URLSearchParams** (form-data), а не JSON:

```typescript
const formData = new URLSearchParams();
formData.append('username', email);
formData.append('password', password);
```

Это требование fastapi-users по стандарту OAuth2.

### Как проверить?

1. Откройте Swagger UI бэкенда: `http://localhost:8000/docs`
2. Зарегистрируйте тестового пользователя
3. Получите токен
4. В консоли браузера выполните:

   ```javascript
   fetch('/api/users/me', {
     headers: { 'Authorization': 'Bearer <токен>' }
   }).then(r => r.json()).then(console.log)
   ```

---

## Шаг 3. Контекст авторизации (Мозг приложения)

**Коммит:** `feat(auth): провайдер авторизации и логика сессий`

### В чем проблема?

React **забывает всё** при обновлении страницы. Нам нужно:

1. Хранить информацию о пользователе глобально (доступно всем компонентам)
2. При старте приложения проверять: есть ли сохраненный токен?
3. Если токен есть → спросить у бэкенда: действителен ли он?

### Решение: React Context API

**Файлы:**

- `src/context/AuthContext.tsx` — провайдер контекста
- `src/hooks/useAuth.ts` — хук для удобного доступа к контексту

### Логика работы

**При загрузке приложения (useEffect с пустым массивом зависимостей):**

1. Проверяем localStorage: есть ли токен?
2. Если есть → запрашиваем `/users/me` с этим токеном
3. Если ответ успешен → сохраняем данные пользователя в state
4. Если ошибка (401) → удаляем невалидный токен

**При входе (метод login):**

1. Получаем токен от бэкенда
2. Сохраняем в localStorage
3. Запрашиваем данные пользователя
4. Сохраняем в state

**При выходе (метод logout):**

1. Удаляем токен из localStorage
2. Очищаем state (user = null)

### Метафора

Представьте что `AuthContext` — это **охранник на входе**:

- При загрузке страницы он проверяет ваш пропуск (токен)
- Если пропуск действителен → пускает внутрь
- Если нет → выкидывает пропуск и просит войти заново

### Как проверить?

1. **DevTools → Application → Local Storage**
2. Добавьте вручную запись: `token = <ваш_токен>`
3. Перезагрузите страницу
4. **DevTools → Network** → должен появиться запрос к `/api/users/me`
5. Если токен валиден → вы автоматически "залогинены"

---

## Шаг 4. Страницы входа и регистрации

**Коммит:** `feat(pages): страницы входа и регистрации`

### Что делаем?

Создаем UI для пользователей:

- Форма входа
- Форма регистрации
- Валидация
- Обработка ошибок

**Файлы:**

- `src/components/LoginPage.tsx`
- `src/components/RegisterPage.tsx`

### LoginPage — критически важный момент

При отправке формы мы создаем **URLSearchParams** (а не JSON):

```typescript
const formData = new URLSearchParams();
formData.append('username', email); // Поле username, значение email
formData.append('password', password);
```

Если отправить JSON → получите ошибку 422 от бэкенда.

### RegisterPage

Здесь всё проще — отправляем обычный JSON с `email` и `password`.

После успешной регистрации перенаправляем на `/login` (в fastapi-users нужно отдельно залогиниться после регистрации).

### Умный редирект

Когда пользователь пытается зайти на защищенную страницу `/profile` без авторизации, его перекидывает на `/login`. Мы **запоминаем** откуда он пришел:

```typescript
const from = location.state?.from?.pathname || '/';
```

После успешного входа возвращаем его туда:

```typescript
navigate(from, { replace: true });
```

### Как проверить?

1. Откройте `http://localhost:5173/register`
2. **DevTools → Network** → включите запись
3. Зарегистрируйте пользователя
4. Найдите запрос `POST /api/auth/register`
5. Проверьте **Request Payload** → должен быть JSON
6. Залогиньтесь
7. Найдите запрос `POST /api/auth/jwt/login`
8. Проверьте **Form Data** → должны быть поля username/password
9. Проверьте **Response** → должен быть `access_token`
10. **Application → Local Storage** → токен сохранился

---

## Шаг 5. Интеграция и защита маршрутов

**Коммит:** `feat(router): интеграция авторизации в навигацию`

### Что делаем?

Связываем все части вместе:

1. Оборачиваем приложение в `AuthProvider`
2. Обновляем шапку сайта (показываем email или кнопки входа)
3. Защищаем маршруты `/profile` и `/cart`

**Файлы:**

- `src/App.tsx` — добавили AuthProvider
- `src/components/MainLayout.tsx` — обновили Header
- `src/components/ProtectedRoute.tsx` — переписали на использование контекста

### App.tsx

Убрали пропсы, теперь всё идет через контекст:

```typescript
<AuthProvider>
  <Routes>
    <Route path="/" element={<MainLayout />}>
      {/* маршруты */}
    </Route>
  </Routes>
</AuthProvider>
```

### MainLayout (Header)

Теперь читает данные из контекста:

```typescript
const { user, logout } = useAuth();

{user ? (
  // Показываем email и кнопку "Выйти"
) : (
  // Показываем "Войти" и "Регистрация"
)}
```

### ProtectedRoute

**Важно:** Проверяем не только `user`, но и `isLoading`:

```typescript
if (isLoading) {
  return <div>Загрузка...</div>;
}

if (!user) {
  return <Navigate to="/login" />;
}

return <Outlet />; // Показываем защищенную страницу
```

Без проверки `isLoading` будет **ложное срабатывание**:

- Приложение стартует
- `user` еще `null` (идет проверка токена)
- `ProtectedRoute` думает что пользователь не авторизован
- Редирект на `/login`
- А через секунду токен проверился и оказался валидным
- Но пользователя уже выкинуло!

### Как проверить весь флоу?

#### Тест 1: Защита работает

1. Откройте `http://localhost:5173` (не авторизованы)
2. Перейдите на `http://localhost:5173/profile`
3. Автоматический редирект на `/login`
4. Войдите
5. Автоматический возврат на `/profile`

#### Тест 2: Шапка обновляется

1. Не авторизованы → видно "Войти | Регистрация"
2. Войдите → видно "email | Выйти"
3. Выйдите → снова "Войти | Регистрация"

#### Тест 3: Сохранение сессии

1. Войдите в систему
2. Откройте `/profile`
3. **Перезагрузите страницу (F5)**
4. DevTools → Network → запрос к `/api/users/me` с токеном
5. Вы **остались на `/profile`** — сессия восстановилась

#### Тест 4: Невалидный токен

1. DevTools → Application → Local Storage
2. Измените токен на "fake-token-123"
3. Перезагрузите страницу
4. DevTools → Network → запрос к `/api/users/me` → ошибка 401
5. Токен удален из localStorage
6. Редирект на `/login`

---

## Что смотреть в DevTools?

### Network (вкладка Сеть)

**При логине:**

- URL: `/api/auth/jwt/login`
- Method: POST
- Request Headers: `Content-Type: application/x-www-form-urlencoded`
- **Form Data:** `username=...&password=...`
- **Response:** `{"access_token": "...", "token_type": "bearer"}`

**При проверке профиля:**

- URL: `/api/users/me`
- Method: GET
- Request Headers: `Authorization: Bearer <токен>`
- **Response:** `{"id": "...", "email": "...", "is_active": true, ...}`

### Application (вкладка Приложение)

**Local Storage:**

- Ключ: `token`
- Значение: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT токен)

### Console (Консоль)

Можно проверить токен вручную:

```javascript
localStorage.getItem('token')
```

### React DevTools (расширение браузера)

Найдите компонент `AuthProvider`:

- Hooks → State → `user` → должны быть данные пользователя
- Hooks → State → `isLoading` → false (после загрузки)

---

## Частые ошибки студентов

### 1. "422 Unprocessable Entity" при логине

**Причина:** Отправили JSON вместо form-data

**Где смотреть:**

- DevTools → Network → Request → Headers
- Content-Type должен быть `application/x-www-form-urlencoded`
- Payload должен быть Form Data, а не JSON

**Где в коде:**

- `src/components/LoginPage.tsx`
- Используем `URLSearchParams`, а не `JSON.stringify`

### 2. CORS ошибка "Access-Control-Allow-Origin"

**Причина:** Прокси не работает или не настроен

**Где смотреть:**

- DevTools → Console → красная ошибка CORS
- DevTools → Network → запрос красный, статус (failed)

**Где в коде:**

- `vite.config.ts` — проверьте настройку proxy
- Перезапустите dev-сервер

### 3. Бесконечная "Загрузка..."

**Причина:** Не проверили `isLoading` в ProtectedRoute

**Где смотреть:**

- Экран показывает "Загрузка..." навсегда
- DevTools → Network → нет запросов (или запрос завершился)

**Где в коде:**

- `src/components/ProtectedRoute.tsx`
- Должна быть проверка `if (isLoading) { return ... }`

### 4. Токен не сохраняется

**Причина:** Забыли `localStorage.setItem`

**Где смотреть:**

- DevTools → Application → Local Storage → пусто
- После логина токена нет

**Где в коде:**

- `src/context/AuthContext.tsx` → метод `login`
- Должна быть строка `localStorage.setItem('token', token)`

### 5. После обновления страницы разлогинивает

**Причина:** Не реализована проверка токена в `useEffect`

**Где смотреть:**

- После F5 редирект на `/login`
- DevTools → Network → нет запроса к `/users/me`

**Где в коде:**

- `src/context/AuthContext.tsx` → `useEffect`
- Должен быть запрос `authApi.getProfile(token)`

---

## Как переключаться между коммитами

```bash
# 1. Посмотреть историю
git log --oneline

# Вы увидите что-то вроде:
# 5d59a8b feat(router): интеграция авторизации в навигацию
# 0b00955 feat(pages): страницы входа и регистрации
# b997396 feat(auth): провайдер авторизации и логика сессий
# 5d9341d feat(api): базовый клиент для HTTP запросов
# 7fa1afe build(vite): настройка прокси сервера

# 2. Переключиться на состояние после Шага 1
git checkout 7fa1afe

# 3. Посмотреть файл vite.config.ts
code vite.config.ts

# 4. Переключиться на Шаг 2
git checkout 5d9341d

# 5. Посмотреть новые файлы
code src/services/api.ts
code src/types/api.ts

# 6. Вернуться на актуальное состояние
git checkout main
```

**Важно:** После каждого checkout делайте `npm install` если менялся `package.json`.

---

## Архитектура (куда что положили)

```
src/
├── services/
│   └── api.ts          # Методы для HTTP запросов (login, register, getProfile)
├── types/
│   └── api.ts          # TypeScript типы (User, LoginResponse, RegisterData)
├── context/
│   └── AuthContext.tsx # Провайдер контекста (user, isLoading, login, logout)
├── hooks/
│   └── useAuth.ts      # Хук для доступа к контексту
├── components/
│   ├── LoginPage.tsx   # Форма входа (form-data!)
│   ├── RegisterPage.tsx # Форма регистрации (JSON)
│   ├── ProtectedRoute.tsx # Защита маршрутов
│   └── MainLayout.tsx  # Header с кнопками
└── App.tsx             # Обертка в AuthProvider
```

### Поток данных

1. **Пользователь** заполняет форму в `LoginPage`
2. **LoginPage** вызывает `authApi.login(formData)`
3. **authApi** делает fetch запрос на `/api/auth/jwt/login`
4. **Бэкенд** возвращает токен
5. **LoginPage** вызывает `context.login(token)`
6. **AuthContext** сохраняет токен в localStorage и запрашивает `/users/me`
7. **AuthContext** сохраняет данные пользователя в state
8. **MainLayout** читает `user` из контекста → показывает email
9. **ProtectedRoute** читает `user` из контекста → пускает на защищенную страницу

---

## Контрольные вопросы для студентов

1. Почему для логина используется `URLSearchParams`, а для регистрации `JSON.stringify`?
2. Что произойдет если не проверять `isLoading` в `ProtectedRoute`?
3. Зачем проверять токен в `useEffect` при загрузке приложения?
4. Почему прокси работает только в dev-режиме?
5. Что хранится в `localStorage` и почему это небезопасно для реального продакта?
6. Как работает редирект "откуда пришел" после входа?
7. Что будет если удалить `AuthProvider` из `App.tsx`?

---

## Список коммитов (для сверки)

```bash
git log --oneline
```

Должно быть **5 коммитов**:

1. `build(vite): настройка прокси сервера`
2. `feat(api): базовый клиент для HTTP запросов`
3. `feat(auth): провайдер авторизации и логика сессий`
4. `feat(pages): страницы входа и регистрации`
5. `feat(router): интеграция авторизации в навигацию`

---

## Запуск проекта (напоминание)

```bash
# 1. Бэкенд (в папке с FastAPI)
uvicorn main:app --reload

# 2. Фронтенд (в папке react-router-419)
npm run dev

# 3. Браузер
http://localhost:5173
```

---

**Удачи на лекции!**

### Что проверяем?

1. **Запускаем бэкенд FastAPI**:

   ```bash
   # В папке с бэкендом
   uvicorn main:app --reload
   ```

2. **Открываем OpenAPI спецификацию**:
   - URL: `http://localhost:8000/openapi.json`
   - Или Swagger UI: `http://localhost:8000/docs`

### На что обращаем внимание?

#### Эндпоинт `/auth/jwt/login` (POST)

```json
{
  "requestBody": {
    "content": {
      "application/x-www-form-urlencoded": {
        "schema": {
          "properties": {
            "username": { "type": "string" },
            "password": { "type": "string" }
          }
        }
      }
    }
  }
}
```

**Критически важно:**

- Тип контента: `application/x-www-form-urlencoded` (НЕ JSON!)
- Поле называется `username`, но мы передаем туда email
- Это стандарт OAuth2 Password Flow

#### Эндпоинт `/auth/register` (POST)

```json
{
  "requestBody": {
    "content": {
      "application/json": {
        "schema": {
          "properties": {
            "email": { "type": "string" },
            "password": { "type": "string" }
          }
        }
      }
    }
  }
}
```

**Здесь уже JSON**, поля: `email`, `password`.

#### Эндпоинт `/users/me` (GET)

```json
{
  "security": [
    { "OAuth2PasswordBearer": [] }
  ]
}
```

Требует заголовок: `Authorization: Bearer <token>`

---

## Шаг 1. Настройка прокси сервера

**Коммит:** `build(vite): настройка прокси сервера`

### Зачем нужен прокси?

В режиме разработки:

- Фронтенд работает на `http://localhost:5173` (Vite)
- Бэкенд работает на `http://localhost:8000`

Это **разные origin** → браузер блокирует запросы (CORS).

### Решение: Vite Proxy

**Файл:** [`vite.config.ts`](vite.config.ts)

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

### Как это работает?

1. Фронтенд делает запрос: `fetch('/api/auth/jwt/login')`
2. Vite перехватывает запрос с префиксом `/api`
3. Убирает `/api` → получается `/auth/jwt/login`
4. Перенаправляет на `http://localhost:8000/auth/jwt/login`
5. Браузер думает, что запрос идет на тот же домен → CORS не срабатывает

### Тестирование

```bash
# Перезапустите dev-сервер
npm run dev
```

Откройте DevTools → Network. Запросы к `/api/*` должны успешно проходить.

### На что обращать внимание

- **Прокси работает только в dev-режиме!** В продакшене нужно настраивать CORS на бэкенде
- Префикс `/api` можно заменить на любой другой
- `changeOrigin: true` меняет заголовок `Host` в запросе

---

## Шаг 2. Умный API-клиент

**Коммит:** `feat(api): базовый клиент для HTTP запросов`

### Проблема

Без централизации мы бы писали так в каждом компоненте:

```typescript
fetch('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
```

Это нарушает принцип DRY (Don't Repeat Yourself).

### Решение: API Client

**Файлы:**

- [`src/services/api.ts`](src/services/api.ts) — клиент
- [`src/types/api.ts`](src/types/api.ts) — типы данных

#### Типы данных

```typescript
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
}
```

#### API методы

```typescript
const API_BASE_URL = '/api'; // Используем прокси!

export const authApi = {
  // ВАЖНО: URLSearchParams для form-data
  async login(formData: URLSearchParams): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/jwt/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка входа');
    }

    return response.json();
  },

  // JSON для регистрации
  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка регистрации');
    }

    return response.json();
  },

  // Bearer токен в заголовке
  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Не удалось получить профиль');
    return response.json();
  },
};
```

### Ключевые моменты

1. **`URLSearchParams` для login** (form-data):

   ```typescript
   const formData = new URLSearchParams();
   formData.append('username', email);
   formData.append('password', password);
   ```

2. **`JSON.stringify` для register**:

   ```typescript
   body: JSON.stringify({ email, password })
   ```

3. **Bearer токен** всегда в формате:

   ```typescript
   Authorization: `Bearer ${token}`
   ```

### Тестирование в DevTools

1. **Откройте Swagger UI бэкенда**: `http://localhost:8000/docs`
2. Зарегистрируйте тестового пользователя через UI
3. Залогиньтесь, скопируйте токен
4. Проверьте токен в консоли браузера:

   ```javascript
   fetch('/api/users/me', {
     headers: { 'Authorization': 'Bearer <ваш_токен>' }
   }).then(r => r.json()).then(console.log)
   ```

---

## Шаг 3. Контекст авторизации (Мозг приложения)

**Коммит:** `feat(auth): провайдер авторизации и логика сессий`

### Проблема

React — это **stateless** библиотека. При обновлении страницы все состояние пропадает.

Нам нужно:

1. Хранить информацию о пользователе глобально (доступно всем компонентам)
2. Проверять токен при загрузке страницы
3. Автоматически восстанавливать сессию

### Решение: React Context API

**Файлы:**

- [`src/context/AuthContext.tsx`](src/context/AuthContext.tsx) — провайдер
- [`src/hooks/useAuth.ts`](src/hooks/useAuth.ts) — хук для удобства

#### AuthContext

```typescript
interface AuthContextType {
  user: User | null;           // Данные пользователя или null
  isLoading: boolean;          // Идет ли проверка токена
  login: (token: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
}
```

#### Жизненный цикл

```typescript
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // При загрузке приложения
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Проверяем токен на бэкенде
        const userData = await authApi.getProfile(token);
        setUser(userData);
      } catch {
        // Токен невалидный → удаляем
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // Пустой массив зависимостей → выполнится 1 раз

  const login = async (token: string) => {
    localStorage.setItem('token', token);
    const userData = await authApi.getProfile(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // ...
};
```

### Ключевые концепции

1. **`useEffect(fn, [])`** — выполняется при монтировании компонента
2. **localStorage** — хранилище браузера, переживает перезагрузку страницы
3. **Context** — позволяет передавать данные вниз по дереву без prop drilling

### Тестирование

1. **Откройте DevTools → Application → Local Storage**
2. Добавьте вручную запись:
   - Key: `token`
   - Value: `<токен_из_swagger>`
3. Перезагрузите страницу
4. В DevTools → Console выполните:

   ```javascript
   JSON.parse(localStorage.getItem('token'))
   ```

### Хук useAuth

```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  
  return context;
};
```

Теперь в любом компоненте можно написать:

```typescript
const { user, login, logout } = useAuth();
```

---

## Шаг 4. Страницы входа и регистрации

**Коммит:** `feat(pages): страницы входа и регистрации`

### LoginPage

**Файл:** [`src/components/LoginPage.tsx`](src/components/LoginPage.tsx)

#### Критически важный момент

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // ВАЖНО: формат form-data, поле username!
  const formData = new URLSearchParams();
  formData.append('username', email); // Мапим email → username
  formData.append('password', password);

  const response = await authApi.login(formData);
  await login(response.access_token);
  
  navigate(from, { replace: true });
};
```

#### Редирект после входа

```typescript
const from = location.state?.from?.pathname || '/';
```

Если пользователь пытался зайти на `/profile`, его перекинуло на `/login`. После входа мы возвращаем его на `/profile`.

### RegisterPage

**Файл:** [`src/components/RegisterPage.tsx`](src/components/RegisterPage.tsx)

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Валидация на фронте
  if (password !== confirmPassword) {
    setError('Пароли не совпадают');
    return;
  }

  await register(email, password);
  
  // В fastapi-users после регистрации нужно отдельно войти
  navigate('/login');
};
```

### Тестирование

#### Успешный сценарий

1. Откройте `http://localhost:5173/register`
2. Введите email: `test@example.com`, пароль: `123`
3. DevTools → Network → Найдите запрос `POST /api/auth/register`
4. **Request Payload** должен быть JSON:

   ```json
   {"email": "test@example.com", "password": "123"}
   ```

5. После регистрации → редирект на `/login`
6. Войдите с теми же данными
7. DevTools → Network → Найдите запрос `POST /api/auth/jwt/login`
8. **Form Data** должна быть:

   ```
   username: test@example.com
   password: 123
   ```

9. **Response** должен содержать:

   ```json
   {"access_token": "eyJ...", "token_type": "bearer"}
   ```

10. Проверьте localStorage → должен появиться токен

#### Ошибки

- **422 Unprocessable Entity** → неправильный формат данных
- **400 Bad Request** → пользователь уже существует (для register)
- **400 LOGIN_BAD_CREDENTIALS** → неверный email/пароль (для login)

---

## Шаг 5. Интеграция и защита маршрутов

**Коммит:** `feat(router): интеграция авторизации в навигацию`

### App.tsx

**Файл:** [`src/App.tsx`](src/App.tsx)

```typescript
function App() {
  return (
    <AuthProvider>  {/* Оборачиваем всё приложение */}
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Защищенные маршруты */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="cart" element={<CartPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
```

### ProtectedRoute

**Файл:** [`src/components/ProtectedRoute.tsx`](src/components/ProtectedRoute.tsx)

```typescript
export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Ждем проверки токена
  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  // Нет пользователя → редирект на login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Все ОК → рендерим дочерние маршруты
  return <Outlet />;
};
```

#### Как работает защита

1. Пользователь переходит на `/profile`
2. `ProtectedRoute` проверяет `user`
3. Если `user === null` → редирект на `/login`
4. В `state` сохраняется откуда пришел: `{ from: { pathname: '/profile' } }`
5. После успешного входа → возврат на `/profile`

### MainLayout (Header)

**Файл:** [`src/components/MainLayout.tsx`](src/components/MainLayout.tsx)

```typescript
export function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <header>
      <nav>
        {user ? (
          <>
            <NavLink to="/profile">Личный кабинет</NavLink>
            <span>{user.email}</span>
            <button onClick={logout}>Выйти</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Войти</NavLink>
            <NavLink to="/register">Регистрация</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
```

### Тестирование полного флоу

#### Сценарий 1: Защита маршрутов

1. Откройте `http://localhost:5173` (без авторизации)
2. В шапке видно: "Войти" | "Регистрация"
3. Перейдите на `http://localhost:5173/profile`
4. **Автоматический редирект** на `/login`
5. Войдите
6. **Автоматический возврат** на `/profile`
7. В шапке видно: "Личный кабинет" | `test@example.com` | "Выйти"

#### Сценарий 2: Выход

1. Нажмите "Выйти"
2. DevTools → Application → Local Storage → ключ `token` удален
3. Шапка обновилась: снова "Войти" | "Регистрация"
4. Попытка зайти на `/profile` → редирект на `/login`

#### Сценарий 3: Обновление страницы

1. Войдите в систему
2. Перейдите на `/profile`
3. Обновите страницу (F5)
4. DevTools → Network → запрос `GET /api/users/me` с токеном
5. **Сессия восстановлена** → остаемся на `/profile`

---

## Инструменты разработчика: Что смотреть?

### 1. Network (Сеть)

**Вход (Login):**

- Request URL: `http://localhost:5173/api/auth/jwt/login`
- Request Method: `POST`
- Request Headers:

  ```
  Content-Type: application/x-www-form-urlencoded
  ```

- Form Data:

  ```
  username: test@example.com
  password: 123
  ```

- Response:

  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
  ```

**Проверка профиля:**

- Request URL: `http://localhost:5173/api/users/me`
- Request Method: `GET`
- Request Headers:

  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

- Response:

  ```json
  {
    "id": "uuid-string",
    "email": "test@example.com",
    "is_active": true,
    "is_superuser": false,
    "is_verified": false
  }
  ```

### 2. Application → Local Storage

```
Key: token
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Console

```javascript
// Проверить текущее состояние
localStorage.getItem('token')

// Декодировать JWT (осторожно, в продакшене не делать!)
JSON.parse(atob(localStorage.getItem('token').split('.')[1]))
```

### 4. React DevTools

- Найдите компонент `AuthProvider`
- В `hooks` → `State` должны быть:

  ```
  user: {email: "test@example.com", ...}
  isLoading: false
  ```

---

## Частые ошибки и их решения

### 1. 422 Unprocessable Entity при логине

**Причина:** Отправили JSON вместо form-data

**Решение:**

```typescript
// ❌ Неправильно
body: JSON.stringify({ username, password })

// ✅ Правильно
const formData = new URLSearchParams();
formData.append('username', email);
formData.append('password', password);
```

### 2. CORS ошибка

**Причина:** Прокси не работает

**Решение:**

1. Проверьте `vite.config.ts`
2. Перезапустите dev-сервер
3. Проверьте что используете `/api` префикс

### 3. Токен не сохраняется

**Причина:** Ошибка в `login` методе контекста

**Решение:**

```typescript
const login = async (token: string) => {
  localStorage.setItem('token', token); // Не забыть!
  const userData = await authApi.getProfile(token);
  setUser(userData);
};
```

### 4. Бесконечный редирект login → login

**Причина:** `ProtectedRoute` не проверяет `isLoading`

**Решение:**

```typescript
if (isLoading) {
  return <div>Загрузка...</div>;
}
```

### 5. 401 Unauthorized при /users/me

**Причина:**

- Токен истек
- Токен неправильно передан

**Решение:**

```typescript
// Проверьте формат заголовка
Authorization: `Bearer ${token}` // Обратите внимание на пробел!
```

---

## Контрольные вопросы

1. Почему для логина используется `URLSearchParams`, а для регистрации `JSON.stringify`?
2. Что произойдет, если убрать `isLoading` проверку из `ProtectedRoute`?
3. Зачем мы проверяем токен в `useEffect` при загрузке приложения?
4. Что хранится в `localStorage` и почему это небезопасно для продакшена?
5. Как работает редирект "откуда пришел" после входа?
6. Почему прокси работает только в dev-режиме?
7. Что будет, если удалить `AuthProvider` из `App.tsx`?

---

## Дополнительные улучшения (для самостоятельной работы)

1. **Refresh Token** — автоматическое обновление истекшего токена
2. **HTTP Interceptors** — автоматическое добавление токена во все запросы
3. **Загрузочные спиннеры** — UX при проверке токена
4. **Роутинг по ролям** — разные страницы для admin/user
5. **Remember Me** — опциональное долгое хранение сессии
6. **Двухфакторная аутентификация** — OTP коды

---

## Итоговая архитектура

```
App.tsx (обернут в AuthProvider)
  │
  ├─ MainLayout (читает user из контекста)
  │   ├─ Header (отображает email/кнопки)
  │   └─ Outlet
  │
  ├─ LoginPage (вызывает authApi.login → context.login)
  ├─ RegisterPage (вызывает authApi.register)
  │
  └─ ProtectedRoute (проверяет user)
      ├─ ProfilePage
      └─ CartPage
```

**Поток данных:**

1. `authApi` → делает HTTP запросы
2. `AuthContext` → хранит `user` и управляет состоянием
3. `useAuth` → предоставляет доступ к контексту
4. Компоненты → используют `useAuth()` для чтения/изменения

---

## Коммиты (для git log)

```bash
git log --oneline
```

Вы должны увидеть:

1. `build(vite): настройка прокси сервера`
2. `feat(api): базовый клиент для HTTP запросов`
3. `feat(auth): провайдер авторизации и логика сессий`
4. `feat(pages): страницы входа и регистрации`
5. `feat(router): интеграция авторизации в навигацию`

---

## Запуск проекта

```bash
# 1. Убедитесь что бэкенд запущен
# В папке с FastAPI:
uvicorn main:app --reload

# 2. Запустите фронтенд
# В папке react-router-419:
npm run dev

# 3. Откройте браузер
http://localhost:5173
```

---

**Автор:** GitHub Copilot  
**Дата:** 19 ноября 2025 г.

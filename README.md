# SmartAd — aplikacja mobilna lokalnych ogłoszeń

Projekt realizowany w ramach przedmiotu  
**Zaawansowane Programowanie Systemów Mobilnych II**  
Akademia Tarnowska, 2025/2026

- Ivan Kasyniuk (nr albumu: 37696)
- Dmytro Zatserkivnyi (nr albumu: 37751)
- Bohdan Tsybulenko (nr albumu: 38049)

---

## Technologie

- **Frontend:** React Native z biblioteką **React** oraz **Expo** (komponenty funkcyjne, nawigacja, kontekst uwierzytelniania).
- **Backend:** Node.js, Express, MongoDB (Mongoose).

---

## Zawartość repozytorium

```
SmartAd/
├── src/                # Backend (Node.js + Express + MongoDB)
├── tests/              # Jest + Supertest
└── frontend/           # Aplikacja mobilna (React Native + Expo)
```

## Funkcje

- Rejestracja i logowanie (login / e-mail / telefon + hasło)
- Strona główna z listą ogłoszeń — **dostępna bez logowania**
- Wyszukiwanie, filtrowanie po kategorii i mieście
- Szczegóły ogłoszenia, galeria zdjęć, komentarze
- Dodawanie / edycja / usuwanie własnych ogłoszeń ze zdjęciami
- Czat ze sprzedawcą (1:1, powiązany z ogłoszeniem)
- Ulubione ogłoszenia
- Profil z edycją danych (login, e-mail, telefon, hasło)
- Prosty, nowoczesny interfejs

---

## 1. Uruchomienie backendu

```bash
cd SmartAd
npm install
cp env.example env.example
# Uzupełnij MONGODB_URI i JWT_SECRET
npm run dev
```

Serwer domyślnie: `http://localhost:5000`

### Zmienne `.env`

```
PORT=5000
MONGODB_URI=mongodb+srv://<użytkownik>:<hasło>@cluster0.xxxxx.mongodb.net/localads?retryWrites=true&w=majority
JWT_SECRET=długi_losowy_ciąg_znaków
JWT_EXPIRES_IN=7d
```

### Testy

```bash
npm test
```

---

## 2. Uruchomienie aplikacji mobilnej (Expo)

```bash
cd SmartAd/frontend
npm install
npm start
```

Sposób uruchomienia:

- **Emulator Android:** `a` (wymagane Android Studio + AVD)
- **Symulator iOS** (tylko macOS): `i`
- **Telefon:** aplikacja **Expo Go** i skan kodu QR
- **Przeglądarka:** `w`

### Adres API na urządzeniu

Domyślnie aplikacja łączy się z API pod:

- Symulator iOS: `http://localhost:5000/api`
- Emulator Android: `http://10.0.2.2:5000/api`
- Fizyczne urządzenie: ustaw IP komputera w pliku `frontend/.env` (wzorzec w `frontend/.env.example`):

```
EXPO_PUBLIC_API_URL=http://192.168.1.50:5000/api
```

Na Windows sprawdź IP poleceniem `ipconfig`. Po zmianie `.env` zrestartuj Expo: `npm start -- --clear`.

---

## 3. Endpointy API

### Autoryzacja
| Metoda | URL | Wymaga tokenu | Opis |
|--------|-----|---------------|------|
| POST | `/api/auth/register` | nie | Rejestracja |
| POST | `/api/auth/login` | nie | Logowanie |
| GET | `/api/auth/me` | tak | Bieżący użytkownik |
| PUT | `/api/auth/me` | tak | Aktualizacja profilu |

### Ogłoszenia
| Metoda | URL | Wymaga tokenu | Opis |
|--------|-----|---------------|------|
| GET | `/api/posts` | nie | Lista (wyszukiwanie, filtry, stronicowanie) |
| GET | `/api/posts/:id` | nie | Szczegóły |
| GET | `/api/posts/my` | tak | Moje ogłoszenia |
| POST | `/api/posts` | tak | Dodanie |
| PUT | `/api/posts/:id` | tak | Edycja |
| DELETE | `/api/posts/:id` | tak | Usunięcie |

### Komentarze
| Metoda | URL | Wymaga tokenu | Opis |
|--------|-----|---------------|------|
| GET | `/api/posts/:postId/comments` | nie | Lista |
| POST | `/api/posts/:postId/comments` | tak | Dodanie |
| DELETE | `/api/posts/:postId/comments/:id` | tak | Usunięcie |

### Wiadomości
| Metoda | URL | Wymaga tokenu | Opis |
|--------|-----|---------------|------|
| GET | `/api/messages/conversations` | tak | Lista rozmów |
| GET | `/api/messages/:postId/:userId` | tak | Wiadomości w wątku |
| POST | `/api/messages` | tak | Wysłanie wiadomości |

### Ulubione
| Metoda | URL | Wymaga tokenu | Opis |
|--------|-----|---------------|------|
| GET | `/api/users/favorites` | tak | Lista ulubionych |
| POST | `/api/users/favorites/:postId` | tak | Dodanie do ulubionych |
| DELETE | `/api/users/favorites/:postId` | tak | Usunięcie z ulubionych |

---

## 4. Struktura frontendu (`frontend/`)

Główne pliki: `App.js`, `index.js`, konfiguracja Expo, katalog `src/` z ekranami (`screens/`), nawigacją (`navigation/`), komponentami (`components/`), API (`api/`), kontekstem `AuthContext`, motywem (`theme.js`) i formatowaniem dat/cen (`utils/format.js`).

Interfejs użytkownika i komunikaty błędów z API są w języku **polskim**.

---

## 5. Struktura backendu (`src/`)

Modele: User, Post, Comment, Message. Kontrolery i trasy dla auth, posts, messages, users. Middleware: `auth`, `upload`, `errorHandler`. Komunikaty walidacji i odpowiedzi API są po **polsku**.

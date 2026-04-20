Projekt realizowany w ramach przedmiotu 
**Zaawansowane Programowanie Systemów Mobilnych II**  
Akademia Tarnowska, 2025/2026

- Ivan Kasyniuk (nr albumu: 37696)
- Dmytro Zatserkivnyi (nr albumu: 37751)
- Bohdan Tsybulenko (nr albumu: 38049)

---

## Uruchomienie

```bash
# 1. Klonuj repozytorium
git clone https://github.com/jpDG1/SmartAd.git
cd SmartAd/backend

# 2. Zainstaluj zależności
npm install

# 3. Skonfiguruj zmienne środowiskowe
cp .env.example .env
# Uzupełnij .env swoimi danymi (patrz niżej)

# 4. Uruchom serwer
npm run dev       # tryb deweloperski
npm start         # tryb produkcyjny
```

Serwer działa na: `http://localhost:5000`

---

## Zmienne środowiskowe (.env)

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/smartad?retryWrites=true&w=majority
JWT_SECRET=dowolny_dlug_ciag_znakow
JWT_EXPIRES_IN=7d
```

---

## Testy

```bash
npm test
```

Testy korzystają z bibliotek **Jest** i **Supertest** i łączą się bezpośrednio z bazą danych Atlas.

---

## Endpointy API

### Autoryzacja
| Metoda | URL | Auth | Opis |
|--------|-----|------|------|
| POST | `/api/auth/register` | — | Rejestracja użytkownika |
| POST | `/api/auth/login` | — | Logowanie |
| GET | `/api/auth/me` | ✅ | Dane zalogowanego użytkownika |

### Ogłoszenia
| Metoda | URL | Auth | Opis |
|--------|-----|------|------|
| GET | `/api/posts` | — | Lista ogłoszeń (filtrowanie, paginacja) |
| GET | `/api/posts/:id` | — | Szczegóły ogłoszenia |
| GET | `/api/posts/my` | ✅ | Moje ogłoszenia |
| POST | `/api/posts` | ✅ | Dodaj ogłoszenie |
| PUT | `/api/posts/:id` | ✅ | Edytuj ogłoszenie |
| DELETE | `/api/posts/:id` | ✅ | Usuń ogłoszenie |

### Komentarze
| Metoda | URL | Auth | Opis |
|--------|-----|------|------|
| GET | `/api/posts/:postId/comments` | — | Lista komentarzy |
| POST | `/api/posts/:postId/comments` | ✅ | Dodaj komentarz |
| DELETE | `/api/posts/:postId/comments/:id` | ✅ | Usuń komentarz |

### Wiadomości
| Metoda | URL | Auth | Opis |
|--------|-----|------|------|
| GET | `/api/messages/conversations` | ✅ | Lista konwersacji |
| GET | `/api/messages/:postId/:userId` | ✅ | Wiadomości z konwersacji |
| POST | `/api/messages` | ✅ | Wyślij wiadomość |

---

## Struktura projektu

```
backend/
├── src/
│   ├── index.js
│   ├── app.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Message.js
│   │   └── Comment.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── messageController.js
│   │   └── commentController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── posts.js
│   │   └── messages.js
│   └── middleware/
│       ├── auth.js
│       ├── upload.js
│       └── errorHandler.js
├── tests/
│   ├── setup.js
│   ├── auth.test.js
│   └── posts.test.js
└── uploads/
```
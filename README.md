# ☁️ CloudShare – File-Sharing-App

Eine Full-Stack-Anwendung zum Hochladen, Verwalten und Teilen von Dateien – gebaut mit
**React**, **Spring Boot**, **MongoDB** und **Tailwind CSS**.

![Java](https://img.shields.io/badge/Java-25-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-6DB33F?logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT-6DB33F?logo=springsecurity&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?logo=stripe&logoColor=white)

## Inhalt

- [Funktionen](#funktionen)
- [Technologien](#technologien)
- [Projektstruktur](#projektstruktur)
- [Voraussetzungen](#voraussetzungen)
- [Installation und Start](#installation-und-start)
- [Konfiguration](#konfiguration)
- [Zahlungen mit Stripe](#zahlungen-mit-stripe)
- [REST-API](#rest-api)
- [Backend-Architektur](#backend-architektur)
- [Sicherheit](#sicherheit)

## Funktionen

- **Registrierung und Login** mit Spring Security und JWT; Passwörter werden mit BCrypt gehasht
- **Mehrfach-Upload** per Drag-and-drop (bis zu 5 Dateien gleichzeitig, max. 50 MB pro Datei) mit Fortschrittsanzeige
- **Meine Dateien**: Listen- und Rasteransicht, Suche, Download, Löschen
- **Teilen per Link**: Jede Datei ist zunächst privat und kann mit einem Klick öffentlich gemacht werden.
  Öffentliche Dateien lassen sich über `/file/:id` ohne Anmeldung herunterladen.
- **Credit-System**: 5 Gratis-Credits bei der Registrierung, jeder Upload kostet 1 Credit.
  Credits werden atomar abgebucht und bei einem Fehler zurückerstattet.
- **Credit-Pakete** (Basic, Premium, Ultimate) mit Bezahlung über Stripe Checkout
- **Demo-Zahlungsmodus**, wenn kein Stripe-Schlüssel gesetzt ist – ideal für die lokale Entwicklung
- **Transaktionsverlauf** aller Käufe
- **Dashboard** mit Statistiken (Credits, Anzahl Dateien, geteilte Dateien, Speicherverbrauch)
- Responsives Layout für Desktop und Smartphone

## Technologien

| Bereich | Technologie |
|---|---|
| Backend | Java 25, Spring Boot 4.1, Spring Web MVC, Spring Data MongoDB, Spring Security, Bean Validation, Lombok |
| Authentifizierung | JWT (jjwt 0.13), BCrypt |
| Datenbank | MongoDB |
| Zahlungen | Stripe Java SDK (Checkout Sessions) |
| Frontend | React 19, Vite 8, React Router 7, Axios |
| Styling | Tailwind CSS 4, lucide-react (Icons) |
| UI-Feedback | react-hot-toast |
| Build | Maven (Wrapper), npm |

## Projektstruktur

```
File_Sharing/
├── cloudShareAPI/   Spring-Boot-Backend (REST-API, Port 8080)
└── cloudShareWeb/   React-Frontend (Vite, Port 5173)
```

## Voraussetzungen

- JDK 25 oder neuer
- Node.js 20 oder neuer
- MongoDB (lokal unter `mongodb://127.0.0.1:27017` oder MongoDB Atlas)

## Installation und Start

### 1. MongoDB starten

Unter Windows (PowerShell als Administrator):

```powershell
Start-Service MongoDB
```

Die Datenbank `cloudshare` wird beim ersten Speichern automatisch angelegt.

### 2. Backend starten

```bash
cd cloudShareAPI
./mvnw spring-boot:run
```

Die API läuft anschließend unter `http://localhost:8080/api`.

### 3. Frontend starten

```bash
cd cloudShareWeb
npm install
cp .env.example .env
npm run dev
```

Die App ist unter `http://localhost:5173` erreichbar.

## Konfiguration

Das Backend liest seine Einstellungen aus `cloudShareAPI/src/main/resources/application.properties`.
Alle wichtigen Werte lassen sich über Umgebungsvariablen überschreiben:

| Variable | Standardwert | Beschreibung |
|---|---|---|
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/cloudshare` | Verbindung zur MongoDB |
| `JWT_SECRET` | Entwicklungsschlüssel | **In Produktion unbedingt ändern** (mind. 32 Zeichen) |
| `STRIPE_SECRET_KEY` | leer | Leer = Demo-Zahlungsmodus |
| `FRONTEND_URL` | `http://localhost:5173` | Für CORS und die Rückleitung nach der Zahlung |
| `UPLOAD_DIR` | `uploads` | Ordner, in dem die Dateien gespeichert werden |

Im Frontend wird die API-Adresse in `cloudShareWeb/.env` festgelegt:

```
VITE_API_URL=http://localhost:8080/api
```

## Zahlungen mit Stripe

1. Im Stripe-Dashboard unter **Developers → API keys** den Test-Schlüssel `sk_test_...` kopieren.
2. Den Schlüssel als Umgebungsvariable `STRIPE_SECRET_KEY` setzen und das Backend neu starten.
3. Mit der Testkarte `4242 4242 4242 4242`, einem beliebigen zukünftigen Ablaufdatum und einer beliebigen CVC bezahlen.

Nach erfolgreicher Zahlung leitet Stripe auf `/payment/success` zurück. Das Frontend bestätigt die Zahlung
beim Backend, das den Status direkt bei Stripe prüft und die Credits gutschreibt. Eine Zahlung wird nur
einmal gutgeschrieben, auch wenn die Bestätigung mehrfach aufgerufen wird.

Ohne Schlüssel läuft die App im **Demo-Modus**: „Jetzt kaufen“ schreibt die Credits ohne echte Zahlung gut.

## REST-API

| Methode | Pfad | Login | Beschreibung |
|---|---|---|---|
| POST | `/api/auth/register` | – | Registrierung, liefert Token |
| POST | `/api/auth/login` | – | Login, liefert Token |
| GET | `/api/auth/me` | ✓ | Aktueller Benutzer inkl. Credits |
| POST | `/api/files` | ✓ | Upload (multipart, Feldname `files`) |
| GET | `/api/files` | ✓ | Eigene Dateien |
| GET | `/api/files/{id}/download` | ✓ | Datei herunterladen |
| PATCH | `/api/files/{id}/visibility` | ✓ | Sichtbarkeit ändern: `{"isPublic": true}` |
| DELETE | `/api/files/{id}` | ✓ | Datei löschen |
| GET | `/api/public/files/{id}` | – | Infos zu einer öffentlichen Datei |
| GET | `/api/public/files/{id}/download` | – | Öffentliche Datei herunterladen |
| GET | `/api/payments/plans` | – | Credit-Pakete |
| POST | `/api/payments/checkout` | ✓ | `{"planId": "basic"}` → Zahlungslink |
| POST | `/api/payments/verify` | ✓ | `{"sessionId": "..."}` → Credits gutschreiben |
| GET | `/api/payments/transactions` | ✓ | Transaktionsverlauf |

Geschützte Endpunkte erwarten den Header `Authorization: Bearer <token>`.

## Backend-Architektur

```
com.backend
├── config/      AppProperties, SecurityConfig (JWT-Filter, CORS)
├── security/    JwtService, JwtAuthFilter
├── document/    UserDocument, FileDocument, PaymentTransaction (MongoDB-Collections)
├── repository/  Spring-Data-MongoDB-Repositories
├── dto/         Request- und Response-Records
├── service/     AuthService, UserService (Credits), FileService, StorageService, PaymentService
├── controller/  Auth-, File-, PublicFile- und Payment-Controller
└── exception/   ApiException, GlobalExceptionHandler
```

## Sicherheit

- Zustandslose Authentifizierung mit JWT, Passwörter mit BCrypt
- Private Dateien sind nur für den Besitzer sichtbar; über den öffentlichen Endpunkt liefern sie `404`
- Gespeicherte Dateinamen sind zufällige UUIDs; Pfade werden gegen Path-Traversal geprüft
- Credits werden mit atomaren MongoDB-Updates abgebucht, damit der Kontostand nie negativ wird
- CORS ist auf die Frontend-URL beschränkt

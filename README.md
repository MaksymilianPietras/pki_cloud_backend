# 1. Projekt znajduje się na platformie GitHub: https://github.com/MaksymilianPietras/pki_cloud_backend
# 2. Aplikacja została zdeployowana na platformie render: https://dashboard.render.com/web/srv-cosfu2ev3ddc73dpaef0/deploys/dep-cot72aicn0vc73a7hmmg?r=2024-05-07%4018%3A20%3A30~2024-05-07%4018%3A24%3A08

## 3. Przed uruchomieniem projektu należy wykonać polecenie: npm install, aby pobrać niezbędne paczki

# Środowisko uruchomieniowe Node.js, Express.js

# Struktura projektu

## Zależności:

- googleapis -> api umożliwiające zalogowanie się poprzez konto google
- axios -> biblioteka JavaScript umożliwiająca wykonywanie żądań typu REST, w projekcie wykorzystana do autoryzacji w zewnętrznych serwisach
- express -> framework w języku JavaScript, który umożliwia tworzenie backendu aplikacji

## Konfiguracja:
- google_key.json -> plik zawierający informacje autoryzacyjne użytkownika takie jak id klienta, czy id projektu (plik wykorzystany do autoryzacji w przypadku konta google)
- github_key.json -> plik analogiczny jak google_key.json, z tym, że zawiera dane autoryzacyjne dla githuba
- zestaw danych: CLIENT_ID, CLIENT_SECRET, REDIRECT_URL -> poszczególne dane z wyżej wymienionych plików, niezbędne do autoryzacji i autentykacji klienta

## Endpointy:
- podstawowy endpoint "/" -> wyświetlenie panelu umożliwiającego zalogowanie się poprzez konto google, bądź github

- "/login" -> endpoint umożliwiający zalogowanie się poprzez konto google

- "/github/login" -> analogiczny endpoint do logowania dla konta github

- "/auth/google/callback" -> funkcja wywołania zwrotnego, która generuje token dostępu na bazie otrzymanego kodu autoryzacyjnego

- "/github/callback" -> endpoint analogiczny do "/auth/google/callback", generuje token dostępu dla konta github

- "/success" -> ednpoint wywoływany po pomyślnym zalogowaniu do githuba, wyświetla dane zalogowanego użytkownika, a także tabelę z użytkownikami, którzy wcześniej się logowali

- w przypadku konta google, obsługa zdarzenia po autoryzacji z sukcesem, akcja podejmowana jest w endpointcie "/login", to właśnie tam generowane są: dane zalogowanego użytkownika i tabela z użytkownikami, którzy wcześniej się logowali (jak w przypadku konta github)

- "/logout" -> endpoint służący do wylogowania się z konta google, polega na wywołaniu wbudowanej funkcji w api google'a, która czyści wszystkie credentiale użytkownika

- "/github/logout" -> funkcja ustawia wartość tokena dostępu na pusty string, czyli też zajmuje się czyszczeniem danych autoryzacyjnych użytkownika (w tym przypdaku dla konta github)
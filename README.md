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
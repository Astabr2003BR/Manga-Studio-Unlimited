# Android — Capacitor

## Estado
A integração Capacitor está configurada para gerar um APK de depuração pelo GitHub Actions. O APK não está assinado para distribuição e ainda precisa de validação em aparelho físico.

## Identidade
- Nome: Manga Studio Unlimited
- Application ID: com.astabr.mangastudiounlimited
- Web bundle: dist/
- Mixed content: desativado

## Ambiente local
Requisitos documentados pelo Capacitor:
- Node.js 22 ou superior para Capacitor 8.
- Android Studio compatível com Capacitor 8.
- Android SDK instalado, com plataforma API 24 ou superior.

## Preparar o projeto
Na raiz do repositório:
1. npm install
2. npm run build
3. npx cap add android
4. npx cap sync android
5. npx cap open android

Depois que a pasta android/ existir, para sincronizar alterações:
- npm run android:sync

Para compilar APK debug em ambiente Android configurado:
- npm run android:build:debug

Saída:
- android/app/build/outputs/apk/debug/app-debug.apk

## GitHub Actions
O workflow .github/workflows/android-apk.yml:
- executa testes;
- compila a aplicação web;
- gera o projeto Android;
- sincroniza Capacitor;
- executa Gradle assembleDebug;
- disponibiliza o APK como artefato por 14 dias.

O artefato é somente debug. Não publicar na Play Store nem distribuir como versão final sem configurar assinatura, política de privacidade, permissões mínimas e validação de release.

## Limitações e testes pendentes
- APK ainda não foi compilado nesta entrega.
- Não foi testado em telefone físico.
- Não há assinatura release.
- Não há permissões Android extras.
- O app depende do WebView do Android; armazenamento local usa IndexedDB.
- A primeira abertura requer instalação normal do APK; o uso posterior do editor não depende de API remota.

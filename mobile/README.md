# Mobile (Flutter)

Flutter application targeting Android and Windows.

Build with a hosted API (the API connects to PostgreSQL):

```powershell
flutter pub get
flutter build apk --release --dart-define=API_BASE_URL=https://api.example.com/api
flutter build windows --release --dart-define=API_BASE_URL=https://api.example.com/api
```

From the repository root, use `scripts/build_android.ps1 -ApiBaseUrl ...` or `scripts/build_windows.ps1 -ApiBaseUrl ...`.

Key tasks:

- Implement Material 3 UI, Riverpod, GoRouter
- Authentication, projects directory, assistance requests, scholarships, donations, volunteer flows
- Integration with backend REST API
- Firebase Cloud Messaging setup for push notifications

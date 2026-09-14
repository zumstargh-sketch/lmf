import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'api.dart';
import 'pages/account_page.dart';
import 'pages/assistance_page.dart';
import 'pages/donate_page.dart';
import 'pages/home_page.dart';
import 'pages/projects_page.dart';

void main() {
  runApp(const ProviderScope(child: LordinaApp()));
}

class LordinaApp extends ConsumerStatefulWidget {
  const LordinaApp({super.key});

  @override
  ConsumerState<LordinaApp> createState() => _LordinaAppState();
}

class _LordinaAppState extends ConsumerState<LordinaApp> {
  @override
  void initState() {
    super.initState();
    // Restore a saved donor session (if any) when the app starts.
    Future<void>.microtask(() => ref.read(sessionProvider.notifier).restore());
  }

  @override
  Widget build(BuildContext context) {
    final router = GoRouter(routes: [
      GoRoute(path: '/', builder: (context, state) => const HomePage()),
      GoRoute(path: '/projects', builder: (context, state) => const ProjectsPage()),
      GoRoute(path: '/assistance', builder: (context, state) => const AssistancePage()),
      GoRoute(path: '/donate', builder: (context, state) => const DonatePage()),
      GoRoute(
        path: '/account',
        builder: (context, state) => AccountPage(startInSignUp: state.uri.queryParameters['mode'] == 'register'),
      ),
    ]);

    return MaterialApp.router(
      title: 'Lordina Foundation',
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Roboto',
        colorSchemeSeed: const Color(0xFF176B5B),
        scaffoldBackgroundColor: const Color(0xFFF4F1EA),
        inputDecorationTheme: const InputDecorationTheme(border: OutlineInputBorder()),
      ),
      // The app is English only.
      locale: const Locale('en'),
      supportedLocales: const [Locale('en')],
      routerConfig: router,
      builder: (context, child) {
        final mediaQuery = MediaQuery.of(context);
        final clampedScaler = mediaQuery.textScaler.clamp(minScaleFactor: 1.0, maxScaleFactor: 1.3);
        // Keep text readable without letting large system font settings push
        // content off the screen.
        Widget content = MediaQuery(
          data: mediaQuery.copyWith(textScaler: clampedScaler),
          child: child ?? const SizedBox.shrink(),
        );
        // Render the app exactly like on Android, even on a PC: no desktop
        // scrollbars, and on wide windows the whole UI sits in a phone-width
        // column so both platforms show the same frontend.
        content = ScrollConfiguration(
          behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
          child: content,
        );
        const phoneWidth = 480.0;
        if (mediaQuery.size.width > phoneWidth) {
          content = ColoredBox(
            color: const Color(0xFFE3DED2),
            child: Align(
              alignment: Alignment.topCenter,
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: phoneWidth),
                child: MediaQuery(
                  data: mediaQuery.copyWith(
                    size: Size(phoneWidth, mediaQuery.size.height),
                    textScaler: clampedScaler,
                  ),
                  child: content,
                ),
              ),
            ),
          );
        }
        return content;
      },
    );
  }
}
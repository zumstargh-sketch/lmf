import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import 'api.dart';
import 'pages/assistant_sheet.dart';

/// Shared page chrome: AppBar with the foundation's official logo and the
/// bottom navigation bar used by every page.
class AppScaffold extends StatelessWidget {
  final String title;
  final int selected;
  final Widget child;

  const AppScaffold({required this.title, required this.selected, required this.child, super.key});

  static const List<String> _routes = ['/', '/projects', '/assistance', '/donate', '/account'];

  static Future<WhatsappConfig>? _whatsappFuture;
  static bool _whatsappFailed = false;

  /// Loads the WhatsApp configuration once per app run (server-managed).
  static Future<WhatsappConfig> _loadWhatsappConfig() {
    if (_whatsappFuture == null || _whatsappFailed) {
      _whatsappFailed = false;
      _whatsappFuture = ApiClient().whatsappConfig().catchError((Object _) {
        _whatsappFailed = true;
        return const WhatsappConfig(enabled: false);
      });
    }
    return _whatsappFuture!;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        centerTitle: false,
        title: Row(
          children: [
            const _BrandLogo(),
            const SizedBox(width: 10),
            Flexible(
              child: Text(
                title,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
        actions: [
          FutureBuilder<WhatsappConfig>(
            future: _loadWhatsappConfig(),
            builder: (context, snapshot) {
              final config = snapshot.data;
              final link = config?.chatLink;
              if (config == null || !config.enabled || link == null) {
                return const SizedBox.shrink();
              }
              return IconButton(
                tooltip: 'Chat on WhatsApp',
                icon: const Icon(Icons.chat_outlined),
                color: const Color(0xFF25D366),
                onPressed: () async {
                  try {
                    await launchUrl(Uri.parse(link), mode: LaunchMode.externalApplication);
                  } catch (_) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Could not open WhatsApp on this device.')),
                      );
                    }
                  }
                },
              );
            },
          ),
          const SizedBox(width: 4),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        tooltip: 'AI Assistant',
        onPressed: () => showAssistantSheet(context),
        icon: const Icon(Icons.smart_toy_outlined),
        label: const Text('Ask AI'),
      ),
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selected,
        onDestinationSelected: (index) {
          if (index >= 0 && index < _routes.length) context.go(_routes[index]);
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.volunteer_activism_outlined), label: 'Projects'),
          NavigationDestination(icon: Icon(Icons.support_agent_outlined), label: 'Assistance'),
          NavigationDestination(icon: Icon(Icons.favorite_border), label: 'Donate'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Account'),
        ],
      ),
    );
  }
}

/// The foundation's official logo. If the asset ever fails to decode, a neutral
/// monogram is shown instead so it can never appear as a broken image.
class _BrandLogo extends StatelessWidget {
  const _BrandLogo();

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/branding/logo.png',
      height: 36,
      fit: BoxFit.contain,
      errorBuilder: (context, error, stackTrace) => Container(
        width: 34,
        height: 34,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.primary,
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Text(
          'L',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18),
        ),
      ),
    );
  }
}
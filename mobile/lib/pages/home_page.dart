import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../shell.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return const AppScaffold(
      title: 'Lordina Foundation',
      selected: 0,
      child: HomeContent(),
    );
  }
}

class HomeContent extends StatelessWidget {
  const HomeContent({super.key});

  @override
  Widget build(BuildContext context) => SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(
            'Together, communities thrive.',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          const Text('Support practical projects and connect people to the help they need.'),
          const SizedBox(height: 24),
          _ActionCard(
            icon: Icons.map_outlined,
            title: 'Explore our work',
            description: 'See projects making an impact across Ghana.',
            onTap: () => context.go('/projects'),
          ),
          _ActionCard(
            icon: Icons.support_agent,
            title: 'Request assistance',
            description: 'Tell us what support you or your community needs.',
            onTap: () => context.go('/assistance'),
          ),
          _ActionCard(
            icon: Icons.favorite,
            title: 'Make a difference',
            description: 'Start a secure donation for a cause you care about.',
            onTap: () => context.go('/donate'),
          ),
        ]),
      );
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final VoidCallback onTap;

  const _ActionCard({required this.icon, required this.title, required this.description, required this.onTap});

  @override
  Widget build(BuildContext context) => Card(
        margin: const EdgeInsets.only(bottom: 14),
        child: ListTile(
          contentPadding: const EdgeInsets.all(16),
          leading: CircleAvatar(child: Icon(icon)),
          title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          subtitle: Padding(padding: const EdgeInsets.only(top: 6), child: Text(description)),
          trailing: const Icon(Icons.arrow_forward),
          onTap: onTap,
        ),
      );
}
import 'package:flutter/material.dart';

import '../api.dart';
import '../shell.dart';

class ProjectsPage extends StatelessWidget {
  const ProjectsPage({super.key});

  @override
  Widget build(BuildContext context) => AppScaffold(
        title: 'Our Projects',
        selected: 1,
        child: FutureBuilder<List<dynamic>>(
          future: ApiClient().projects(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return const _ErrorState();
            }
            final projects = snapshot.data ?? const [];
            if (projects.isEmpty) {
              return const Center(child: Text('Projects will appear here soon.'));
            }
            return ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
              itemCount: projects.length,
              itemBuilder: (context, index) {
                final project = projects[index] as Map<String, dynamic>;
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    title: Text(
                      project['title']?.toString() ?? 'Untitled project',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text('${project['region'] ?? 'Ghana'}  •  ${project['status'] ?? 'active'}'),
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => _showProject(context, project),
                  ),
                );
              },
            );
          },
        ),
      );
}

/// Project details sheet. The content is scrollable inside a safe area, so
/// long descriptions stay fully readable on any screen size.
void _showProject(BuildContext context, Map<String, dynamic> project) {
  final theme = Theme.of(context);
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
    builder: (sheetContext) => SafeArea(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.75),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                project['title']?.toString() ?? 'Project',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  Chip(label: Text(project['category']?.toString() ?? 'Community project')),
                  Chip(label: Text(project['region']?.toString() ?? 'Ghana')),
                  Chip(label: Text(project['status']?.toString() ?? 'active')),
                  if (project['beneficiaries'] != null)
                    Chip(label: Text('${project['beneficiaries']} beneficiaries')),
                ],
              ),
              const SizedBox(height: 16),
              Text(project['description']?.toString() ?? 'This project is creating lasting change in its community.'),
            ],
          ),
        ),
      ),
    ),
  );
}

class _ErrorState extends StatelessWidget {
  const _ErrorState();

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'The service is unavailable right now.\nPlease check your connection and try again.',
            textAlign: TextAlign.center,
          ),
        ),
      );
}
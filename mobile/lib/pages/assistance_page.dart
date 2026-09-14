import 'package:flutter/material.dart';

import '../api.dart';
import '../shell.dart';

class AssistancePage extends StatefulWidget {
  const AssistancePage({super.key});

  @override
  State<AssistancePage> createState() => _AssistancePageState();
}

class _AssistancePageState extends State<AssistancePage> {
  final name = TextEditingController();
  final phone = TextEditingController();
  final email = TextEditingController();
  final category = TextEditingController();
  final description = TextEditingController();
  bool submitting = false;

  @override
  void dispose() {
    name.dispose();
    phone.dispose();
    email.dispose();
    category.dispose();
    description.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    if (name.text.trim().isEmpty || phone.text.trim().isEmpty || category.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Name, phone, and category are required.')),
      );
      return;
    }
    setState(() => submitting = true);
    try {
      await ApiClient().submitAssistance({
        'fullName': name.text.trim(),
        'phone': phone.text.trim(),
        'email': email.text.trim(),
        'category': category.text.trim(),
        'description': description.text.trim(),
      });
      if (!mounted) return;
      name.clear();
      phone.clear();
      email.clear();
      category.clear();
      description.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Request submitted. We will be in touch.')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not reach the foundation service. Please try again.')),
      );
    } finally {
      if (mounted) setState(() => submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => AppScaffold(
        title: 'Request Assistance',
        selected: 2,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 96),
          children: [
            const Text('We are here to listen. Share a few details and our team will review your request.'),
            const SizedBox(height: 20),
            TextField(controller: name, textInputAction: TextInputAction.next, decoration: const InputDecoration(labelText: 'Full name')),
            const SizedBox(height: 12),
            TextField(controller: phone, keyboardType: TextInputType.phone, textInputAction: TextInputAction.next, decoration: const InputDecoration(labelText: 'Phone number')),
            const SizedBox(height: 12),
            TextField(controller: email, keyboardType: TextInputType.emailAddress, textInputAction: TextInputAction.next, decoration: const InputDecoration(labelText: 'Email (optional)')),
            const SizedBox(height: 12),
            TextField(controller: category, textInputAction: TextInputAction.next, decoration: const InputDecoration(labelText: 'What do you need help with?')),
            const SizedBox(height: 12),
            TextField(controller: description, maxLines: 4, decoration: const InputDecoration(labelText: 'Tell us more (optional)')),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: submitting ? null : submit,
              icon: submitting
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.send),
              label: Text(submitting ? 'Sending...' : 'Submit request'),
            ),
          ],
        ),
      );
}
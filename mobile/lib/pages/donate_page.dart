import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../api.dart';
import '../shell.dart';

/// Donations are tied to donor accounts: visitors must create an account or
/// sign in before they can give.
class DonatePage extends ConsumerStatefulWidget {
  const DonatePage({super.key});

  @override
  ConsumerState<DonatePage> createState() => _DonatePageState();
}

class _DonatePageState extends ConsumerState<DonatePage> {
  final amount = TextEditingController();
  bool submitting = false;

  @override
  void dispose() {
    amount.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    final session = ref.read(sessionProvider);
    final user = session.user;
    if (user == null) return;

    final value = double.tryParse(amount.text.trim().replaceAll(',', ''));
    if (value == null || value <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid donation amount.')),
      );
      return;
    }

    setState(() => submitting = true);
    try {
      final result = await ApiClient(token: session.token).startDonation(
        amount: value,
        currency: 'GHS',
        name: user.name,
        email: user.email,
        phone: user.phone,
      );
      if (!mounted) return;
      String reference = 'created';
      final dynamic donation = result['donation'];
      if (donation is Map && donation['reference'] != null) {
        reference = donation['reference'].toString();
      } else if (result['reference'] != null) {
        reference = result['reference'].toString();
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Thank you! Donation reference: $reference.')),
      );
      amount.clear();
    } on ApiError catch (error) {
      if (!mounted) return;
      if (error.statusCode == 401) {
        // Session expired: sign out so the account gate is shown again.
        await ref.read(sessionProvider.notifier).signOut();
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.message)));
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
  Widget build(BuildContext context) {
    final session = ref.watch(sessionProvider);
    return AppScaffold(
      title: 'Give Support',
      selected: 3,
      child: !session.ready
          ? const Center(child: CircularProgressIndicator())
          : session.isAuthenticated
              ? _DonationForm(
                  user: session.user!,
                  amount: amount,
                  submitting: submitting,
                  onSubmit: submit,
                )
              : const _AccountGate(),
    );
  }
}

class _AccountGate extends StatelessWidget {
  const _AccountGate();

  @override
  Widget build(BuildContext context) => Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 96),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            CircleAvatar(
              radius: 32,
              backgroundColor: Theme.of(context).colorScheme.primaryContainer,
              child: Icon(Icons.lock_person, size: 32, color: Theme.of(context).colorScheme.primary),
            ),
            const SizedBox(height: 16),
            Text(
              'Donating needs an account',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'Create your free donor account (or sign in) so every gift is recorded safely in your name.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: () => context.go('/account?mode=register'),
                icon: const Icon(Icons.person_add_alt_1),
                label: const Text('Create an account'),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => context.go('/account'),
                child: const Text('I already have an account'),
              ),
            ),
          ]),
        ),
      );
}

class _DonationForm extends StatelessWidget {
  final UserProfile user;
  final TextEditingController amount;
  final bool submitting;
  final VoidCallback onSubmit;

  const _DonationForm({
    required this.user,
    required this.amount,
    required this.submitting,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 96),
      children: [
        Text(
          'Your generosity helps turn plans into progress.',
          style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 20),
        Card(
          child: ListTile(
            leading: CircleAvatar(child: Text(_initials(user))),
            title: Text(user.name.isEmpty ? 'Donor' : user.name),
            subtitle: Text(user.email),
            trailing: const Icon(Icons.verified_user_outlined),
          ),
        ),
        const SizedBox(height: 20),
        TextField(
          controller: amount,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: const InputDecoration(labelText: 'Amount', prefixText: 'GHS '),
        ),
        const SizedBox(height: 20),
        FilledButton.icon(
          onPressed: submitting ? null : onSubmit,
          icon: const Icon(Icons.lock_outline),
          label: Text(submitting ? 'Starting...' : 'Continue securely'),
        ),
        const SizedBox(height: 12),
        Text(
          'Payments are processed securely and recorded under your account.',
          textAlign: TextAlign.center,
          style: theme.textTheme.bodySmall,
        ),
      ],
    );
  }
}

String _initials(UserProfile user) {
  final source = user.name.trim().isNotEmpty ? user.name.trim() : user.email;
  final parts = source.trim().split(RegExp(r'\s+'));
  if (parts.isEmpty || parts.first.isEmpty) return '?';
  if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
  return (parts.first.substring(0, 1) + parts.last.substring(0, 1)).toUpperCase();
}
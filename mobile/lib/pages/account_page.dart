import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api.dart';
import '../shell.dart';

class AccountPage extends ConsumerStatefulWidget {
  final bool startInSignUp;

  const AccountPage({super.key, this.startInSignUp = false});

  @override
  ConsumerState<AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends ConsumerState<AccountPage> {
  static final RegExp _emailPattern = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

  late bool signUpMode = widget.startInSignUp;
  final name = TextEditingController();
  final email = TextEditingController();
  final phone = TextEditingController();
  final password = TextEditingController();
  bool busy = false;
  String? error;

  @override
  void dispose() {
    name.dispose();
    email.dispose();
    phone.dispose();
    password.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    final trimmedEmail = email.text.trim();
    final trimmedName = name.text.trim();
    if (signUpMode) {
      if (trimmedName.isEmpty || !_emailPattern.hasMatch(trimmedEmail) || password.text.length < 6) {
        setState(() => error = 'Add your full name, a valid email, and a password with at least 6 characters.');
        return;
      }
    } else if (!_emailPattern.hasMatch(trimmedEmail) || password.text.isEmpty) {
      setState(() => error = 'Enter your email address and password.');
      return;
    }

    setState(() {
      busy = true;
      error = null;
    });
    try {
      final session = ref.read(sessionProvider.notifier);
      if (signUpMode) {
        await session.signUp(name: trimmedName, email: trimmedEmail, password: password.text, phone: phone.text.trim());
      } else {
        await session.signIn(email: trimmedEmail, password: password.text);
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(signUpMode ? 'Account created. Welcome to the foundation!' : 'Welcome back!')),
      );
    } on ApiError catch (apiError) {
      if (!mounted) return;
      setState(() => error = apiError.message);
    } catch (_) {
      if (!mounted) return;
      setState(() => error = 'Could not reach the foundation service. Please try again.');
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> signOut() async {
    await ref.read(sessionProvider.notifier).signOut();
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Signed out.')));
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(sessionProvider);
    return AppScaffold(
      title: 'My Account',
      selected: 4,
      child: !session.ready
          ? const Center(child: CircularProgressIndicator())
          : session.isAuthenticated
              ? _profileView(session)
              : _authForm(),
    );
  }

  Widget _authForm() {
    final theme = Theme.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 96),
      children: [
        Text('Donor account', style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        const Text('Create your free donor account or sign in. Your donations are always tied to your account.'),
        const SizedBox(height: 20),
        SegmentedButton<bool>(
          segments: const [
            ButtonSegment(value: false, label: Text('Sign in'), icon: Icon(Icons.login)),
            ButtonSegment(value: true, label: Text('Create account'), icon: Icon(Icons.person_add_alt_1)),
          ],
          selected: {signUpMode},
          onSelectionChanged: (selection) => setState(() {
            signUpMode = selection.first;
            error = null;
          }),
        ),
        const SizedBox(height: 20),
        if (signUpMode) ...[
          TextField(
            controller: name,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(labelText: 'Full name'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: phone,
            keyboardType: TextInputType.phone,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(labelText: 'Phone number (optional)'),
          ),
          const SizedBox(height: 12),
        ],
        TextField(
          controller: email,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
          decoration: const InputDecoration(labelText: 'Email address'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: password,
          obscureText: true,
          onSubmitted: (_) => submit(),
          decoration: const InputDecoration(labelText: 'Password'),
        ),
        const SizedBox(height: 12),
        if (error != null) ...[
          Text(error!, style: TextStyle(color: theme.colorScheme.error)),
          const SizedBox(height: 8),
        ],
        FilledButton.icon(
          onPressed: busy ? null : submit,
          icon: busy
              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
              : Icon(signUpMode ? Icons.person_add_alt_1 : Icons.login),
          label: Text(busy
              ? (signUpMode ? 'Creating account...' : 'Signing in...')
              : (signUpMode ? 'Create my account' : 'Sign in')),
        ),
        const SizedBox(height: 12),
        const Text(
          'The foundation may contact you about your donations and requests.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 12),
        ),
      ],
    );
  }

  Widget _profileView(SessionState session) {
    final theme = Theme.of(context);
    final user = session.user!;
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 96),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(children: [
              CircleAvatar(
                radius: 30,
                child: Text(
                  _initials(user),
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                user.name.isEmpty ? 'Donor' : user.name,
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(user.email, style: theme.textTheme.bodySmall),
              if ((user.phone ?? '').isNotEmpty) Text(user.phone!, style: theme.textTheme.bodySmall),
            ]),
          ),
        ),
        const SizedBox(height: 20),
        Card(
          child: ListTile(
            leading: const Icon(Icons.favorite_outline),
            title: const Text('Donations'),
            subtitle: const Text('Every gift you give is recorded under this account.'),
          ),
        ),
        const SizedBox(height: 20),
        OutlinedButton.icon(
          onPressed: busy ? null : signOut,
          icon: const Icon(Icons.logout),
          label: const Text('Sign out'),
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
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../api.dart';

/// Opens the floating AI assistant as a bottom sheet. Available on every page.
Future<void> showAssistantSheet(BuildContext context) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
    builder: (_) => const _AssistantSheet(),
  );
}

class _Message {
  final String text;
  final bool fromUser;
  final String? source;

  const _Message({required this.text, required this.fromUser, this.source});
}

class _AssistantSheet extends StatefulWidget {
  const _AssistantSheet();

  @override
  State<_AssistantSheet> createState() => _AssistantSheetState();
}

class _AssistantSheetState extends State<_AssistantSheet> {
  final TextEditingController _input = TextEditingController();
  final ScrollController _scroll = ScrollController();
  final List<_Message> _messages = [
    const _Message(
      text:
          "Hi! 👋 I'm the Lordina Foundation assistant. Ask me anything about donating, requesting assistance, volunteering or our projects.",
      fromUser: false,
    ),
  ];
  List<String> _suggestions = [];
  WhatsappConfig _whatsapp = const WhatsappConfig(enabled: false);
  bool _thinking = false;

  @override
  void initState() {
    super.initState();
    _loadExtras();
  }

  Future<void> _loadExtras() async {
    try {
      final suggestions = await ApiClient().assistantSuggestions();
      if (mounted) setState(() => _suggestions = suggestions);
    } catch (_) {
      // Suggestions are optional decoration.
    }
    try {
      final config = await ApiClient().whatsappConfig();
      if (mounted) setState(() => _whatsapp = config);
    } catch (_) {
      // WhatsApp button is optional decoration.
    }
  }

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _send(String text) async {
    final question = text.trim();
    if (question.isEmpty || _thinking) return;
    _input.clear();
    setState(() {
      _messages.add(_Message(text: question, fromUser: true));
      _thinking = true;
    });
    _jumpToBottom();
    String answer;
    String? source;
    try {
      final reply = await ApiClient().askAssistant(question);
      answer = reply.answer;
      source = reply.source;
      if (reply.suggestions.isNotEmpty && _suggestions.isEmpty) {
        _suggestions = reply.suggestions;
      }
    } on ApiError catch (error) {
      answer = error.message;
    } catch (_) {
      answer = 'I could not reach the foundation service just now. Please check your connection and try again.';
    }
    if (!mounted) return;
    setState(() {
      _thinking = false;
      _messages.add(_Message(text: answer, fromUser: false, source: source));
    });
    _jumpToBottom();
  }

  void _jumpToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(0, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
      }
    });
  }

  Future<void> _openWhatsapp() async {
    final link = _whatsapp.chatLink;
    if (link == null) return;
    try {
      final opened = await launchUrl(Uri.parse(link), mode: LaunchMode.externalApplication);
      if (!opened && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open WhatsApp on this device.')),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open WhatsApp on this device.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SizedBox(
        height: MediaQuery.of(context).size.height * 0.85,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 8, 0),
              child: Row(children: [
                CircleAvatar(
                  backgroundColor: theme.colorScheme.primaryContainer,
                  child: Icon(Icons.smart_toy_outlined, color: theme.colorScheme.primary),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(
                      'Foundation Assistant',
                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    Text('Answers about our work', style: theme.textTheme.bodySmall),
                  ]),
                ),
                if (_whatsapp.enabled)
                  IconButton(
                    tooltip: 'Chat on WhatsApp',
                    icon: const Icon(Icons.chat_outlined),
                    color: const Color(0xFF25D366),
                    onPressed: _openWhatsapp,
                  ),
                CloseButton(onPressed: () => Navigator.of(context).pop()),
              ]),
            ),
            const Divider(height: 20),
            Expanded(
              child: ListView.builder(
                controller: _scroll,
                reverse: true,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _messages.length,
                itemBuilder: (context, index) {
                  final message = _messages[_messages.length - 1 - index];
                  return _Bubble(message: message);
                },
              ),
            ),
            if (_thinking)
              const Padding(
                padding: EdgeInsets.only(bottom: 4),
                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                  SizedBox(width: 8),
                  Text('Thinking...', style: TextStyle(fontSize: 12)),
                ]),
              ),
            if (_suggestions.isNotEmpty)
              SizedBox(
                height: 42,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _suggestions.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) => ActionChip(
                    label: Text(_suggestions[index], style: const TextStyle(fontSize: 12)),
                    onPressed: _thinking ? null : () => _send(_suggestions[index]),
                  ),
                ),
              ),
            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                child: Row(children: [
                  Expanded(
                    child: TextField(
                      controller: _input,
                      minLines: 1,
                      maxLines: 3,
                      textInputAction: TextInputAction.send,
                      onSubmitted: _send,
                      decoration: const InputDecoration(
                        hintText: 'Ask about donations, assistance...',
                        isDense: true,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: _thinking ? null : () => _send(_input.text),
                    icon: const Icon(Icons.send_rounded),
                  ),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Bubble extends StatelessWidget {
  final _Message message;

  const _Bubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isUser = message.fromUser;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
        decoration: BoxDecoration(
          color: isUser ? theme.colorScheme.primary : theme.colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isUser ? 16 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 16),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              message.text,
              style: TextStyle(
                color: isUser ? theme.colorScheme.onPrimary : theme.colorScheme.onSurface,
                height: 1.35,
              ),
            ),
            if (!isUser && message.source != null) ...[
              const SizedBox(height: 6),
              Text(
                'Source: ${message.source}',
                style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
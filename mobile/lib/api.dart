import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

const apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:3000/api',
);

/// Error carrying a friendly message plus the HTTP status when known.
class ApiError implements Exception {
  final String message;
  final int? statusCode;

  const ApiError(this.message, {this.statusCode});

  @override
  String toString() => message;
}

class UserProfile {
  final String id;
  final String name;
  final String email;
  final String? phone;

  const UserProfile({required this.id, required this.name, required this.email, this.phone});

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
        id: json['id']?.toString() ?? '',
        name: (json['name'] ?? '').toString(),
        email: (json['email'] ?? '').toString(),
        phone: json['phone']?.toString(),
      );
}

class ApiClient {
  final String? token;

  const ApiClient({this.token});

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (token != null && token!.isNotEmpty) 'Authorization': 'Bearer $token',
      };

  Uri _uri(String path) => Uri.parse('$apiBaseUrl/$path');

  dynamic _decode(http.Response response) {
    dynamic body;
    try {
      body = response.body.isEmpty ? null : jsonDecode(response.body);
    } catch (_) {
      body = null;
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final dynamic raw = body is Map ? (body['message'] ?? body['error']) : null;
      String message;
      if (raw is String && raw.isNotEmpty) {
        message = raw;
      } else if (raw is List && raw.isNotEmpty) {
        message = raw.join(', ');
      } else if (response.statusCode == 401) {
        message = 'Please sign in to continue.';
      } else if (response.statusCode == 403) {
        message = 'You do not have access to do that.';
      } else {
        message = 'Something went wrong. Please try again.';
      }
      throw ApiError(message, statusCode: response.statusCode);
    }
    return body;
  }

  Future<List<dynamic>> projects() async {
    final response = await http.get(_uri('projects'), headers: _headers).timeout(const Duration(seconds: 15));
    final data = _decode(response);
    return data is List ? data : <dynamic>[];
  }

  Future<void> submitAssistance(Map<String, dynamic> data) async {
    final response = await http
        .post(_uri('assistance'), headers: _headers, body: jsonEncode(data))
        .timeout(const Duration(seconds: 15));
    _decode(response);
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    final response = await http
        .post(
          _uri('auth/register'),
          headers: _headers,
          body: jsonEncode({
            'name': name,
            'email': email,
            'password': password,
            if (phone != null && phone.isNotEmpty) 'phone': phone,
          }),
        )
        .timeout(const Duration(seconds: 15));
    final data = _decode(response);
    return data is Map<String, dynamic> ? data : <String, dynamic>{};
  }

  Future<Map<String, dynamic>> login({required String email, required String password}) async {
    final response = await http
        .post(
          _uri('auth/login'),
          headers: _headers,
          body: jsonEncode({'email': email, 'password': password}),
        )
        .timeout(const Duration(seconds: 15));
    final data = _decode(response);
    return data is Map<String, dynamic> ? data : <String, dynamic>{};
  }

  Future<UserProfile> me() async {
    final response = await http.get(_uri('auth/me'), headers: _headers).timeout(const Duration(seconds: 15));
    final data = _decode(response);
    if (data is Map<String, dynamic>) return UserProfile.fromJson(data);
    throw const ApiError('Could not load your profile.');
  }

  Future<Map<String, dynamic>> startDonation({
    required double amount,
    required String currency,
    required String name,
    required String email,
    String? phone,
    String? projectId,
  }) async {
    final response = await http
        .post(
          _uri('donations/init'),
          headers: _headers,
          body: jsonEncode({
            'amount': amount,
            'currency': currency,
            'donorName': name,
            'email': email,
            if (phone != null && phone.isNotEmpty) 'phone': phone,
            if (projectId != null && projectId.isNotEmpty) 'projectId': projectId,
          }),
        )
        .timeout(const Duration(seconds: 15));
    final data = _decode(response);
    return data is Map<String, dynamic> ? data : <String, dynamic>{};
  }
}

class SessionState {
  final bool ready;
  final String? token;
  final UserProfile? user;

  const SessionState({this.ready = false, this.token, this.user});

  bool get isAuthenticated => token != null && token!.isNotEmpty && user != null;

  SessionState copyWith({bool? ready, String? token, UserProfile? user}) => SessionState(
        ready: ready ?? this.ready,
        token: token ?? this.token,
        user: user ?? this.user,
      );
}

const String _tokenKey = 'lordina_session_token';

/// Holds the signed-in donor session and keeps the token on the device so
/// donors stay signed in between launches.
class SessionNotifier extends StateNotifier<SessionState> {
  SessionNotifier() : super(const SessionState());

  /// Restores a saved session (the token is verified against the API).
  Future<void> restore() async {
    if (state.isAuthenticated) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString(_tokenKey);
      if (saved == null || saved.isEmpty) {
        state = const SessionState(ready: true);
        return;
      }
      final user = await ApiClient(token: saved).me();
      state = SessionState(ready: true, token: saved, user: user);
    } catch (_) {
      // No saved token, an expired token, or the device is offline: start signed out.
      state = const SessionState(ready: true);
    }
  }

  Future<void> signIn({required String email, required String password}) async {
    final result = await ApiClient().login(email: email, password: password);
    await _adopt(result, fallbackEmail: email);
  }

  Future<void> signUp({required String name, required String email, required String password, String? phone}) async {
    final result = await ApiClient().register(name: name, email: email, password: password, phone: phone);
    if (result['access_token'] == null) {
      // Older API builds that do not return a token on register: sign in instead.
      final loginResult = await ApiClient().login(email: email, password: password);
      await _adopt(loginResult, fallbackEmail: email);
      return;
    }
    await _adopt(result, fallbackEmail: email);
  }

  Future<void> _adopt(Map<String, dynamic> result, {String? fallbackEmail}) async {
    final tokenValue = result['access_token']?.toString();
    if (tokenValue == null || tokenValue.isEmpty) {
      throw const ApiError('Sign-in did not return a session. Please try again.');
    }
    UserProfile? profile;
    final dynamic rawUser = result['user'];
    if (rawUser is Map<String, dynamic>) {
      profile = UserProfile.fromJson(rawUser);
    } else {
      try {
        profile = await ApiClient(token: tokenValue).me();
      } catch (_) {
        // Offline right after sign-in: keep a minimal profile so the session still works.
        final email = fallbackEmail ?? '';
        profile = UserProfile(id: '', name: email.split('@').first, email: email);
      }
    }
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_tokenKey, tokenValue);
    } catch (_) {
      // Storage unavailable (e.g. during tests): keep the session for this run.
    }
    state = SessionState(ready: true, token: tokenValue, user: profile);
  }

  Future<void> signOut() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_tokenKey);
    } catch (_) {}
    state = const SessionState(ready: true);
  }
}

final sessionProvider = StateNotifierProvider<SessionNotifier, SessionState>((ref) => SessionNotifier());
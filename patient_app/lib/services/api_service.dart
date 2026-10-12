import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import '../models/user_model.dart';
import '../models/unit_model.dart';

class ApiService {
  // cPanel API Base URL (Used exclusively for both Debug and Release builds):
  static const String baseUrl = 'https://api.gmcchtsrtoken.com/api';

  static const _storage = FlutterSecureStorage();
  static const String _keyToken = 'auth_token';
  static const String _keyUser = 'saved_user';

  // Store token in memory for session
  static String? _token;

  /// Retrieves the saved patient session if available.
  static Future<UserModel?> getSavedUser() async {
    try {
      final token = await _storage.read(key: _keyToken);
      final userJson = await _storage.read(key: _keyUser);
      if (token != null && token.isNotEmpty && userJson != null && userJson.isNotEmpty) {
        _token = token;
        final userMap = json.decode(userJson);
        return UserModel.fromJson(userMap);
      }
    } catch (e) {
      debugPrint('Error restoring saved user session: $e');
    }
    return null;
  }

  static Future<void> logout() async {
    try {
      await http.post(
        Uri.parse('$baseUrl/logout'),
        headers: _getHeaders(),
      );
    } catch (e) {
      debugPrint('Error logging out from server: $e');
    } finally {
      _token = null;
      try {
        await _storage.delete(key: _keyToken);
        await _storage.delete(key: _keyUser);
        await _storage.delete(key: 'token');
      } catch (e) {
        debugPrint('Error clearing secure storage: $e');
      }
    }
  }

  static Map<String, String> _getHeaders() {
    final headers = {'Content-Type': 'application/json'};
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  /// Constructs the full URL for a doctor's photo stored in backend storage.
  static String? getDoctorPhotoUrl(String? photoPath) {
    if (photoPath == null || photoPath.isEmpty) return null;
    final storageBaseUrl = baseUrl.replaceAll('/api', '');
    return '$storageBaseUrl/storage/$photoPath';
  }

  static Future<Map<String, dynamic>> login(String crno, [String? password]) async {
    try {
      debugPrint('Attempting login to: $baseUrl/user/login with CRNO: $crno');
      final Map<String, dynamic> bodyData = {'crno': crno};
      if (password != null && password.isNotEmpty) {
        bodyData['password'] = password;
      }

      final response = await http.post(
        Uri.parse('$baseUrl/user/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(bodyData),
      );

      debugPrint('Login Response Status: ${response.statusCode}');
      debugPrint('Login Response Body: ${response.body}');

      if (response.statusCode == 429) {
        return {
          'status': false,
          'message': 'Too many login attempts. Please wait a minute.',
        };
      }

      final data = json.decode(response.body);

      if (data['success'] == true) {
        _token = data['data']['token'];
        final user = UserModel.fromJson(data['data']['user']);

        try {
          await _storage.write(key: _keyToken, value: _token);
          await _storage.write(key: 'token', value: _token);
          await _storage.write(key: _keyUser, value: json.encode(user.toJson()));
        } catch (e) {
          debugPrint('Error saving patient session: $e');
        }

        return {
          'status': true,
          'user': user,
        };
      } else {
        return {
          'status': false,
          'message': data['message'] ?? 'Invalid CR Number',
        };
      }
    } catch (e) {
      debugPrint('Login Error: $e');
      return {
        'status': false,
        'message': 'Network Error: Check your internet connection',
      };
    }
  }

  static Future<Map<String, dynamic>> doctorLogin(String regno, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/doctor/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'regno': regno, 'password': password}),
      );

      if (response.statusCode == 429) {
        return {
          'status': false,
          'message': 'Too many login attempts. Please wait a minute.',
        };
      }

      final data = json.decode(response.body);

      if (data['success'] == true) {
        _token = data['data']['token'];
        return {
          'status': true,
          'doctor': data['data']['doctor'], // Can create DoctorModel if needed
        };
      } else {
        return {
          'status': false,
          'message': data['message'] ?? 'Invalid Credentials',
        };
      }
    } catch (e) {
      return {
        'status': false,
        'message': 'Network Error: Check your internet connection',
      };
    }
  }

  static Future<List<UnitModel>> getUnits() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/units'));
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        if (data['success'] == true) {
           final List<dynamic> list = data['data'];
           return list.map((item) => UnitModel.fromJson(item)).toList();
        }
      }
      return [];
    } catch (e) {
      debugPrint('Units Fetch Error: $e');
      return [];
    }
  }

  static Future<Map<String, dynamic>> createBooking(int userId, int unitId, String type) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/booking/create'),
        headers: _getHeaders(),
        body: json.encode({
          'user_id': userId,
          'unit_id': unitId,
          'type': type,
        }),
      );

      return json.decode(response.body);
    } catch (e) {
      return {
        'success': false,
        'message': 'Booking failed: Network Error',
      };
    }
  }

  static Future<List<dynamic>> getUserBookings(int userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/booking/my-bookings'),
        headers: _getHeaders(),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) return data['data'];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  static Future<Map<String, dynamic>> cancelBooking(int bookingId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/booking/cancel'),
        headers: _getHeaders(),
        body: json.encode({
          'booking_id': bookingId,
        }),
      );

      return json.decode(response.body);
    } catch (e) {
      return {
        'success': false,
        'message': 'Cancellation failed: Network Error',
      };
    }
  }

  static Future<Map<String, dynamic>> getDoctorQueue(int unitId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/doctor/queue/$unitId'),
        headers: _getHeaders(),
      );
      return json.decode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }

  static Future<Map<String, dynamic>> callNextToken(int unitId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/doctor/call-next'),
        headers: _getHeaders(),
        body: json.encode({'unit_id': unitId}),
      );
      return json.decode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }

  static Future<Map<String, dynamic>> markTokenCompleted(int bookingId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/doctor/complete'),
        headers: _getHeaders(),
        body: json.encode({'booking_id': bookingId}),
      );
      return json.decode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }

  static Future<Map<String, dynamic>> getAvailability(int unitId, String date) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/booking/availability?unit_id=$unitId'),
        headers: _getHeaders(),
      );
      return json.decode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }

  static Future<List<dynamic>> getNotifications() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/notifications'),
        headers: _getHeaders(),
      );
      final data = json.decode(response.body);
      if (data['success'] == true) {
        return data['data'];
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
      return [];
    }
  }
}

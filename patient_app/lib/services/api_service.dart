import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/user_model.dart';
import '../models/unit_model.dart';

class ApiService {
  static const String baseUrl = 'https://api.gmcchtsrtoken.chromologtechnologies.com/api';
  
  // Store token in memory for session
  static String? _token;

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

      final data = json.decode(response.body);

      if (data['success'] == true) {
        _token = data['data']['token'];
        return {
          'status': true,
          'user': UserModel.fromJson(data['data']['user']),
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

  static Future<Map<String, dynamic>> doctorLogin(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/doctor/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'username': username, 'password': password}),
      );

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

  static Future<Map<String, dynamic>> markTokenCompleted(int unitId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/doctor/complete'),
        headers: _getHeaders(),
        body: json.encode({'unit_id': unitId}),
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
}

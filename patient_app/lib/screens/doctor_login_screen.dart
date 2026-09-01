import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'doctor_dashboard_screen.dart';
import '../services/api_service.dart';

class DoctorLoginScreen extends StatefulWidget {
  const DoctorLoginScreen({super.key});

  @override
  State<DoctorLoginScreen> createState() => _DoctorLoginScreenState();
}

class _DoctorLoginScreenState extends State<DoctorLoginScreen> {
  final _regnoController    = TextEditingController();
  final _passwordController = TextEditingController();
  final _secureStorage      = const FlutterSecureStorage();

  bool _isLoading      = false;
  bool _rememberMe     = false;
  bool _obscurePassword = true;

  static const _keyRegno    = 'doctor_regno';
  static const _keyPassword = 'doctor_password';
  static const _keyRemember = 'doctor_remember';

  @override
  void initState() {
    super.initState();
    _loadSavedCredentials();
  }

  Future<void> _loadSavedCredentials() async {
    final remember = await _secureStorage.read(key: _keyRemember);
    if (remember == 'true') {
      final savedRegno    = await _secureStorage.read(key: _keyRegno);
      final savedPassword = await _secureStorage.read(key: _keyPassword);
      setState(() {
        _rememberMe = true;
        if (savedRegno    != null) _regnoController.text    = savedRegno;
        if (savedPassword != null) _passwordController.text = savedPassword;
      });
    }
  }

  Future<void> _saveOrClearCredentials() async {
    if (_rememberMe) {
      await _secureStorage.write(key: _keyRemember,  value: 'true');
      await _secureStorage.write(key: _keyRegno,     value: _regnoController.text.trim());
      await _secureStorage.write(key: _keyPassword,  value: _passwordController.text);
    } else {
      await _secureStorage.delete(key: _keyRemember);
      await _secureStorage.delete(key: _keyRegno);
      await _secureStorage.delete(key: _keyPassword);
    }
  }

  Future<void> _handleLogin() async {
    if (_regnoController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter both registration number and password')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final result = await ApiService.doctorLogin(
      _regnoController.text.trim(),
      _passwordController.text,
    );

    setState(() => _isLoading = false);

    if (result['status'] == true) {
      await _saveOrClearCredentials();

      final doctor = result['doctor'];
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => DoctorDashboardScreen(doctor: doctor)),
      );
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Login failed'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  void dispose() {
    _regnoController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      extendBodyBehindAppBar: true,
      body: Container(
        padding: const EdgeInsets.all(30),
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF007AFF), Color(0xFF00C6FF)],
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.medical_services, size: 80, color: Colors.white),
                const SizedBox(height: 20),
                const Text(
                  'GMCCH DOCTOR',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 50),

                // ── Registration Number field ──────────────────────────────
                TextField(
                  controller: _regnoController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    hintText: 'Enter Registration Number',
                    prefixIcon: const Icon(Icons.badge, color: Color(0xFF007AFF)),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(15),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                const SizedBox(height: 15),

                // ── Password field ─────────────────────────────────────────
                TextField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    hintText: 'Enter Password',
                    prefixIcon: const Icon(Icons.lock, color: Color(0xFF007AFF)),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_off : Icons.visibility,
                        color: Colors.grey,
                      ),
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(15),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // ── Remember Me checkbox ───────────────────────────────────
                Row(
                  children: [
                    Checkbox(
                      value: _rememberMe,
                      onChanged: (val) => setState(() => _rememberMe = val ?? false),
                      activeColor: Colors.white,
                      checkColor: const Color(0xFF007AFF),
                      side: const BorderSide(color: Colors.white, width: 2),
                    ),
                    const Text(
                      'Remember Me',
                      style: TextStyle(color: Colors.white, fontSize: 15),
                    ),
                  ],
                ),
                const SizedBox(height: 15),

                // ── Login button ───────────────────────────────────────────
                SizedBox(
                  width: double.infinity,
                  height: 55,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleLogin,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF007AFF),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                    ),
                    child: _isLoading
                        ? const CircularProgressIndicator()
                        : const Text('LOGIN', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

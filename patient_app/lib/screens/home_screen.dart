import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/user_model.dart';
import '../models/unit_model.dart';
import '../services/api_service.dart';
import 'department_doctors_screen.dart';
import 'login_screen.dart';
import 'my_token_screen.dart';

class HomeScreen extends StatefulWidget {
  final UserModel user;

  const HomeScreen({super.key, required this.user});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  bool _isBackPressed = false;
  late Future<List<UnitModel>> _unitsFuture;

  @override
  void initState() {
    super.initState();
    _unitsFuture = ApiService.getUnits();
  }

  void _onItemTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  void _showPrivacyDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Terms & Conditions'),
          content: const Text(
              "End User License Agreement\nBy using this app, you agree to abide by the terms."),
          actions: <Widget>[
            TextButton(
              child: const Text('OK', style: TextStyle(color: Color(0xFFFF0088))),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  void _showAboutDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('About'),
          content: const Text(
              "MCCH Token App\nVersion 1.0\nDesigned for smooth hospital token booking."),
          actions: <Widget>[
            TextButton(
              child: const Text('OK', style: TextStyle(color: Color(0xFFFF0088))),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  Future<bool> _onWillPop() async {
    if (_isBackPressed) {
      if (Platform.isAndroid) {
        SystemNavigator.pop();
      } else {
        exit(0);
      }
      return true;
    }

    _isBackPressed = true;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Please press back again to exit.'),
        duration: Duration(seconds: 2),
      ),
    );

    Timer(const Duration(seconds: 2), () {
      _isBackPressed = false;
    });

    return false;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        await _onWillPop();
      },
      child: Scaffold(
        backgroundColor: Colors.grey[50],
        appBar: AppBar(
          title: Text(_currentIndex == 0 ? 'Select Department' : 'My Token'),
          centerTitle: true,
          backgroundColor: const Color(0xFFFF0088),
          foregroundColor: Colors.white,
          elevation: 0,
          actions: [
            PopupMenuButton<String>(
              onSelected: (value) {
                if (value == 'about') {
                  _showAboutDialog();
                } else if (value == 'terms') {
                  _showPrivacyDialog();
                } else if (value == 'logout') {
                  ApiService.logout();
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                    (route) => false,
                  );
                }
              },
              itemBuilder: (BuildContext context) {
                return [
                  const PopupMenuItem(
                    value: 'about',
                    child: Text('About'),
                  ),
                  const PopupMenuItem(
                    value: 'terms',
                    child: Text('Terms & Conditions'),
                  ),
                  const PopupMenuItem(
                    value: 'logout',
                    child: Text('Logout'),
                  ),
                ];
              },
            ),
          ],
        ),
        body: _currentIndex == 0 ? _buildHomeBody() : _buildMyTokenBody(),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _onItemTapped,
          selectedItemColor: const Color(0xFFFF0088),
          unselectedItemColor: Colors.grey,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.confirmation_number_outlined),
              label: 'My Token',
            ),
          ],
        ),
      ),
    );
  }

  // --- HOME TAB ---
  Widget _buildHomeBody() {
    return Column(
      children: [
        // Greeting Header
        Container(
          padding: const EdgeInsets.all(20),
          width: double.infinity,
          decoration: const BoxDecoration(
            color: Color(0xFFFF0088),
            borderRadius: BorderRadius.only(
              bottomLeft: Radius.circular(30),
              bottomRight: Radius.circular(30),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Hello, ${widget.user.name}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 5),
              const Text(
                'Choose a department to book your token',
                style: TextStyle(color: Colors.white70, fontSize: 14),
              ),
            ],
          ),
        ),

        const SizedBox(height: 10),

        // Units List
        Expanded(
          child: FutureBuilder<List<UnitModel>>(
            future: _unitsFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(
                    child: CircularProgressIndicator(color: Color(0xFFFF0088)));
              } else if (snapshot.hasError ||
                  !snapshot.hasData ||
                  snapshot.data!.isEmpty) {
                return _buildErrorState();
              }

              final units = snapshot.data!;

              // Group units by department
              final Map<String, List<UnitModel>> departments = {};
              for (final unit in units) {
                final dept = unit.doctorDepartment ?? unit.name;
                departments.putIfAbsent(dept, () => []);
                departments[dept]!.add(unit);
              }

              final deptEntries = departments.entries.toList();

              return ListView.builder(
                padding: const EdgeInsets.all(15),
                itemCount: deptEntries.length,
                itemBuilder: (context, index) {
                  final entry = deptEntries[index];
                  return _buildDepartmentCard(context, entry.key, entry.value);
                },
              );
            },
          ),
        ),
      ],
    );
  }

  // --- MY TOKEN TAB ---
  Widget _buildMyTokenBody() {
    return MyTokenScreen(user: widget.user, hideAppBar: true);
  }



  Widget _buildDepartmentCard(BuildContext context, String departmentName, List<UnitModel> units) {
    // Count unique doctors in this department
    final uniqueDoctors = <int>{};
    for (final unit in units) {
      if (unit.doctorId != null) uniqueDoctors.add(unit.doctorId!);
    }
    final doctorCount = uniqueDoctors.isEmpty ? units.length : uniqueDoctors.length;

    // Collect unique OP days
    final opDays = <String>{};
    for (final unit in units) {
      if (unit.day != null && unit.day!.isNotEmpty) opDays.add(unit.day!);
    }

    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 15),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: ListTile(
        contentPadding: const EdgeInsets.all(15),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: const Color(0xFFFF0088).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Icon(Icons.medical_services,
              color: Color(0xFFFF0088), size: 30),
        ),
        title: Text(
          departmentName,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 5),
            Row(
              children: [
                const Icon(Icons.person, size: 14, color: Colors.grey),
                const SizedBox(width: 5),
                Text(
                  '$doctorCount Doctor${doctorCount != 1 ? 's' : ''}',
                  style: const TextStyle(color: Colors.grey),
                ),
              ],
            ),
            if (opDays.isNotEmpty) ...[
              const SizedBox(height: 3),
              Row(
                children: [
                  const Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                  const SizedBox(width: 5),
                  Expanded(
                    child: Text(
                      opDays.join(', '),
                      style: const TextStyle(color: Colors.grey),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
        trailing:
            const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => DepartmentDoctorsScreen(
                departmentName: departmentName,
                departmentUnits: units,
                user: widget.user,
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 60, color: Colors.grey[400]),
          const SizedBox(height: 10),
          const Text('Could not load departments',
              style: TextStyle(color: Colors.grey)),
          TextButton(
            onPressed: () {
              setState(() {
                _unitsFuture = ApiService.getUnits();
              });
            },
            child: const Text('Retry', style: TextStyle(color: Color(0xFFFF0088))),
          )
        ],
      ),
    );
  }
}

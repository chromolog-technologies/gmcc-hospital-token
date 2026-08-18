import 'package:flutter/material.dart';
import 'doctor_queue_screen.dart';
import 'login_screen.dart';
import '../services/api_service.dart';

class DoctorDashboardScreen extends StatelessWidget {
  final Map<String, dynamic> doctor;

  const DoctorDashboardScreen({super.key, required this.doctor});

  @override
  Widget build(BuildContext context) {
    final List<dynamic> units = doctor['units'] ?? [];

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('My Units'),
        centerTitle: true,
        backgroundColor: const Color(0xFF007AFF),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ApiService.logout();
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (context) => const LoginScreen()),
                (route) => false,
              );
            },
          )
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            width: double.infinity,
            decoration: const BoxDecoration(
              color: Color(0xFF007AFF),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(30),
                bottomRight: Radius.circular(30),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Dr. ${doctor['name']}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 5),
                const Text(
                  'Select a unit to manage patient queue',
                  style: TextStyle(color: Colors.white70, fontSize: 14),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Expanded(
            child: units.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.inbox, size: 60, color: Colors.grey[400]),
                        const SizedBox(height: 10),
                        const Text('No units assigned yet', style: TextStyle(color: Colors.grey)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(15),
                    itemCount: units.length,
                    itemBuilder: (context, index) {
                      final unit = units[index];
                      return Card(
                        elevation: 2,
                        margin: const EdgeInsets.only(bottom: 15),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(15),
                          leading: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF007AFF).withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.meeting_room, color: Color(0xFF007AFF), size: 30),
                          ),
                          title: Text(
                            unit['name'] ?? 'Unnamed Unit',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                          ),
                          subtitle: Text(
                            'Day: ${unit['day'] ?? 'Unknown'}',
                            style: const TextStyle(color: Colors.grey),
                          ),
                          trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => DoctorQueueScreen(unit: unit),
                              ),
                            );
                          },
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

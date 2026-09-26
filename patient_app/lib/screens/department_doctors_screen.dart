import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../models/unit_model.dart';
import 'booking_screen.dart';

class DepartmentDoctorsScreen extends StatelessWidget {
  final String departmentName;
  final List<UnitModel> departmentUnits;
  final UserModel user;

  const DepartmentDoctorsScreen({
    super.key,
    required this.departmentName,
    required this.departmentUnits,
    required this.user,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Book Token'),
        centerTitle: true,
        backgroundColor: const Color(0xFFFF0088),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {},
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'info', child: Text('Info')),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Department Title
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
              color: Colors.white,
              child: Text(
                departmentName.endsWith('Department') 
                    ? departmentName.replaceAll(' Department', '\nDepartment') 
                    : '$departmentName\nDepartment',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                  height: 1.3,
                ),
              ),
            ),

            // Unit / OP Day Sections
            ...departmentUnits.map((unit) => _buildUnitSection(context, unit)),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildUnitSection(BuildContext context, UnitModel unit) {
    final String days = unit.day ?? 'Not Scheduled';
    final doctors = unit.doctors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // OP Day Banner (Full Width, Solid Color)
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(top: 16),
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
          color: const Color(0xFFFF0088),
          child: Text(
            'OP.   $days',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
        ),

        // "Book Token" button
        Align(
          alignment: Alignment.centerRight,
          child: Padding(
            padding: const EdgeInsets.only(right: 20, top: 8, bottom: 4),
            child: TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => BookingScreen(
                      user: user,
                      unit: unit,
                    ),
                  ),
                );
              },
              child: const Text(
                'Book Token',
                style: TextStyle(
                  color: Colors.black87,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ),

        // Doctors list or "No Doctors assigned" message
        Container(
          color: Colors.white,
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: doctors.isNotEmpty
              ? Column(
                  children: [
                    for (int i = 0; i < doctors.length; i++) ...[
                      _buildDoctorCard(context, doctors[i], unit),
                      if (i < doctors.length - 1)
                        const Divider(height: 1, indent: 20, endIndent: 20, color: Color(0xFFEEEEEE)),
                    ]
                  ],
                )
              : Container(
                  padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
                  alignment: Alignment.center,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.info_outline, color: Colors.grey[500], size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'No Doctors are assigned for this unit.',
                        style: TextStyle(
                          fontSize: 15,
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
        ),
      ],
    );
  }


  Widget _buildDoctorCard(BuildContext context, DoctorModel doctor, UnitModel unit) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Doctor Photo (Square/Rectangular)
          _buildDoctorAvatar(doctor, width: 80, height: 90),
          const SizedBox(width: 20),

          // Doctor Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  doctor.name,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
                if (doctor.qualification != null && doctor.qualification!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(
                      doctor.qualification!,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                        height: 1.3,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDoctorAvatar(DoctorModel doctor, {double width = 80, double height = 90}) {
    final photoUrl = doctor.photoUrl;

    if (photoUrl != null && photoUrl.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: Container(
          width: width,
          height: height,
          color: Colors.grey[200],
          child: Image.network(
            photoUrl,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) => _buildPlaceholderAvatar(doctor, width, height),
          ),
        ),
      );
    }
    return _buildPlaceholderAvatar(doctor, width, height);
  }

  Widget _buildPlaceholderAvatar(DoctorModel doctor, double width, double height) {
    final name = doctor.name;
    final initials = name
        .split(' ')
        .where((w) => w.isNotEmpty)
        .take(2)
        .map((w) => w[0].toUpperCase())
        .join();

    return ClipRRect(
      borderRadius: BorderRadius.circular(4),
      child: Container(
        width: width,
        height: height,
        color: const Color(0xFFFF0088).withValues(alpha: 0.15),
        alignment: Alignment.center,
        child: Text(
          initials,
          style: TextStyle(
            color: const Color(0xFFFF0088),
            fontWeight: FontWeight.bold,
            fontSize: width * 0.35,
          ),
        ),
      ),
    );
  }
}

class DoctorModel {
  final int id;
  final String name;
  final String? qualification;
  final String? photo;
  final String? department;

  DoctorModel({
    required this.id,
    required this.name,
    this.qualification,
    this.photo,
    this.department,
  });

  factory DoctorModel.fromJson(Map<String, dynamic> json) {
    return DoctorModel(
      id: json['id'],
      name: json['name'],
      qualification: json['qualification'],
      photo: json['photo'],
      department: json['department'],
    );
  }
}

class UnitModel {
  final int id;
  final String name;
  final String time;
  final String? day;
  final List<DoctorModel> doctors;

  UnitModel({
    required this.id,
    required this.name,
    required this.time,
    this.day,
    required this.doctors,
  });

  factory UnitModel.fromJson(Map<String, dynamic> json) {
    final doctorsJson = json['doctors'] as List<dynamic>? ?? [];
    final doctorsList = doctorsJson.map((d) => DoctorModel.fromJson(d)).toList();
    return UnitModel(
      id: json['id'],
      name: json['name'],
      time: json['time'] ?? 'N/A',
      day: json['day'],
      doctors: doctorsList,
    );
  }

  // Compatibility getters for single doctor fields
  String get doctorName {
    if (doctors.isEmpty) return 'On Duty';
    return doctors.map((d) => d.name).join(', ');
  }

  String? get doctorQualification {
    if (doctors.isEmpty) return null;
    return doctors.map((d) => d.qualification).where((q) => q != null && q.isNotEmpty).join(', ');
  }

  String? get doctorPhoto {
    if (doctors.isEmpty) return null;
    return doctors.first.photo;
  }

  int? get doctorId {
    if (doctors.isEmpty) return null;
    return doctors.first.id;
  }

  String? get doctorDepartment {
    if (doctors.isEmpty) return null;
    return doctors.first.department;
  }
}

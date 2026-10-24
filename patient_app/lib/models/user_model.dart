class UserModel {
  final int id;
  final String name;
  final String? crno;
  final int? userAge;
  final String? userGender;

  UserModel({
    required this.id,
    required this.name,
    this.crno,
    this.userAge,
    this.userGender,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] is int ? json['id'] as int : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      name: json['name']?.toString() ?? 'Patient',
      crno: json['crno']?.toString(),
      userAge: json['user_age'] is int ? json['user_age'] as int : int.tryParse(json['user_age']?.toString() ?? ''),
      userGender: json['user_gender']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'crno': crno,
      'user_age': userAge,
      'user_gender': userGender,
    };
  }
}

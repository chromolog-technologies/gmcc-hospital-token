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
      id: json['id'],
      name: json['name'],
      crno: json['crno'],
      userAge: json['user_age'],
      userGender: json['user_gender'],
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

import 'package:mobile/core/common/entities/user_entity.dart';

class UserModel extends UserEntity {
  UserModel({required super.id, required super.username, required super.email});

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
    );
  }
}

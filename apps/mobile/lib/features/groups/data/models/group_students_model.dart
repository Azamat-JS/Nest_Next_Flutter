import 'package:mobile/core/common/entities/user_entity.dart';

class GroupStudentsModel {
  final String id;
  final String username;
  final String email;
  final String role;

  const GroupStudentsModel({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
  });

  factory GroupStudentsModel.fromJson(Map<String, dynamic> json) {
    return GroupStudentsModel(
      id: json['id'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
    );
  }

  /// ✅ FIXED: returns SINGLE entity (not page)
  UserEntity toEntity() {
    return UserEntity(id: id, username: username, email: email, role: role);
  }
}

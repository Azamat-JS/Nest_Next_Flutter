import 'package:mobile/features/auth/data/models/user_model.dart';
import 'package:mobile/features/groups/domain/entities/group_entity.dart';

class GroupModel extends GroupEntity {
  GroupModel({
    required super.id,
    required super.name,
    required super.teacherId,
    required super.createdAt,
    required super.teacher,
    required super.students,
  });

  factory GroupModel.fromJson(Map<String, dynamic> json) {
    return GroupModel(
      id: json['id'] as String,
      name: json['name'] as String,
      teacherId: json['teacherId'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      teacher: UserModel.fromJson(json['teacher'] as Map<String, dynamic>),
      students: (json['students'] as List<dynamic>)
          .map((s) => UserModel.fromJson(s as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'teacher_id': teacherId,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

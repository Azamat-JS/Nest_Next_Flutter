import 'package:mobile/features/auth/data/models/user_model.dart';
import 'package:mobile/features/groups/domain/entities/group_entity.dart';

class GroupModel extends GroupEntity {
  GroupModel({
    required super.id,
    required super.name,
    required super.teacherId,
    required super.createdAt,
    required super.teacher,
  });

  factory GroupModel.fromJson(Map<String, dynamic> json) {
    return GroupModel(
      id: json['id'] as String,
      name: json['name'] as String,
      teacherId: json['teacherId'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      teacher: UserModel.fromJson(json['teacher'] as Map<String, dynamic>),
    );
  }

  GroupEntity toEntity() {
    return GroupEntity(
      createdAt: createdAt,
      id: id,
      name: name,
      teacherId: teacherId,
      teacher: teacher,
    );
  }
}

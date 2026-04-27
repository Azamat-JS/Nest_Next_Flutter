import 'package:mobile/features/groups/domain/entities/group_entity.dart';

class GroupdbModel {
  final String id;
  final String name;
  final String teacherId;
  final DateTime createdAt;

  GroupdbModel.fromJson(Map<String, dynamic> json)
    : id = json['id'] as String,
      name = json['name'] as String,
      teacherId = json['teacher_id'] as String,
      createdAt = DateTime.parse(json['created_at'] as String);

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'teacher_id': teacherId,
      'created_at': createdAt.toIso8601String(),
    };
  }

  GroupdbModel.fromEntity(GroupEntity entity)
    : id = entity.id,
      name = entity.name,
      teacherId = entity.teacherId,
      createdAt = entity.createdAt;

  GroupEntity toEntity() {
    return GroupEntity(
      id: id,
      name: name,
      teacherId: teacherId,
      createdAt: createdAt,
      teacher: null,
    );
  }
}

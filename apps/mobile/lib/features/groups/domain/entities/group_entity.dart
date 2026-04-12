import 'package:mobile/core/common/entities/user_entity.dart';

class GroupEntity {
  final String id;
  final String name;
  final String teacherId;
  final DateTime createdAt;
  final UserEntity teacher;
  final List<UserEntity> students;

  GroupEntity({
    required this.id,
    required this.name,
    required this.teacherId,
    required this.createdAt,
    required this.teacher,
    required this.students,
  });
}

class PaginatedGroupsEntity {
  final List<GroupEntity> data;
  final int total;
  final int page;
  final int limit;

  PaginatedGroupsEntity({
    required this.data,
    required this.total,
    required this.page,
    required this.limit,
  });
}

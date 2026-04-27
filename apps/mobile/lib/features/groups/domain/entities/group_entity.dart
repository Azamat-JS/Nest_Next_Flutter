import 'package:mobile/core/common/entities/user_entity.dart';

class GroupEntity {
  final String id;
  final String name;
  final String teacherId;
  final DateTime createdAt;
  final UserEntity? teacher;

  GroupEntity({
    required this.id,
    required this.name,
    required this.teacherId,
    required this.createdAt,
    required this.teacher,
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

  PaginatedGroupsEntity copyWith({
    List<GroupEntity>? data,
    int? total,
    int? page,
    int? limit,
  }) {
    return PaginatedGroupsEntity(
      data: data ?? this.data,
      total: total ?? this.total,
      page: page ?? this.page,
      limit: limit ?? this.limit,
    );
  }

  bool get hasMore => data.length < total;
}

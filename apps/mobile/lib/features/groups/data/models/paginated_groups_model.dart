import 'package:mobile/features/groups/data/models/group_model.dart';
import 'package:mobile/features/groups/domain/entities/group_entity.dart';

class PaginatedGroupsModel extends PaginatedGroupsEntity {
  PaginatedGroupsModel({
    required super.data,
    required super.total,
    required super.page,
    required super.limit,
  });

  factory PaginatedGroupsModel.fromJson(Map<String, dynamic> json) {
    final meta = json['meta'] as Map<String, dynamic>;
    return PaginatedGroupsModel(
      data: (json['data'] as List<dynamic>)
          .map((g) => GroupModel.fromJson(g as Map<String, dynamic>))
          .toList(),
      total: meta['total'] as int,
      page: meta['page'] as int,
      limit: meta['limit'] as int,
    );
  }
}

import 'package:dio/dio.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/features/groups/data/models/group_model.dart';
import 'package:mobile/features/groups/data/models/paginated_groups_model.dart';

abstract interface class GroupRemoteDataSource {
  Future<GroupModel> getGroupById({required String id});

  Future<PaginatedGroupsModel> getGroups({
    required int page,
    required int limit,
  });
}

class GroupRemoteDataSourceImpl implements GroupRemoteDataSource {
  final DioClient dioClient;

  GroupRemoteDataSourceImpl(this.dioClient);

  @override
  Future<GroupModel> getGroupById({required String id}) async {
    try {
      final response = await dioClient.dio.get('/group/$id');
      print(response.data);
      return GroupModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception(
        e.response?.data['message'] ?? 'Failed to get group: ${e.message}',
      );
    }
  }

  @override
  Future<PaginatedGroupsModel> getGroups({
    required int page,
    required int limit,
  }) async {
    try {
      final response = await dioClient.dio.get(
        '/group/all',
        queryParameters: {'page': page, 'limit': limit},
      );
      return PaginatedGroupsModel.fromJson(
        response.data as Map<String, dynamic>,
      );
    } on DioException catch (e) {
      throw Exception(
        e.response?.data['message'] ?? 'Failed to fetch groups: ${e.message}',
      );
    }
  }
}

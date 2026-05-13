import 'package:dio/dio.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/features/groups/data/models/group_model.dart';
import 'package:mobile/features/groups/data/models/group_students_page_model.dart';
import 'package:mobile/features/groups/data/models/paginated_groups_model.dart';
import 'package:mobile/features/groups/data/models/student_scores_model.dart';

abstract interface class GroupRemoteDataSource {
  Future<GroupModel> getGroupById({required String id});

  Future<GroupStudentsPageModel> getGroupStudents({
    required String groupId,
    required int page,
    required int limit,
  });

  Future<PaginatedGroupsModel> getGroups({
    required int page,
    required int limit,
  });

  Future<GroupStudentScoresModel> getGroupStudentScores({
    required String groupId,
  });
}

class GroupRemoteDataSourceImpl implements GroupRemoteDataSource {
  final DioClient dioClient;

  GroupRemoteDataSourceImpl(this.dioClient);

  @override
  Future<GroupModel> getGroupById({required String id}) async {
    try {
      final response = await dioClient.dio.get('/group/$id');
      return GroupModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception(
        e.response?.data['message'] ?? 'Failed to get group: ${e.message}',
      );
    }
  }

  @override
  Future<GroupStudentsPageModel> getGroupStudents({
    required String groupId,
    required int page,
    required int limit,
  }) async {
    try {
      final response = await dioClient.dio.get(
        '/group/$groupId/students',
        queryParameters: {'page': page, 'limit': limit},
      );

      return GroupStudentsPageModel.fromJson(response.data);
    } on DioException catch (e) {
      throw Exception(
        e.response?.data['message'] ?? 'Failed to get students: ${e.message}',
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

  @override
  Future<GroupStudentScoresModel> getGroupStudentScores({
    required String groupId,
  }) async {
    try {
      final res = await dioClient.dio.get(
        '/student-score/today/students/$groupId',
      );
      return GroupStudentScoresModel.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception(
        e.response?.data['message'] ??
            'Failed to fetch student scores: ${e.message}',
      );
    }
  }
}

import 'package:dio/dio.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/features/leaderboard/data/models/leaderboard_model.dart';
import 'package:mobile/features/leaderboard/domain/entity/leaderboard_entity.dart';

abstract interface class LeaderBoardRemoteDataSource {
  Future<LeaderBoardPage> getGroupLeaderboard({
    required String groupId,
    required int page,
    required int limit,
  });

  Future<LeaderBoardPage> getGlobalLeaderboard({
    required int page,
    required int limit,
  });
}

class LeaderBoardRemoteDataSourceImpl implements LeaderBoardRemoteDataSource {
  final DioClient dioClient;
  LeaderBoardRemoteDataSourceImpl(this.dioClient);

  @override
  Future<LeaderBoardPage> getGlobalLeaderboard({
    required int page,
    required int limit,
  }) async {
    try {
      final res = await dioClient.dio.get(
        '/student-score/leaderboard',
        queryParameters: {'page': page, 'limit': limit},
      );
      print('global data:${res.data}');
      final data = res.data['data'] as List;
      final meta = res.data['meta'];
      return LeaderBoardPage(
        data: data.map((e) => LeaderboardModel.fromJson(e).toEntity()).toList(),
        page: meta['page'] as int,
        lastPage: meta['last_page'] as int,
        limit: meta['limit'] as int,
      );
    } on DioException catch (e) {
      throw Exception(
        e.response?.data['message'] ??
            'Failed to get leaderboard: ${e.message}',
      );
    }
  }

  @override
  Future<LeaderBoardPage> getGroupLeaderboard({
    required String groupId,
    required int page,
    required int limit,
  }) async {
    try {
      final res = await dioClient.dio.get(
        '/student-score/leaderboard/$groupId',
        queryParameters: {'page': page, 'limit': limit},
      );
      print('grouplead: ${res.data}');
      final data = (res.data['data'] as List?) ?? [];
      final meta = res.data['meta'] ?? {};
      return LeaderBoardPage(
        data: data.map((e) => LeaderboardModel.fromJson(e).toEntity()).toList(),
        page: meta['page'] as int,
        lastPage: meta['last_page'] as int,
        limit: meta['limit'] as int,
      );
    } on DioException catch (e) {
      throw Exception(
        e.response?.data['message'] ??
            'Failed to get leaderboard: ${e.message}',
      );
    }
  }
}

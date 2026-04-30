import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/leaderboard/data/datasources/leaderboard_remote_datasource.dart';
import 'package:mobile/features/leaderboard/domain/entity/leaderboard_entity.dart';
import 'package:mobile/features/leaderboard/domain/repository/leaderboard_repo.dart';

class LeaderboardRepoImpl implements LeaderboardRepository {
  final LeaderBoardRemoteDataSource remoteDataSource;
  LeaderboardRepoImpl(this.remoteDataSource);

  @override
  Future<Either<Failure, LeaderBoardPage>> getGlobalLeaderboard({
    required int page,
    required int limit,
  }) async {
    try {
      final leaderboard = await remoteDataSource.getGlobalLeaderboard(
        page: page,
        limit: limit,
      );
      return right(leaderboard);
    } catch (e) {
      return left(Failure('Failed to fetch leaderboard: $e'));
    }
  }

  @override
  Future<Either<Failure, LeaderBoardPage>> getGroupLeaderboard({
    required String groupId,
    required int page,
    required int limit,
  }) async {
    try {
      final leaderboard = await remoteDataSource.getGroupLeaderboard(
        groupId: groupId,
        page: page,
        limit: limit,
      );
      return right(leaderboard);
    } catch (e) {
      return left(Failure('Failed to fetch leaderboard: $e'));
    }
  }
}

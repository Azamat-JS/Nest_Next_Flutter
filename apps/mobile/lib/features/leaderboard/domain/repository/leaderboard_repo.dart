import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/leaderboard/domain/entity/leaderboard_entity.dart';

abstract interface class LeaderboardRepository {
  Future<Either<Failure, LeaderBoardPage>> getGroupLeaderboard({
    required String groupId,
    required int page,
    required int limit,
  });

  Future<Either<Failure, LeaderBoardPage>> getGlobalLeaderboard({
    required int page,
    required int limit,
  });
}

import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/features/leaderboard/domain/entity/leaderboard_entity.dart';
import 'package:mobile/features/leaderboard/domain/repository/leaderboard_repo.dart';

class GetGroupLeaderBoardUsecase
    implements Usecase<LeaderboardEntity, GroupLeaderBoardParams> {
  final LeaderboardRepository leaderboardRepository;
  const GetGroupLeaderBoardUsecase(this.leaderboardRepository);

  @override
  Future<Either<Failure, LeaderboardEntity>> call(
    GroupLeaderBoardParams params,
  ) async {
    return leaderboardRepository.getGroupLeaderboard(
      groupId: params.groupId,
      page: params.page,
      limit: params.limit,
    );
  }
}

class GroupLeaderBoardParams {
  final String groupId;
  final int page;
  final int limit;

  GroupLeaderBoardParams({
    required this.groupId,
    required this.page,
    required this.limit,
  });
}

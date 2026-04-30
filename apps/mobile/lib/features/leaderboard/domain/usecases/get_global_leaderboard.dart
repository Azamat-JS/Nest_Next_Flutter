import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/features/leaderboard/domain/entity/leaderboard_entity.dart';
import 'package:mobile/features/leaderboard/domain/repository/leaderboard_repo.dart';

class GetGlobalLeaderBoardUsecase
    implements Usecase<LeaderBoardPage, GlobalLeaderBoardParams> {
  final LeaderboardRepository leaderboardRepository;
  const GetGlobalLeaderBoardUsecase(this.leaderboardRepository);

  @override
  Future<Either<Failure, LeaderBoardPage>> call(
    GlobalLeaderBoardParams params,
  ) async {
    return leaderboardRepository.getGlobalLeaderboard(
      page: params.page,
      limit: params.limit,
    );
  }
}

class GlobalLeaderBoardParams {
  final int page;
  final int limit;

  GlobalLeaderBoardParams({required this.page, required this.limit});
}

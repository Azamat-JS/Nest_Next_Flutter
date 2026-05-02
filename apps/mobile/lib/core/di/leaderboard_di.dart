import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/features/leaderboard/data/datasources/leaderboard_remote_datasource.dart';
import 'package:mobile/features/leaderboard/data/repositories/leaderboard_repo_impl.dart';
import 'package:mobile/features/leaderboard/domain/repository/leaderboard_repo.dart';

Future<void> initLeaderboard() async {
  serviceLocator
    ..registerLazySingleton<LeaderBoardRemoteDataSource>(
      () => LeaderBoardRemoteDataSourceImpl(serviceLocator<DioClient>()),
    )
    ..registerLazySingleton<LeaderboardRepository>(
      () => LeaderboardRepoImpl(serviceLocator<LeaderBoardRemoteDataSource>()),
    );
}

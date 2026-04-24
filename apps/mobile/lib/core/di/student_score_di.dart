import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/features/student_scores/data/datasources/student_score_datasource.dart';
import 'package:mobile/features/student_scores/data/repositories/student_score_repository_impl.dart';
import 'package:mobile/features/student_scores/domain/repositories/student_score_repository.dart';
import 'package:mobile/features/student_scores/domain/usecases/get_today_student_score_usecase.dart';
import 'package:mobile/features/student_scores/domain/usecases/one_student_score_usecase.dart';
import 'package:mobile/features/student_scores/presentation/bloc/one_student_score_bloc.dart';
import 'package:mobile/features/student_scores/presentation/bloc/student_score_bloc.dart';

Future<void> initStudentScores() async {
  serviceLocator
    ..registerLazySingleton<StudentScoreDataSource>(
      () => StudentScoreDateSourceImpl(serviceLocator<DioClient>()),
    )
    ..registerLazySingleton<StudentScoreRepository>(
      () =>
          StudentScoreRepositoryImpl(serviceLocator<StudentScoreDataSource>()),
    )
    ..registerLazySingleton<GetTodayStudentScoresUsecase>(
      () => GetTodayStudentScoresUsecase(
        serviceLocator<StudentScoreRepository>(),
      ),
    )
    ..registerCachedFactory<OneStudentScoreUsecase>(
      () => OneStudentScoreUsecase(serviceLocator<StudentScoreRepository>()),
    )
    ..registerFactory<StudentScoreBloc>(
      () => StudentScoreBloc(serviceLocator<GetTodayStudentScoresUsecase>()),
    )
    ..registerFactory<OneStudentScoreBloc>(
      () => OneStudentScoreBloc(serviceLocator<OneStudentScoreUsecase>()),
    );
}

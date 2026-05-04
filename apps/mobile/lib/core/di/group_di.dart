import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/features/groups/data/datasources/group_local_datasource.dart';
import 'package:mobile/features/groups/data/datasources/group_remote_data_source.dart';
import 'package:mobile/features/groups/data/datasources/group_student_local_data_source.dart';
import 'package:mobile/features/groups/data/datasources/group_students_remote_datasource.dart';
import 'package:mobile/features/groups/data/datasources/user_local_data_source.dart';
import 'package:mobile/features/groups/data/repositories/group_repository_impl.dart';
import 'package:mobile/features/groups/domain/repositories/group_repository.dart';
import 'package:mobile/features/groups/domain/usecases/get_recent_group_usecase.dart';
import 'package:mobile/features/groups/domain/usecases/group_all.dart';
import 'package:mobile/features/groups/domain/usecases/group_by_id.dart';
import 'package:mobile/features/groups/domain/usecases/group_students_usecase.dart';
import 'package:mobile/features/groups/domain/usecases/group_use_case.dart';
import 'package:mobile/features/groups/domain/usecases/merge_groups.dart';
import 'package:mobile/features/groups/presentation/bloc/group/group_bloc.dart';
import 'package:mobile/features/groups/presentation/bloc/recent_group/bloc/recent_group_bloc.dart';
import 'package:mobile/features/groups/presentation/bloc/students/group_students_bloc.dart';
import 'package:sqflite/sqflite.dart';

Future<void> initGroup() async {
  serviceLocator
    ..registerLazySingleton<GroupRemoteDataSource>(
      () => GroupRemoteDataSourceImpl(serviceLocator<DioClient>()),
    )
    ..registerLazySingleton<GroupLocalDatasource>(
      () => GroupLocalDatasourceImpl(serviceLocator<Database>()),
    )
    ..registerLazySingleton<GroupStudentLocalDatasource>(
      () => GroupStudentLocalDatasourceImpl(serviceLocator<Database>()),
    )
    ..registerLazySingleton<GroupStudentsRemoteDatasource>(
      () => GroupStudentsRemoteDatasourceImpl(serviceLocator<DioClient>()),
    )
    ..registerLazySingleton<GroupRepository>(
      () => GroupRepositoryImpl(
        serviceLocator<GroupRemoteDataSource>(),
        serviceLocator<GroupLocalDatasource>(),
        serviceLocator<UserLocalDataSource>(),
        serviceLocator<GroupStudentLocalDatasource>(),
        serviceLocator<GroupStudentsRemoteDatasource>(),
      ),
    )
    ..registerLazySingleton<GetGroupsUseCase>(
      () => GetGroupsUseCase(serviceLocator<GroupRepository>()),
    )
    ..registerLazySingleton<GetGroupByIdUseCase>(
      () => GetGroupByIdUseCase(serviceLocator<GroupRepository>()),
    )
    ..registerLazySingleton<MergeGroupsUseCase>(() => MergeGroupsUseCase())
    ..registerLazySingleton(
      () => GroupUseCases(
        serviceLocator<GetGroupsUseCase>(),
        serviceLocator<GetGroupByIdUseCase>(),
        serviceLocator<MergeGroupsUseCase>(),
      ),
    )
    ..registerLazySingleton<GetGroupStudentsUsecase>(
      () => GetGroupStudentsUsecase(serviceLocator<GroupRepository>()),
    )
    ..registerLazySingleton<GetRecentGroupsUseCase>(
      () => GetRecentGroupsUseCase(serviceLocator<GroupRepository>()),
    )
    ..registerFactory<GroupStudentsBloc>(
      () => GroupStudentsBloc(
        groupStudentsUsecase: serviceLocator<GetGroupStudentsUsecase>(),
      ),
    )
    ..registerLazySingleton<RecentGroupBloc>(
      () => RecentGroupBloc(useCase: serviceLocator<GetRecentGroupsUseCase>()),
    )
    ..registerFactory<GroupBloc>(
      () => GroupBloc(useCases: serviceLocator<GroupUseCases>()),
    );
}

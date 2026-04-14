import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/features/groups/data/datasources/group_remote_data_source.dart';
import 'package:mobile/features/groups/data/repositories/group_repository_impl.dart';
import 'package:mobile/features/groups/domain/repositories/group_repository.dart';
import 'package:mobile/features/groups/domain/usecases/group_all.dart';
import 'package:mobile/features/groups/domain/usecases/group_by_id.dart';
import 'package:mobile/features/groups/domain/usecases/group_use_case.dart';
import 'package:mobile/features/groups/domain/usecases/merge_groups.dart';
import 'package:mobile/features/groups/presentation/bloc/group_bloc.dart';

Future<void> initGroup() async {
  serviceLocator
    ..registerLazySingleton<GroupRemoteDataSource>(
      () => GroupRemoteDataSourceImpl(serviceLocator<DioClient>()),
    )
    ..registerLazySingleton<GroupRepository>(
      () => GroupRepositoryImpl(serviceLocator<GroupRemoteDataSource>()),
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
    ..registerFactory<GroupBloc>(
      () => GroupBloc(serviceLocator<GroupUseCases>()),
    );
}

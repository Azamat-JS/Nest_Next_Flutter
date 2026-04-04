import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';
import 'package:mobile/core/common/cubit/auth_check_cubit.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/features/auth/data/datasourses/auth_remote_data_source.dart';
import 'package:mobile/features/auth/data/repositories/auth_repository_iml.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:mobile/features/auth/domain/usecases/current_user.dart';
import 'package:mobile/features/auth/domain/usecases/logout_user.dart';
import 'package:mobile/features/auth/domain/usecases/user_login.dart';
import 'package:mobile/features/auth/domain/usecases/user_sign_up.dart';
import 'package:mobile/features/auth/presentation/bloc/auth_bloc.dart';

final serviceLocator = GetIt.instance;

Future<void> initDependencies() async {
  serviceLocator.registerLazySingleton(() => DioClient());
  serviceLocator.registerLazySingleton(() => FlutterSecureStorage());
  serviceLocator.registerLazySingleton(() => AuthCheckCubit());

  _initAuth();
}

void _initAuth() {
  serviceLocator
    ..registerLazySingleton<AuthRemoteDataSource>(
      () => AuthRemoteDataSourceImpl(
        serviceLocator<DioClient>(),
        serviceLocator<FlutterSecureStorage>(),
      ),
    )
    ..registerLazySingleton<AuthRepository>(
      () => AuthRepositoryIml(serviceLocator<AuthRemoteDataSource>()),
    )
    ..registerLazySingleton<UserSignUp>(
      () => UserSignUp(serviceLocator<AuthRepository>()),
    )
    ..registerLazySingleton<UserLogin>(
      () => UserLogin(serviceLocator<AuthRepository>()),
    )
    ..registerLazySingleton<CurrentUser>(
      () => CurrentUser(serviceLocator<AuthRepository>()),
    )
    ..registerLazySingleton<LogoutUser>(
      () => LogoutUser(serviceLocator<AuthRepository>()),
    )
    ..registerFactory<AuthBloc>(
      () => AuthBloc(
        currentUser: serviceLocator<CurrentUser>(),
        login: serviceLocator<UserLogin>(),
        signUp: serviceLocator<UserSignUp>(),
        logout: serviceLocator<LogoutUser>(),
        authCheckCubit: serviceLocator<AuthCheckCubit>(),
      ),
    );
}

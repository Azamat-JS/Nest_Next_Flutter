import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';
import 'package:mobile/core/common/cubit/auth_check_cubit.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/features/auth/data/datasourses/auth_remote_data_source.dart';

final serviceLocator = GetIt.instance;

Future<void> initDependencies() async {
  serviceLocator.registerLazySingleton(() => DioClient());
  serviceLocator.registerLazySingleton(() => FlutterSecureStorage());
  serviceLocator.registerLazySingleton(() => AuthCheckCubit());

  _initAuth();
}

void _initAuth() {
  serviceLocator.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(
      serviceLocator<DioClient>(),
      serviceLocator<FlutterSecureStorage>(),
    ),
  );
}

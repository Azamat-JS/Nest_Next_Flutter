import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mobile/core/common/cubit/auth_check_cubit.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/features/auth/data/datasourses/auth_remote_data_source.dart';

Future<void> initCore() async {
  serviceLocator.registerLazySingleton(() => DioClient());
  serviceLocator.registerLazySingleton(() => FlutterSecureStorage());
  serviceLocator.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(
      serviceLocator<DioClient>(),
      serviceLocator<FlutterSecureStorage>(),
    ),
  );
  serviceLocator.registerLazySingleton<AuthCheckCubit>(
    () => AuthCheckCubit(serviceLocator<AuthRemoteDataSource>()),
  );
}

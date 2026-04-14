import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mobile/core/common/cubit/auth_check_cubit.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/core/network/dio_client.dart';

Future<void> initCore() async {
  serviceLocator.registerLazySingleton(() => DioClient());
  serviceLocator.registerLazySingleton(() => FlutterSecureStorage());
  serviceLocator.registerSingleton(() => AuthCheckCubit());
}

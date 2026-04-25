import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mobile/core/common/cubit/auth_check_cubit.dart';
import 'package:mobile/core/database/database_helper.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/features/auth/data/datasourses/auth_remote_data_source.dart';
import 'package:sqflite/sqflite.dart';

Future<void> initCore() async {
  final db = await DatabaseHelper.database;
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
  serviceLocator.registerLazySingleton<Database>(() => db);
}

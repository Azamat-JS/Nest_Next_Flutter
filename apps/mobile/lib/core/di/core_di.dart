import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mobile/core/common/cubit/auth_check_cubit.dart';
import 'package:mobile/core/database/database_helper.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/core/utils/notification_service.dart';
import 'package:mobile/features/auth/data/datasourses/auth_remote_data_source.dart';
import 'package:mobile/features/groups/data/datasources/user_local_data_source.dart';
import 'package:sqflite/sqflite.dart';

Future<void> initCore() async {
  final db = await DatabaseHelper.database;
  final storage = FlutterSecureStorage();

  serviceLocator.registerLazySingleton(() => DioClient());
  serviceLocator.registerLazySingleton<FlutterSecureStorage>(() => storage);
  serviceLocator.registerLazySingleton<Database>(() => db);
  serviceLocator.registerLazySingleton<NotificationService>(
    () => NotificationService(dioClient: serviceLocator()),
  );

  serviceLocator.registerLazySingleton<UserLocalDataSource>(
    () => UserLocalDataSourceImpl(serviceLocator<Database>()),
  );

  serviceLocator.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(
      serviceLocator<DioClient>(),
      serviceLocator<FlutterSecureStorage>(),
    ),
  );

  serviceLocator.registerLazySingleton<AuthCheckCubit>(
    () => AuthCheckCubit(
      serviceLocator<AuthRemoteDataSource>(),
      serviceLocator<UserLocalDataSource>(),
      serviceLocator<Database>(),
    ),
  );

  final dioClient = serviceLocator<DioClient>();

  dioClient.init(
    refreshToken: () async {
      final refresh = await storage.read(key: "refresh_token");
      if (refresh == null) return null;

      final response = await dioClient.dio.post(
        '/auth/refresh-token',
        data: {'refreshToken': refresh},
      );
      return response.data['accessToken'];
    },
    saveAccessToken: (token) async {
      await storage.write(key: 'access_token', value: token);
    },
    logout: () async {
      await storage.deleteAll();
      serviceLocator<AuthCheckCubit>().checkAuthStatus();
    },
  );
}

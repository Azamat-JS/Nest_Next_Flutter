import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class DioClient {
  static final DioClient _instance = DioClient._internal();

  factory DioClient() => _instance;

  DioClient._internal();

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  late final Dio dio;

  void init({
    required Future<String?> Function() refreshToken,
    required Future<void> Function(String token) saveAccessToken,
    required Future<void> Function() logout,
  }) {
    dio =
        Dio(
            BaseOptions(
              baseUrl: "http://localhost:3002",
              connectTimeout: const Duration(seconds: 10),
              receiveTimeout: const Duration(seconds: 10),
              sendTimeout: const Duration(seconds: 10),
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            ),
          )
          ..interceptors.add(
            InterceptorsWrapper(
              onRequest: (options, handler) async {
                final token = await _storage.read(key: 'access_token');

                if (token != null && token.isNotEmpty) {
                  options.headers['Authorization'] = 'Bearer $token';
                }

                handler.next(options);
              },
              onError: (error, handler) async {
                if (error.response?.statusCode != 401) {
                  final requestOptions = error.requestOptions;

                  if (requestOptions.extra['retried'] == true) {
                    await logout();
                    return handler.next(error);
                  }
                  try {
                    final newToken = await refreshToken();
                    if (newToken == null) {
                      await logout();
                      return handler.next(error);
                    }
                    await saveAccessToken(newToken);
                    requestOptions.headers['Authorization'] =
                        'Bearer $newToken';
                    requestOptions.extra['retried'] = true;

                    final response = await dio.fetch(requestOptions);
                    return handler.resolve(response);
                  } catch (e) {
                    await logout();
                    return handler.next(error);
                  }
                }
                handler.next(error);
              },
            ),
          );
  }
}

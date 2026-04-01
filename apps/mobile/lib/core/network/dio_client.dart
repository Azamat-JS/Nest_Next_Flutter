import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class DioClient {
  static final DioClient _instance = DioClient._internal();

  factory DioClient() => _instance;

  DioClient._internal();

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  late final Dio dio =
      Dio(
          BaseOptions(
            baseUrl: 'http://localhost:3000',
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
              // Example: if access token expired
              if (error.response?.statusCode == 401) {
                final refreshToken = await _storage.read(key: 'refresh_token');

                if (refreshToken != null) {
                  try {
                    final refreshResponse = await dio.post(
                      '/auth/refresh',
                      data: {'refreshToken': refreshToken},
                      options: Options(
                        headers: {
                          // prevent old token from being attached
                          'Authorization': null,
                        },
                      ),
                    );

                    final newAccessToken =
                        refreshResponse.data['accessToken'] as String;

                    await _storage.write(
                      key: 'access_token',
                      value: newAccessToken,
                    );

                    // Retry original request with new token
                    final requestOptions = error.requestOptions;
                    requestOptions.headers['Authorization'] =
                        'Bearer $newAccessToken';

                    final clonedResponse = await dio.fetch(requestOptions);

                    return handler.resolve(clonedResponse);
                  } catch (_) {
                    await _storage.delete(key: 'access_token');
                    await _storage.delete(key: 'refresh_token');
                  }
                }
              }

              handler.next(error);
            },
          ),
        );
}

import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/features/auth/data/models/user_model.dart';

abstract interface class AuthRemoteDataSource {
  Future<UserModel> signUpWithEmailAndPassword({
    required String username,
    required String email,
    required String password,
  });

  Future<UserModel> signInWithEmailAndPassword({
    required String email,
    required String password,
  });

  Future<UserModel?> getCurrentUser();

  Future<void> signOut();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final DioClient dioClient;
  final FlutterSecureStorage secureStorage = const FlutterSecureStorage();
  AuthRemoteDataSourceImpl(this.dioClient);

  @override
  Future<UserModel?> getCurrentUser() async {
    try {
      final response = await dioClient.dio.get('/users/me');
      return UserModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException {
      return null;
    }
  }

  @override
  Future<UserModel> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      final response = await dioClient.dio.post(
        '/users/login',
        data: {'email': email, 'password': password},
      );
      final data = response.data as Map<String, dynamic>;
      if (data['access_token'] != null) {
        await secureStorage.write(
          key: 'access_token',
          value: data['access_token'] as String,
        );
      }
      return UserModel.fromJson(data['user'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception(
        e.response?.data['message'] ?? 'Failed to sign in: ${e.message}',
      );
    }
  }

  @override
  Future<UserModel> signUpWithEmailAndPassword({
    required String username,
    required String email,
    required String password,
  }) async {
    try {
      final response = await dioClient.dio.post(
        '/users/register',
        data: {'username': username, 'email': email, 'password': password},
      );

      final data = response.data as Map<String, dynamic>;
      if (data['access_token'] != null) {
        await secureStorage.write(
          key: 'access_token',
          value: data['access_token'] as String,
        );
      }
      return UserModel.fromJson(data['user'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception(
        e.response?.data['message'] ?? 'Failed to sign up: ${e.message}',
      );
    }
  }

  @override
  Future<void> signOut() async {
    await secureStorage.delete(key: 'access_token');
  }
}

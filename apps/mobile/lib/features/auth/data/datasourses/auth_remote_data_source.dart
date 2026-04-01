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

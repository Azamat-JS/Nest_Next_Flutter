import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/common/entities/user_entity.dart';
import 'package:mobile/features/auth/data/datasourses/auth_remote_data_source.dart';
part 'auth_check_state.dart';

class AuthCheckCubit extends Cubit<AuthCheckState> {
  final AuthRemoteDataSource authRemoteDataSource;
  AuthCheckCubit(this.authRemoteDataSource) : super(AuthCheckInitial());

  void checkAuthStatus(UserEntity? user) async {
    emit(AuthChecking());
    final user = await authRemoteDataSource.getCurrentUser();
    if (user != null) {
      emit(AuthUserLoggedIn(user));
    } else {
      emit(AuthCheckInitial());
    }
  }
}

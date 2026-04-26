import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/common/entities/user_entity.dart';
import 'package:mobile/features/auth/data/datasourses/auth_remote_data_source.dart';
import 'package:mobile/features/groups/data/datasources/user_local_data_source.dart';
part 'auth_check_state.dart';

class AuthCheckCubit extends Cubit<AuthCheckState> {
  final AuthRemoteDataSource remote;
  final UserLocalDataSource local;

  AuthCheckCubit(this.remote, this.local) : super(AuthCheckInitial());

  Future<void> checkAuthStatus(UserEntity? user) async {
    emit(AuthChecking());
    final token = remote.getToken();
    final user = await authRemoteDataSource.getCurrentUser();
    if (user != null) {
      emit(AuthUserLoggedIn(user));
    } else {
      emit(AuthCheckInitial());
    }
  }
}

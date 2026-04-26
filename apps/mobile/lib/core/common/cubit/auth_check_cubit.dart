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

  Future<void> checkAuthStatus() async {
    emit(AuthChecking());
    final token = await remote.getToken();
    if (token == null) {
      emit(AuthCheckUnauthenticated());
      return;
    }
    final cachedUser = await local.getCachedUser();
    if (cachedUser != null) {
      emit(AuthUserLoggedIn(cachedUser));
      _refreshUser();
      return;
    }
    try {
      final remoteUser = await remote.getCurrentUser();
      if (remoteUser != null) {
        await local.cacheUser(remoteUser);
        emit(AuthUserLoggedIn(remoteUser));
        _refreshUser();
      } else {
        emit(AuthCheckUnauthenticated());
      }
    } catch (_) {}
  }

  Future<void> _refreshUser() async {
    try {
      final fresh = await remote.getCurrentUser();
      if (fresh != null) {
        await local.cacheUser(fresh);
        emit(AuthUserLoggedIn(fresh));
      }
    } catch (_) {}
  }
}

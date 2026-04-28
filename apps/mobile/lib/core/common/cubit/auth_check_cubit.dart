import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/common/entities/user_entity.dart';
import 'package:mobile/features/auth/data/datasourses/auth_remote_data_source.dart';
import 'package:mobile/features/groups/data/datasources/user_local_data_source.dart';
import 'package:sqflite/sqflite.dart';
part 'auth_check_state.dart';

class AuthCheckCubit extends Cubit<AuthCheckState> {
  final AuthRemoteDataSource remote;
  final UserLocalDataSource local;
  final Database db;

  AuthCheckCubit(this.remote, this.local, this.db) : super(AuthCheckInitial());

  Future<void> checkAuthStatus() async {
    emit(AuthChecking());

    try {
      final res = await db.query('current_user', limit: 1);

      if (res.isEmpty || res.first['token'] == null) {
        emit(AuthCheckUnauthenticated());
        return;
      }

      final cachedUser = await local.getCachedUser();

      if (cachedUser != null) {
        emit(AuthUserLoggedIn(cachedUser));
      } else {
        final remoteUser = await remote.getCurrentUser();

        if (remoteUser == null) {
          emit(AuthCheckUnauthenticated());
          return;
        }

        await local.cacheUser(remoteUser);
        emit(AuthUserLoggedIn(remoteUser));
      }

      _refreshUser(); // optional background update
    } catch (e) {
      emit(AuthCheckUnauthenticated());
    }
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

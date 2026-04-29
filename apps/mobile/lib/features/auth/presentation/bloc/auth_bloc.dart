import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/common/cubit/auth_check_cubit.dart';
import 'package:mobile/core/common/entities/user_entity.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/features/auth/domain/usecases/current_user.dart';
import 'package:mobile/features/auth/domain/usecases/logout_user.dart';
import 'package:mobile/features/auth/domain/usecases/user_login.dart';
import 'package:mobile/features/auth/domain/usecases/user_sign_up.dart';
import 'package:sqflite/sqflite.dart';
part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final UserSignUp _signUp;
  final UserLogin _login;
  final CurrentUser _currentUser;
  final LogoutUser _logout;
  final AuthCheckCubit _authCheckCubit;
  final Database db;
  AuthBloc({
    required UserSignUp signUp,
    required UserLogin login,
    required CurrentUser currentUser,
    required LogoutUser logout,
    required AuthCheckCubit authCheckCubit,
    required this.db,
  }) : _signUp = signUp,
       _login = login,
       _currentUser = currentUser,
       _logout = logout,
       _authCheckCubit = authCheckCubit,
       super(AuthInitial()) {
    on<AuthSignUp>(_onUserSignUp);
    on<AuthLogin>(_onUserLogin);
    on<AuthLogout>(_onUserLogout);
    on<AuthLoadCurrentUser>(_getCurrentUser);
  }

  void _getCurrentUser(
    AuthLoadCurrentUser event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    final res = await _currentUser(NoParams());
    return res.fold((l) => emit(AuthFailure(l.message)), (user) {
      _authCheckCubit.checkAuthStatus();
      emit(AuthSuccess(user));
    });
  }

  void _onUserSignUp(AuthSignUp event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final signupRes = await _signUp(
      UserSignUpParams(
        username: event.username,
        email: event.email,
        password: event.password,
        role: event.role,
      ),
    );

    if (signupRes.isLeft()) {
      final failure = signupRes.swap().getOrElse(
        (_) => Failure('Unknown error'),
      );
      emit(AuthFailure(failure.message));
      return;
    }

    final useRes = await _currentUser(NoParams());
    useRes.fold((l) => emit(AuthFailure(l.message)), (user) {
      _authCheckCubit.checkAuthStatus();
      emit(AuthSuccess(user));
    });
  }

  void _onUserLogin(AuthLogin event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final loginRes = await _login(
      UserLoginParams(email: event.email, password: event.password),
    );

    if (loginRes.isLeft()) {
      final failure = loginRes.swap().getOrElse(
        (_) => Failure('Unknown error'),
      );
      emit(AuthFailure(failure.message));
      return;
    }

    final token = loginRes.getOrElse((_) => '');

    final userRes = await _currentUser(NoParams());

    if (userRes.isLeft()) {
      final failure = userRes.swap().getOrElse((_) => Failure('Unknown error'));
      emit(AuthFailure(failure.message));
      return;
    }

    final user = userRes.getOrElse((_) => throw Exception('User not found'));

    await db.insert('current_user', {
      'id': user.id,
      'username': user.username,
      'email': user.email,
      'role': user.role,
      'token': token,
      'created_at': DateTime.now().toIso8601String(),
    }, conflictAlgorithm: ConflictAlgorithm.replace);
    final res = await db.query('current_user');
    print('BLOC DB RESULT: $res');
    _authCheckCubit.checkAuthStatus();
    emit(AuthSuccess(user));
  }

  void _onUserLogout(AuthLogout event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final res = await _logout(NoParams());
    res.fold((l) => emit(AuthFailure(l.message)), (_) => emit(AuthLoggedOut()));
  }
}

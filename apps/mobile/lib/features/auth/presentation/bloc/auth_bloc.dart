import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/common/cubit/auth_check_cubit.dart';
import 'package:mobile/core/common/entities/user_entity.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/features/auth/domain/usecases/current_user.dart';
import 'package:mobile/features/auth/domain/usecases/logout_user.dart';
import 'package:mobile/features/auth/domain/usecases/user_login.dart';
import 'package:mobile/features/auth/domain/usecases/user_sign_up.dart';
part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final UserSignUp _signUp;
  final UserLogin _login;
  final CurrentUser _currentUser;
  final LogoutUser _logout;
  final AuthCheckCubit _authCheckCubit;
  AuthBloc({
    required UserSignUp signUp,
    required UserLogin login,
    required CurrentUser currentUser,
    required LogoutUser logout,
    required AuthCheckCubit authCheckCubit,
  }) : _signUp = signUp,
       _login = login,
       _currentUser = currentUser,
       _logout = logout,
       _authCheckCubit = authCheckCubit,
       super(AuthInitial()) {
    on<AuthEvent>((_, emit) => emit(AuthLoading()));
    on<AuthSignUp>(_onUserSignUp);
    on<AuthLogin>(_onUserLogin);
    on<AuthLogout>(_onUserLogout);
    on<AuthLoadCurrentUser>(_getCurrentUser);
  }

  void _getCurrentUser(
    AuthLoadCurrentUser event,
    Emitter<AuthState> emit,
  ) async {
    final res = await _currentUser(NoParams());
    return res.fold(
      (l) => emit(AuthFailure(l.message)),
      (r) => _emitAuthSuccess(r, emit),
    );
  }

  void _onUserSignUp(AuthSignUp event, Emitter<AuthState> emit) async {
    final res = await _signUp(
      UserSignUpParams(
        username: event.username,
        email: event.email,
        password: event.password,
      ),
    );
    res.fold(
      (l) => emit(AuthFailure(l.message)),
      (r) => _emitAuthSuccess(r, emit),
    );
  }

  void _onUserLogin(AuthLogin event, Emitter<AuthState> emit) async {
    final res = await _login(
      UserLoginParams(email: event.email, password: event.password),
    );
    res.fold(
      (l) => emit(AuthFailure(l.message)),
      (r) => _emitAuthSuccess(r, emit),
    );
  }

  void _onUserLogout(AuthLogout event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final res = await _logout(NoParams());
    res.fold((l) => emit(AuthFailure(l.message)), (_) => emit(AuthLoggedOut()));
  }

  void _emitAuthSuccess(UserEntity user, Emitter<AuthState> emit) {
    _authCheckCubit.checkAuthStatus(user);
    emit(AuthSuccess(user));
  }
}

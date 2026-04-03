import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/common/entities/user_entity.dart';

part 'auth_check_state.dart';

class AuthCheckCubit extends Cubit<AuthCheckState> {
  AuthCheckCubit() : super(AuthCheckInitial());

  void checkAuthStatus(UserEntity? user) {
    if (user != null) {
      emit(AuthUserLoggedIn(user));
    } else {
      emit(AuthCheckInitial());
    }
  }
}

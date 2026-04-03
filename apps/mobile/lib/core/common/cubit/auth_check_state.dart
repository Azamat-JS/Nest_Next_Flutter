part of 'auth_check_cubit.dart';

@immutable
sealed class AuthCheckState {}

final class AuthCheckInitial extends AuthCheckState {}

final class AuthUserLoggedIn extends AuthCheckState {
  final UserEntity user;
  AuthUserLoggedIn(this.user);
}

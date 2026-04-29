import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/common/cubit/auth_check_cubit.dart';
import 'package:mobile/features/auth/presentation/pages/login_page.dart';
import 'package:mobile/features/home/presentation/pages/main_screen.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthCheckCubit, AuthCheckState>(
      builder: (context, state) {
        if (state is AuthChecking || state is AuthCheckInitial) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator.adaptive()),
          );
        }
        if (state is AuthCheckUnauthenticated) {
          return const LoginPage();
        }

        if (state is AuthUserLoggedIn) {
          return const MainScreen();
        }
        return const LoginPage();
      },
    );
  }
}

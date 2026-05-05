import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/presentation/bloc/auth_bloc.dart';

class PopupDropdown extends StatelessWidget {
  const PopupDropdown({super.key});

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      icon: Icon(Icons.menu),
      onSelected: (value) {
        switch (value) {
          case 'logout':
            context.read<AuthBloc>().add(AuthLogout());
            context.go('/login');
            break;

          case 'profile':
            context.go('/profile');
            break;
        }
      },
      itemBuilder: (context) => const [
        PopupMenuItem(value: 'profile', child: Text('Profile')),
        PopupMenuItem(value: 'logout', child: Text('Logout')),
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/common/widgets/my_list_tile.dart';
import 'package:mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:mobile/features/home/presentation/pages/profile_page.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            DrawerHeader(
              child: Center(
                child: Icon(
                  Icons.book_outlined,
                  size: 72,
                  color: Theme.of(context).colorScheme.inversePrimary,
                ),
              ),
            ),
            MyListTile(
              icon: Icons.settings_outlined,
              text: 'Settings',
              onTap: () {
                Navigator.of(context).pop();
                Navigator.of(
                  context,
                ).push(MaterialPageRoute(builder: (_) => const ProfilePage()));
              },
            ),
            MyListTile(
              icon: Icons.logout,
              text: 'Logout',
              onTap: () {
                Navigator.of(context).pop();
                context.read<AuthBloc>().add(AuthLogout());
              },
            ),
          ],
        ),
      ),
    );
  }
}

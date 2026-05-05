import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/common/widgets/app_drawer.dart';
import 'package:mobile/features/home/presentation/widgets/curved_nav_bar.dart';

class MainScreen extends StatelessWidget {
  final StatefulNavigationShell navigationShell;
  const MainScreen({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: navigationShell,
      drawer: const AppDrawer(),
      bottomNavigationBar: CurvedNavBar(
        currentIndex: navigationShell.currentIndex,
        onTap: (index) {
          navigationShell.goBranch(index);
        },
      ),
    );
  }
}

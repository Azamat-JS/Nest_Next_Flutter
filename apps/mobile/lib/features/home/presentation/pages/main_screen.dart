import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/common/widgets/app_drawer.dart';
import 'package:mobile/features/home/presentation/widgets/curved_nav_bar.dart';

class MainScreen extends StatefulWidget {
  final Widget child;
  const MainScreen({super.key, required this.child});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  @override
  Widget build(BuildContext context) {
    final List<String> routes = ['/groups', '/home', '/chat', '/profile'];
    final currentIndex = _calculateIndex(context);

    return Scaffold(
      appBar: AppBar(),
      body: widget.child,
      drawer: const AppDrawer(),
      bottomNavigationBar: CurvedNavBar(
        currentIndex: currentIndex,
        onTap: (index) {
          final target = routes[index];
          final current = GoRouterState.of(context).uri.toString();

          if (current == target) {
            context.go('/');
            Future.microtask(() => context.go(target));
          } else {
            context.go(target);
          }
        },
      ),
    );
  }

  int _calculateIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();

    if (location.startsWith('/groups')) return 0;
    if (location.startsWith('/home')) return 1;
    if (location.startsWith('/chat')) return 2;
    if (location.startsWith('/profile')) return 3;

    return 0;
  }
}

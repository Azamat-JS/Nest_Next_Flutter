import 'package:flutter/material.dart';
import 'package:mobile/core/common/widgets/app_drawer.dart';
import 'package:mobile/features/groups/presentation/pages/my_groups_page.dart';
import 'package:mobile/features/home/presentation/pages/chat_page.dart';
import 'package:mobile/features/home/presentation/pages/home_page.dart';
import 'package:mobile/features/home/presentation/pages/profile_page.dart';
import 'package:mobile/features/home/presentation/widgets/curved_nav_bar.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int currentIndex = 0;
  List pages = const [MyGroupsPage(), HomePage(), ProfilePage(), ChatPage()];
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: pages[currentIndex],
      drawer: const AppDrawer(),
      bottomNavigationBar: CurvedNavBar(
        currentIndex: currentIndex,
        onTap: (index) => {
          setState(() {
            currentIndex = index;
          }),
        },
      ),
    );
  }
}

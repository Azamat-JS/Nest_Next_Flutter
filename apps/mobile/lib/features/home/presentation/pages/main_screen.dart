import 'package:flutter/material.dart';
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
  int currentInx = 0;
  List pages = const [HomePage(), ChatPage(), ProfilePage()];
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Main screen')),
      bottomNavigationBar: CurvedNavBar(),
      body: pages[currentInx],
    );
  }
}

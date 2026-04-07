import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'package:mobile/features/home/presentation/pages/chat_page.dart';
import 'package:mobile/features/home/presentation/pages/home_page.dart';
import 'package:mobile/features/home/presentation/pages/profile_page.dart';

class CurvedNavBar extends StatefulWidget {
  const CurvedNavBar({super.key});

  @override
  State<CurvedNavBar> createState() => _CurvedNavBarState();
}

class _CurvedNavBarState extends State<CurvedNavBar> {
  final items = [
    const Icon(Icons.home, size: 30, color: Colors.white),
    const Icon(Icons.person, size: 30, color: Colors.white),
    const Icon(Icons.message, size: 30, color: Colors.white),
  ];
  List pages = const [HomePage(), ChatPage(), ProfilePage()];
  int _selectedIndex = 0;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: pages[_selectedIndex],
      backgroundColor: Colors.purple,
      appBar: AppBar(title: const Text('Curve navbar'), centerTitle: true),
      bottomNavigationBar: CurvedNavigationBar(
        backgroundColor: Colors.transparent,
        color: Colors.purple,
        buttonBackgroundColor: Colors.amber,
        height: 60,
        items: items,
        index: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
      ),
    );
  }
}

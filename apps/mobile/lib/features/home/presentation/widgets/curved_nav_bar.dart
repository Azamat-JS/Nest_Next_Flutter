import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import 'package:flutter/material.dart';

class CurvedNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  const CurvedNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return CurvedNavigationBar(
      backgroundColor: Colors.transparent,
      color: Colors.blue,
      buttonBackgroundColor: Colors.lightBlueAccent,
      height: 70,
      items: const [
        Icon(Icons.home, size: 30, color: Colors.white),
        Icon(Icons.person, size: 30, color: Colors.white),
        Icon(Icons.message, size: 30, color: Colors.white),
      ],
      index: currentIndex,
      onTap: onTap,
    );
  }
}

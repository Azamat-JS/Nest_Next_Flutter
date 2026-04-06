import 'package:flutter/material.dart';
import 'package:mobile/features/home/presentation/widgets/curved_nav_bar.dart';

class NavbarPage extends StatefulWidget {
  const NavbarPage({super.key});

  @override
  State<NavbarPage> createState() => _NavbarPageState();
}

class _NavbarPageState extends State<NavbarPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Navbar')),
      body: CurvedNavBar(),
    );
  }
}

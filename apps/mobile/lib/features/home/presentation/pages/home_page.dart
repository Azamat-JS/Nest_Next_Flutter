import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/leaderboard/presentation/bloc/leaderboard_bloc.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    context.read<LeaderboardBloc>().add(FetchGlobalLeaderboardEvent(1, 10));
  }

  @override
  Widget build(BuildContext context) {
    return Center(child: Text('Home page'));
  }
}

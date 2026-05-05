import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/leaderboard/presentation/bloc/leaderboard_bloc.dart';
import 'package:mobile/features/leaderboard/presentation/widgets/build_leaderboard_slivers.dart';

class TotalLeaderboardPage extends StatefulWidget {
  const TotalLeaderboardPage({super.key});

  @override
  State<TotalLeaderboardPage> createState() => _LeaderboardPageState();
}

class _LeaderboardPageState extends State<TotalLeaderboardPage> {
  @override
  void initState() {
    super.initState();

    context.read<LeaderboardBloc>().add(FetchGlobalLeaderboardEvent(1, 10));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Global Leaderboard')),
      body: BlocBuilder<LeaderboardBloc, LeaderboardState>(
        builder: (context, state) {
          return CustomScrollView(
            slivers: [
              const SliverToBoxAdapter(child: SizedBox(height: 12)),
              ...buildLeaderboardSlivers(
                leaderboardPage: state.globalLeaderboard,
                isLoading: state.isLoadingGlobal,
              ),
            ],
          );
        },
      ),
    );
  }
}

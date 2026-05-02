import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/leaderboard/presentation/bloc/leaderboard_bloc.dart';
import 'package:mobile/features/leaderboard/presentation/widgets/leaderboard_row.dart';

class GroupLeaderboardPage extends StatefulWidget {
  final String groupId;
  final String groupName;
  const GroupLeaderboardPage({
    super.key,
    required this.groupId,
    required this.groupName,
  });

  @override
  State<GroupLeaderboardPage> createState() => _GroupLeaderboardPageState();
}

class _GroupLeaderboardPageState extends State<GroupLeaderboardPage> {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('${widget.groupName} Leaderboard'),
        _buildHeader(),
        Expanded(
          child: BlocBuilder<LeaderboardBloc, LeaderboardState>(
            builder: (context, state) {
              final leaderboard = state.groupLeaderboard;
              if (state.isLoading && leaderboard == null) {
                return const Center(
                  child: CircularProgressIndicator.adaptive(),
                );
              }
              if (leaderboard == null) {
                return const Center(child: Text('No leaderboard'));
              }
              return ListView.builder(
                itemCount: leaderboard.data.length,
                itemBuilder: (context, index) {
                  final student = leaderboard.data[index];
                  return LeaderboardRow(student: student, index: index);
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

Widget _buildHeader() {
  return Container(
    padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 12.0),
    color: Colors.grey.shade200,
    child: Row(
      children: const [
        Expanded(flex: 3, child: Text('Student')),
        Expanded(flex: 2, child: Text('Homework')),
        Expanded(flex: 3, child: Text('Attendance')),
        Expanded(flex: 2, child: Text('Total')),
      ],
    ),
  );
}

import 'package:flutter/material.dart';
import 'package:mobile/features/leaderboard/domain/entity/leaderboard_entity.dart';
import 'package:mobile/features/leaderboard/presentation/widgets/leaderboard_row.dart';

class GroupLeaderboardPage extends StatelessWidget {
  final List<LeaderboardEntity> data;
  final String groupName;
  const GroupLeaderboardPage({
    super.key,
    required this.data,
    required this.groupName,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('$groupName Leaderboard'),
        _buildHeader(),
        ListView.builder(
          itemCount: data.length,
          itemBuilder: (context, index) {
            final student = data[index];
            return LeaderboardRow(student: student, index: index);
          },
          cacheExtent: 500,
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
        Expanded(flex: 1, child: Text('#')),
        Expanded(flex: 3, child: Text('Student')),
        Expanded(flex: 2, child: Text('Homework')),
        Expanded(flex: 3, child: Text('Attendance')),
        Expanded(flex: 2, child: Text('Total')),
      ],
    ),
  );
}

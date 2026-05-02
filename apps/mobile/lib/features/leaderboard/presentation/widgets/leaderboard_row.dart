import 'package:flutter/material.dart';
import 'package:mobile/features/leaderboard/domain/entity/leaderboard_entity.dart';

class LeaderboardRow extends StatelessWidget {
  final LeaderboardEntity student;
  final int index;
  const LeaderboardRow({super.key, required this.student, required this.index});

  Color _getRankColor() {
    if (index == 0) return Colors.blue;
    if (index == 1) return Colors.green;
    if (index == 2) return Colors.yellow;
    return Colors.transparent;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 12.0),
      decoration: BoxDecoration(
        color: _getRankColor().withAlpha(10),
        border: const Border(bottom: BorderSide(color: Colors.grey)),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: Text(
              student.username,
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(flex: 2, child: Text('${student.homework}')),
          Expanded(flex: 2, child: Text('${student.attendance}')),
          Expanded(
            flex: 2,
            child: Text(
              '${student.total}',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}

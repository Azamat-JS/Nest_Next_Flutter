import 'package:flutter/material.dart';
import 'package:mobile/features/leaderboard/domain/entity/leaderboard_entity.dart';

class LeaderboardRow extends StatelessWidget {
  final LeaderboardEntity student;
  final int index;
  const LeaderboardRow({super.key, required this.student, required this.index});

  Color _getRankColor() {
    if (index == 0) return Colors.blue;
    if (index == 1) return Colors.green;
    if (index == 2) return Colors.orange;
    return Colors.transparent;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 12.0),
      decoration: BoxDecoration(
        color: _getRankColor().withValues(alpha: 20),

        border: Border(
          left: BorderSide(color: _getRankColor(), width: index < 3 ? 4 : 0),
          bottom: BorderSide(color: Colors.grey),
        ),
      ),
      child: Row(
        children: [
          Expanded(flex: 1, child: Text('${index + 1}')),
          Expanded(
            flex: 3,
            child: Text(
              student.username,
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text('${student.homework}', textAlign: TextAlign.center),
          ),
          Expanded(
            flex: 2,
            child: Text('${student.attendance}', textAlign: TextAlign.center),
          ),
          Expanded(
            flex: 2,
            child: Text(
              '${student.total}',
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}

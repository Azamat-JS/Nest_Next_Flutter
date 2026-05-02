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
    return Container()
  }
}

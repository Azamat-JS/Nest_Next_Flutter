import 'package:flutter/material.dart';
import 'package:mobile/features/leaderboard/domain/entity/leaderboard_entity.dart';
import 'package:mobile/features/leaderboard/presentation/widgets/leaderboard_row.dart';

List<Widget> buildLeaderboardSlivers({
  required LeaderBoardPage? leaderboardPage,
  required bool isLoading,
}) {
  if (isLoading || leaderboardPage == null) {
    return const [
      SliverToBoxAdapter(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Center(child: CircularProgressIndicator.adaptive()),
        ),
      ),
    ];
  }

  if (leaderboardPage.data.isEmpty) {
    return [const SliverToBoxAdapter(child: Center(child: Text('No data')))];
  }

  return [
    SliverPersistentHeader(
      pinned: true,
      delegate: _LeaderboardHeaderDelegate(),
    ),
    SliverPadding(
      padding: const EdgeInsets.only(left: 12, right: 12, bottom: 18),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate((context, index) {
          final student = leaderboardPage.data[index];
          return LeaderboardRow(student: student, index: index);
        }),
      ),
    ),
  ];
}

class _LeaderboardHeaderDelegate extends SliverPersistentHeaderDelegate {
  @override
  double get minExtent => 50;

  @override
  double get maxExtent => 50;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        height: 50,
        color: Colors.grey.shade800,
        child: const Row(
          children: [
            Expanded(
              flex: 1,
              child: Text('#', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
            Expanded(
              flex: 3,
              child: Text(
                'Student',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                'HW',
                style: TextStyle(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                'Att',
                style: TextStyle(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                'Total',
                style: TextStyle(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) {
    return false;
  }
}

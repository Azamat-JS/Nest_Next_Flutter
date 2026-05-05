import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/groups/presentation/bloc/group/group_bloc.dart';
import 'package:mobile/features/groups/presentation/bloc/students/group_students_bloc.dart';
import 'package:mobile/features/groups/presentation/widgets/student_card.dart';
import 'package:mobile/features/leaderboard/presentation/bloc/leaderboard_bloc.dart';
import 'package:mobile/features/leaderboard/presentation/widgets/leaderboard_row.dart';
import 'package:mobile/features/student_scores/presentation/bloc/student_score_bloc.dart';

class GroupDetailsPage extends StatefulWidget {
  final String groupId;
  const GroupDetailsPage({super.key, required this.groupId});

  @override
  State<GroupDetailsPage> createState() => _GroupDetailsPageState();
}

class _GroupDetailsPageState extends State<GroupDetailsPage> {
  @override
  void initState() {
    super.initState();

    final groupId = widget.groupId;

    context.read<GroupStudentsBloc>().add(FetchGroupStudents(groupId, 1, 10));

    context.read<LeaderboardBloc>().add(
      FetchGroupLeaderboardEvent(groupId, 1, 10),
    );

    context.read<StudentScoreBloc>().add(FetchStudentScores(groupId));
  }

  @override
  Widget build(BuildContext context) {
    final group = context.select((GroupBloc b) => b.state.selectedGroup);

    final leaderboardPage = context.select(
      (LeaderboardBloc b) => b.state.groupLeaderboard,
    );

    final scores = context.select((StudentScoreBloc b) {
      return {for (final s in b.state.studentScores) s.studentId: s};
    });

    if (group == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator.adaptive()),
      );
    }
    final isStudentsLoading = context.select(
      (GroupStudentsBloc b) => b.state.isLoading,
    );

    final studentsPage = context.select(
      (GroupStudentsBloc b) => b.state.students,
    );

    return Scaffold(
      appBar: AppBar(toolbarHeight: 48, title: Text(group.name)),

      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: _GroupInfoHeader(
              teacher: group.teacher?.username ?? 'Unknown',
              studentCount: studentsPage?.data.length ?? 0,
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 12)),

          SliverToBoxAdapter(
            child: Builder(
              builder: (_) {
                if (isStudentsLoading && studentsPage == null) {
                  return const Padding(
                    padding: EdgeInsets.all(16),
                    child: Center(child: CircularProgressIndicator()),
                  );
                }

                if (studentsPage == null || studentsPage.data.isEmpty) {
                  return const SizedBox.shrink();
                }

                return SizedBox(
                  height: 350,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: studentsPage.data.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 10),
                    itemBuilder: (context, index) {
                      final student = studentsPage.data[index];
                      final score = scores[student.id];

                      return GestureDetector(
                        onTap: () {
                          context.push(
                            '/groups/${group.id}/student-scores/${student.id}'
                            '?groupId=${group.id}&username=${Uri.encodeComponent(student.username)}',
                          );
                        },
                        child: SizedBox(
                          width: 260,
                          child: StudentCard(
                            student: student,
                            homework: score?.homework ?? 0,
                            attendance: score?.attendance ?? 0,
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 16)),

          if (leaderboardPage == null)
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Center(child: CircularProgressIndicator()),
              ),
            )
          else ...[
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
                }, childCount: leaderboardPage.data.length),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Leaderboard header delegate

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

/// Group info header
class _GroupInfoHeader extends StatelessWidget {
  final String teacher;
  final int studentCount;

  const _GroupInfoHeader({required this.studentCount, required this.teacher});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            "Teacher: $teacher",
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
          ),
          Text(
            "Students: $studentCount",
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

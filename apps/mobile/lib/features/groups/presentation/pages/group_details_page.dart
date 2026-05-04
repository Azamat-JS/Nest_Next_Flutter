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

    print('studentpage: ${studentsPage?.data}');
    return Scaffold(
      appBar: AppBar(title: Text(group.name)),

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
                  return Padding(
                    padding: EdgeInsets.all(16),
                    child: Center(child: CircularProgressIndicator.adaptive()),
                  );
                }
                if (studentsPage == null || studentsPage.data.isEmpty) {
                  return const SizedBox.shrink();
                }

                return SliverToBoxAdapter(
                  child: SizedBox(
                    height: 260,
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: studentsPage.data.map((student) {
                          final score = scores[student.id];

                          return Padding(
                            padding: EdgeInsets.only(right: 10),
                            child: GestureDetector(
                              onTap: () {
                                context.push(
                                  '/student-scores/${student.id}'
                                  '?groupId=${group.id}username=${Uri.encodeComponent(student.username)}',
                                );
                              },
                              child: SizedBox(
                                width: 300,
                                child: StudentCard(
                                  student: student,
                                  homework: score?.homework ?? 0,
                                  attendance: score?.attendance ?? 0,
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
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
            SliverList(
              delegate: SliverChildBuilderDelegate((context, index) {
                final student = leaderboardPage.data[index];
                return LeaderboardRow(student: student, index: index);
              }, childCount: leaderboardPage.data.length),
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
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: const Row(
        children: [
          Expanded(flex: 1, child: Text('#')),
          Expanded(flex: 3, child: Text('Student')),
          Expanded(flex: 2, child: Text('HW', textAlign: TextAlign.center)),
          Expanded(flex: 2, child: Text('Att', textAlign: TextAlign.center)),
          Expanded(flex: 2, child: Text('Total', textAlign: TextAlign.center)),
        ],
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
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Teacher: $teacher"),
          const SizedBox(height: 6),
          Text("Students: $studentCount"),
        ],
      ),
    );
  }
}

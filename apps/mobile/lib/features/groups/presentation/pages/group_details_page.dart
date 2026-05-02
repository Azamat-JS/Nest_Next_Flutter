import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/features/groups/presentation/bloc/group/group_bloc.dart';
import 'package:mobile/features/groups/presentation/bloc/students/group_students_bloc.dart';
import 'package:mobile/features/groups/presentation/widgets/student_card.dart';
import 'package:mobile/features/leaderboard/presentation/bloc/leaderboard_bloc.dart';
import 'package:mobile/features/leaderboard/presentation/pages/group_leaderboard_page.dart';
import 'package:mobile/features/leaderboard/presentation/widgets/leaderboard_row.dart';
import 'package:mobile/features/student_scores/presentation/bloc/one_student_score_bloc.dart';
import 'package:mobile/features/student_scores/presentation/bloc/student_score_bloc.dart';
import 'package:mobile/features/student_scores/presentation/pages/student_scores_page.dart';

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
    context.read<GroupBloc>().add(FetchGroupById(widget.groupId));
    context.read<GroupStudentsBloc>().add(
      FetchGroupStudents(widget.groupId, 1, 10),
    );
    context.read<StudentScoreBloc>().add(FetchStudentScores(widget.groupId));
    context.read<LeaderboardBloc>().add(
      FetchGroupLeaderboardEvent(widget.groupId, 1, 10),
    );
  }

  @override
  Widget build(BuildContext context) {
    final group = context.select((GroupBloc bloc) => bloc.state.selectedGroup);
    final studentState = context.watch<GroupStudentsBloc>().state;
    final leaderboardState = context.watch<LeaderboardBloc>().state;
    final scoreState = context.watch<StudentScoreBloc>().state;

    final students = studentState.students?.data ?? [];
    final leaderboard = leaderboardState.groupLeaderboard?.data ?? [];
    final scores = {for (final s in scoreState.studentScores) s.studentId: s};

    if (group == null || studentState.students == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator.adaptive()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(group.name)),

      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(
            child: _GroupInfoHeader(
              teacher: group.teacher?.username ?? 'Unknown',
              studentCount: students.length,
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 12)),

          SliverToBoxAdapter(
            child: SizedBox(
              height: 260,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: students.length,
                separatorBuilder: (_, idx) => const SizedBox(width: 10),
                itemBuilder: (context, index) {
                  final student = students[index];
                  final score = scores[student.id];

                  return GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => StudentScoresPage(
                            studentId: student.id,
                            groupId: group.id,
                            username: student.username,
                          ),
                        ),
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
                  );
                },
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 8)),

          SliverPersistentHeader(
            pinned: true,
            delegate: _LeaderboardHeaderDelegate(),
          ),
          SliverList(
            delegate: SliverChildBuilderDelegate((context, index) {
              final student = leaderboard[index];
              return LeaderboardRow(student: student, index: index);
            }, childCount: leaderboard.length),
          ),
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

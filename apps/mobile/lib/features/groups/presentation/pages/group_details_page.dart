import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/features/groups/presentation/bloc/group/group_bloc.dart';
import 'package:mobile/features/groups/presentation/bloc/students/group_students_bloc.dart';
import 'package:mobile/features/groups/presentation/widgets/student_card.dart';
import 'package:mobile/features/leaderboard/presentation/bloc/leaderboard_bloc.dart';
import 'package:mobile/features/leaderboard/presentation/pages/group_leaderboard_page.dart';
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
    return Scaffold(
      appBar: AppBar(title: const Text('Group Details')),

      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 16.0),
        child: BlocBuilder<GroupStudentsBloc, GroupStudentsState>(
          builder: (context, state) {
            final studentState = state.students;
            if (state.isLoading && studentState == null) {
              return const Center(child: CircularProgressIndicator.adaptive());
            }
            if (studentState == null) {
              return const Center(child: Text('No students'));
            }
            final students = studentState.data;
            return BlocBuilder<GroupBloc, GroupState>(
              builder: (context, state) {
                if (state.selectedGroup == null) {
                  return const Text('No group loaded');
                }
                return SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Teacher: ${state.selectedGroup?.teacher?.username ?? "Unknown"}',
                      ),
                      const SizedBox(height: 10),
                      Text('Students: ${students.length}'),
                      const SizedBox(height: 20),
                      BlocBuilder<StudentScoreBloc, StudentScoreState>(
                        builder: (context, scoreState) {
                          final scoreMap = {
                            for (final s in scoreState.studentScores)
                              s.studentId: s,
                          };
                          return SizedBox(
                            height: 400,
                            child: ListView.builder(
                              itemCount: students.length,
                              scrollDirection: Axis.horizontal,
                              itemBuilder: (context, index) {
                                final student = students[index];
                                final score = scoreMap[student.id];
                                return GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => MultiBlocProvider(
                                          providers: [
                                            BlocProvider(
                                              create: (_) =>
                                                  serviceLocator<
                                                      OneStudentScoreBloc
                                                    >()
                                                    ..add(
                                                      FetchOneStudentScores(
                                                        student.id,
                                                        widget.groupId,
                                                      ),
                                                    ),
                                            ),
                                          ],
                                          child: StudentScoresPage(
                                            groupId: widget.groupId,
                                            studentId: student.id,
                                            username: student.username,
                                          ),
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
                          );
                        },
                      ),
                      const SizedBox(height: 20),
                      const _LeaderboardSection(),
                    ],
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}

class _LeaderboardSection extends StatelessWidget {
  const _LeaderboardSection();

  @override
  Widget build(BuildContext context) {
    final group = context.select((GroupBloc bloc) => bloc.state.selectedGroup);
    final leaderboard = context.select(
      (LeaderboardBloc bloc) => bloc.state.groupLeaderboard,
    );
    if (group == null) {
      return const Text('No group loaded');
    }
    if (leaderboard == null) {
      return const Text('No leaderboard');
    }
    return GroupLeaderboardSection(
      data: leaderboard.data,
      groupName: group.name,
    );
  }
}

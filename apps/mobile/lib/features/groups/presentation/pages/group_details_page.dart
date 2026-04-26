import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/groups/presentation/bloc/group/group_bloc.dart';
import 'package:mobile/features/groups/presentation/bloc/students/group_students_bloc.dart';
import 'package:mobile/features/groups/presentation/widgets/student_card.dart';
import 'package:mobile/features/student_scores/presentation/bloc/student_score_bloc.dart';
import 'package:mobile/features/student_scores/presentation/providers/student_score_provider.dart';

class GroupDetailsPage extends StatelessWidget {
  final String groupId;
  const GroupDetailsPage({super.key, required this.groupId});

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
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Teacher: ${state.selectedGroup?.teacher.username ?? ''}',
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
                        return Expanded(
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
                                      builder: (context) =>
                                          OneStudentScoreProvider.forOneStudent(
                                            student.id,
                                            groupId,
                                            student.username,
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
                  ],
                );
              },
            );
          },
        ),
      ),
    );
  }
}

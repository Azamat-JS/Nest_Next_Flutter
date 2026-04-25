import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/common/entities/user_entity.dart';
import 'package:mobile/features/groups/presentation/widgets/student_card.dart';
import 'package:mobile/features/student_scores/presentation/bloc/student_score_bloc.dart';
import 'package:mobile/features/student_scores/presentation/providers/student_score_provider.dart';

class GroupDetailsPage extends StatelessWidget {
  final List<UserEntity> students;
  final UserEntity teacher;
  final String groupId;
  const GroupDetailsPage({
    super.key,
    required this.students,
    required this.teacher,
    required this.groupId,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Group Details')),

      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Teacher: ${teacher.username}'),
            const SizedBox(height: 10),
            Text('Students: ${students.length}'),
            const SizedBox(height: 20),
            BlocBuilder<StudentScoreBloc, StudentScoreState>(
              builder: (context, scoreState) {
                final scoreMap = {
                  for (final s in scoreState.studentScores) s.studentId: s,
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
        ),
      ),
    );
  }
}

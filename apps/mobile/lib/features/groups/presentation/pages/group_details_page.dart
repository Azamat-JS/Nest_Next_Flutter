import 'package:flutter/material.dart';
import 'package:mobile/core/common/entities/user_entity.dart';
import 'package:mobile/features/groups/presentation/widgets/student_card.dart';

class GroupDetailsPage extends StatelessWidget {
  final List<UserEntity> students;
  final UserEntity teacher;
  const GroupDetailsPage({
    super.key,
    required this.students,
    required this.teacher,
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
            SizedBox(
              height: 200,
              child: ListView.builder(
                itemCount: students.length,
                scrollDirection: Axis.horizontal,
                itemBuilder: (context, index) {
                  final student = students[index];
                  return SizedBox(
                    width: 300,
                    child: StudentCard(student: student),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

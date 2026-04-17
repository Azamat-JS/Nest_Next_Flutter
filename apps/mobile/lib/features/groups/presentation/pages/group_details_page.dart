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

      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text('Teacher: ${teacher.username}'),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: students.length,
              scrollDirection: Axis.horizontal,
              itemBuilder: (context, index) {
                final student = students[index];
                return StudentCard(student: student);
              },
            ),
          ),
        ],
      ),
    );
  }
}

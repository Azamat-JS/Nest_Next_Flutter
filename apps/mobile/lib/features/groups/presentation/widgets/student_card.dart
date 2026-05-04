import 'package:flutter/material.dart';
import 'package:mobile/core/common/entities/user_entity.dart';

class StudentCard extends StatelessWidget {
  final UserEntity student;
  final int homework;
  final int attendance;
  const StudentCard({
    super.key,
    required this.student,
    this.homework = 0,
    this.attendance = 0,
  });

  @override
  Widget build(BuildContext context) {
    return Card.filled(
      margin: const EdgeInsets.symmetric(horizontal: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SingleChildScrollView(
              child: _cardBody(context, student, homework, attendance),
            ),
          ],
        ),
      ),
    );
  }
}

Widget _cardBody(
  BuildContext context,
  UserEntity student,
  int homework,
  int attendance,
) {
  return Column(
    children: [
      CircleAvatar(maxRadius: 40, backgroundColor: Colors.blue),
      const SizedBox(height: 10),
      Text(
        student.username,
        style: TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 25,
          color: Colors.lightBlue,
        ),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      const SizedBox(height: 10),
      Card.outlined(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: IntrinsicHeight(
            child: Column(
              children: [
                Text('Homework - $homework'),
                SizedBox(height: 10),
                VerticalDivider(thickness: 1, color: Colors.grey),
                Text('Attendance - $attendance'),
              ],
            ),
          ),
        ),
      ),
      const SizedBox(height: 10),
      Card.outlined(
        color: Colors.lightBlue,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 12.0),
          child: IntrinsicHeight(
            child: Column(
              children: [
                Text(
                  'TOTAL',
                  style: TextStyle(
                    color: Colors.grey.shade900,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${homework + attendance}',
                  style: TextStyle(
                    fontSize: 20,
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ],
  );
}

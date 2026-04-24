import 'package:flutter/material.dart';

class MyStudentCard extends StatelessWidget {
  final int homework;
  final int attendance;
  final String date;
  const MyStudentCard({
    super.key,
    required this.homework,
    required this.attendance,
    required this.date,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Card.filled(
        child: Column(
          children: [
            Row(children: [Icon(Icons.home_work), Text('Homework: $homework')]),
            const SizedBox(height: 10),
            Row(children: [Icon(Icons.list), Text('Attendance: $attendance')]),
            const SizedBox(height: 10),
            Row(children: [Icon(Icons.list), Text('Date: $date')]),
          ],
        ),
      ),
    );
  }
}

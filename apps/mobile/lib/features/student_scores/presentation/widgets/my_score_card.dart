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
        elevation: 3,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            children: [
              Row(children: [Icon(Icons.home), Text('Homework: $homework')]),
              const SizedBox(height: 10),
              Row(
                children: [Icon(Icons.list), Text('Attendance: $attendance')],
              ),
              const SizedBox(height: 10),
              Row(children: [Icon(Icons.calendar_month), Text('Date: $date')]),
            ],
          ),
        ),
      ),
    );
  }
}

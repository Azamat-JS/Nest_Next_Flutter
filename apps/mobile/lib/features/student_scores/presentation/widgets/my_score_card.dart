import 'package:flutter/material.dart';

class MyStudentCard extends StatelessWidget {
  final String? homeworkComment;
  final String? attendanceComment;
  final String date;
  final int homework;
  final int attendance;
  const MyStudentCard({
    super.key,
    required this.date,
    required this.homework,
    required this.attendance,
    this.homeworkComment,
    this.attendanceComment,
  });

  @override
  Widget build(BuildContext context) {
    final total = homework + attendance;
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Card.filled(
        elevation: 3,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            children: [
              Row(
                children: [
                  Icon(Icons.home),
                  SizedBox(width: 15),
                  Text('Homework: $homework', style: TextStyle(fontSize: 16)),
                ],
              ),

              if (homeworkComment != null)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text('Comment: $homeworkComment'),
                ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Icon(Icons.person),
                  SizedBox(width: 15),
                  Text(
                    'Attendance: $attendance',
                    style: TextStyle(fontSize: 16),
                  ),
                  SizedBox(width: 65),
                  Text(
                    'TOTAL: ${total.toString()}',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.blueAccent,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.end,
                  ),
                ],
              ),

              if (attendanceComment != null)
                Padding(
                  padding: EdgeInsets.only(top: 6),
                  child: Text('Comment: $attendanceComment'),
                ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Icon(Icons.calendar_month),
                  SizedBox(width: 15),
                  Text('Date: $date', style: TextStyle(fontSize: 16)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';

class MyStudentCard extends StatelessWidget {
  final String type;
  final int value;
  final String date;
  const MyStudentCard({
    super.key,
    required this.type,
    required this.value,
    required this.date,
  });

  @override
  Widget build(BuildContext context) {
    final homework = type == 'homework' ? value : 0;
    final attendance = type == 'attendance' ? value : 0;
    final total = homework + attendance;
    final normalizedDate = date.toLocalDate()
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
              const SizedBox(height: 10),
              Row(
                children: [
                  Icon(Icons.calendar_month),
                  SizedBox(width: 15),
                  Text('Date: $normalizedDate', style: TextStyle(fontSize: 16)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

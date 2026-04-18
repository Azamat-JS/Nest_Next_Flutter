import 'package:flutter/material.dart';
import 'package:mobile/core/common/entities/user_entity.dart';

class StudentCard extends StatelessWidget {
  final UserEntity student;
  const StudentCard({super.key, required this.student});

  @override
  Widget build(BuildContext context) {
    return Card.filled(
      margin: const EdgeInsets.symmetric(horizontal: 12),
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: _cardBody(context, student),
      ),
    );
  }
}

Widget _cardBody(BuildContext context, UserEntity student) {
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
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
      ),
      const SizedBox(height: 10),
      Text(student.email, style: const TextStyle(fontSize: 16)),
    ],
  );
}

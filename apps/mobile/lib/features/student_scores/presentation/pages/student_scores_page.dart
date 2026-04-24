import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/student_scores/presentation/bloc/student_score_bloc.dart';
import 'package:mobile/features/student_scores/presentation/widgets/my_score_card.dart';

class StudentScoresPage extends StatelessWidget {
  final String username;
  const StudentScoresPage({super.key, required this.username});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('$username Scores')),

      body: BlocBuilder<StudentScoreBloc, StudentScoreState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.failure != null) {
            return Center(child: Text(state.failure!.message));
          }

          final data = state.oneStudentScores;

          if (data == null) {
            return const Center(child: Text("No data"));
          }

          final scores = data.scores;
          final total = data.total;
          final totalCount = data.totalCount;

          return SizedBox(
            child: ListView.builder(
              itemCount: scores.length,
              itemBuilder: (context, index) {
                final score = scores[index];

                return MyStudentCard(
                  homework: score.homework,
                  attendance: score.attendance,
                  date: score.date,
                );
              },
            ),
          );
        },
      ),
    );
  }
}

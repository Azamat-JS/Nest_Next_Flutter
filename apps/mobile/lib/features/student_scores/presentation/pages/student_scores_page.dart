import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/student_scores/presentation/bloc/bloc/one_student_score_bloc.dart';
import 'package:mobile/features/student_scores/presentation/widgets/my_score_card.dart';

class StudentScoresPage extends StatefulWidget {
  final String username;
  final String groupId;
  final String studentId;
  const StudentScoresPage({
    super.key,
    required this.username,
    required this.groupId,
    required this.studentId,
  });

  @override
  State<StudentScoresPage> createState() => _StudentScoresPageState();
}

class _StudentScoresPageState extends State<StudentScoresPage> {
  @override
  void initState() {
    super.initState();
    context.read<OneStudentScoreBloc>().add(
      FetchOneStudentScores(widget.studentId, widget.groupId),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('${widget.username} Scores')),

      body: BlocBuilder<OneStudentScoreBloc, OneStudentScoreState>(
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

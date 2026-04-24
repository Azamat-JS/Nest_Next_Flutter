import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/features/student_scores/presentation/bloc/bloc/one_student_score_bloc.dart';
import 'package:mobile/features/student_scores/presentation/bloc/student_score_bloc.dart';
import 'package:mobile/features/student_scores/presentation/pages/student_scores_page.dart';

class StudentScoreProvider {
  static BlocProvider<StudentScoreBloc> forGroup(String groupId) {
    return BlocProvider(
      create: (_) =>
          serviceLocator<StudentScoreBloc>()..add(FetchStudentScores(groupId)),
    );
  }
}

class OneStudentScoreProvider {
  static BlocProvider<OneStudentScoreBloc> forOneStudent(
    String studentId,
    String groupId,
    String username,
  ) {
    return BlocProvider(
      create: (_) =>
          serviceLocator<OneStudentScoreBloc>()
            ..add(FetchOneStudentScores(studentId, groupId)),
      child: StudentScoresPage(
        username: username,
        studentId: studentId,
        groupId: groupId,
      ),
    );
  }
}

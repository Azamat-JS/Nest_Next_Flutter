import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/features/student_scores/presentation/bloc/student_score_bloc.dart';

class StudentScoreProvider {
  static BlocProvider<StudentScoreBloc> forGroup(String groupId) {
    return BlocProvider(
      create: (_) =>
          serviceLocator<StudentScoreBloc>()..add(FetchStudentScores(groupId)),
    );
  }
}

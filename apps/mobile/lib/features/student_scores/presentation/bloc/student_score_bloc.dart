import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/student_scores/domain/entity/student_scores_entity.dart';
part 'student_score_event.dart';
part 'student_score_state.dart';

class StudentScoreBloc extends Bloc<StudentScoreEvent, StudentScoreState> {
  StudentScoreBloc() : super(StudentScoreInitial()) {
    on<StudentScoreEvent>((event, emit) {
      // TODO: implement event handler
    });
  }
}

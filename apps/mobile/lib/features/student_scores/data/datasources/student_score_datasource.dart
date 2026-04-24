import 'package:dio/dio.dart';
import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/features/student_scores/data/model/one_student_score.dart';
import 'package:mobile/features/student_scores/data/model/student_score_model.dart';

abstract interface class StudentScoreDataSource {
  Future<List<StudentScoreModel>> getStudentScores({required String groupId});

  Future<List<OneStudentScoreModel>> getOneStudentScores({
    required String studentId,
    required String groupId,
  });
}

class StudentScoreDateSourceImpl implements StudentScoreDataSource {
  final DioClient dioClient;

  StudentScoreDateSourceImpl(this.dioClient);

  @override
  Future<List<StudentScoreModel>> getStudentScores({
    required String groupId,
  }) async {
    try {
      final response = await dioClient.dio.get(
        '/student-score/today/students/$groupId',
      );
      return StudentScoreModel.fromJsonList(response.data as List<dynamic>);
    } on DioException catch (e) {
      throw Exception(
        e.response?.data['message'] ??
            'Failed to fetch student score: ${e.message}',
      );
    }
  }

  @override
  Future<List<OneStudentScoreModel>> getOneStudentScores({
    required String studentId,
    required String groupId,
  }) async {
    try {
      final response = await dioClient.dio.get(
        '/student-score/one-student/$studentId/$groupId',
      );
      return OneStudentScoreModel.fromJsonList(response.data as List<dynamic>);
    } on DioException catch (e) {
      throw Exception(
        e.response?.data['message'] ??
            'Failed to fetch student score: ${e.message}',
      );
    }
  }
}

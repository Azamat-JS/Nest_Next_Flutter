part of 'group_students_bloc.dart';

@immutable
sealed class GroupStudentsEvent {}

final class FetchGroupStudents extends GroupStudentsEvent {
  final String groupId;
  final int page;
  final int limit;

  FetchGroupStudents(this.groupId, this.page, this.limit);
}

final class LoadMoreGroupStudents extends GroupStudentsEvent {
  final String groupId;
  final int nextPage;
  final int limit;

  LoadMoreGroupStudents(this.groupId, this.nextPage, this.limit);
}

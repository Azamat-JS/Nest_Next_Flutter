import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/common/cubit/auth_check_cubit.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/core/router/go_refresh_notifier.dart';
import 'package:mobile/features/auth/presentation/pages/login_page.dart';
import 'package:mobile/features/auth/presentation/pages/sign_up_page.dart';
import 'package:mobile/features/groups/presentation/bloc/group/group_bloc.dart';
import 'package:mobile/features/groups/presentation/bloc/students/group_students_bloc.dart';
import 'package:mobile/features/groups/presentation/pages/group_details_page.dart';
import 'package:mobile/features/groups/presentation/pages/my_groups_page.dart';
import 'package:mobile/features/student_scores/presentation/bloc/student_score_bloc.dart';
import 'package:mobile/features/student_scores/presentation/pages/student_scores_page.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/groups',
  refreshListenable: GoRouterRefreshNotifier(
    serviceLocator<AuthCheckCubit>().stream,
  ),
  redirect: (context, state) {
    final authState = context.read<AuthCheckCubit>().state;

    final isAuthChecking = authState is AuthChecking;
    final isLoggedIn = authState is AuthUserLoggedIn;

    if (isAuthChecking) return null;

    final loggingIn = state.matchedLocation == '/login';
    final signUp = state.matchedLocation == '/signup';

    if (!loggingIn && !signUp && !isLoggedIn) {
      return '/login';
    }

    if (signUp && isLoggedIn && loggingIn) {
      return '/groups';
    }

    if (loggingIn && isLoggedIn) {
      return '/groups';
    }
    return null;
  },
  routes: [
    /// Group List
    GoRoute(path: '/groups', builder: (context, state) => const MyGroupsPage()),

    /// Login page
    GoRoute(path: '/login', builder: (context, state) => const LoginPage()),

    /// Register page
    GoRoute(path: '/signup', builder: (context, state) => const SignUpPage()),

    /// Student Scores page
    GoRoute(
      path: '/student-scores/:studentId',
      builder: (context, state) {
        final studentId = state.pathParameters['studentId']!;
        final groupId = state.uri.queryParameters['groupId']!;
        final username = state.uri.queryParameters['username']!;

        return StudentScoresPage(
          studentId: studentId,
          groupId: groupId,
          username: username,
        );
      },
    ),

    /// GROUP DETAILS
    GoRoute(
      path: '/groups/:groupId',
      builder: (context, state) {
        final groupId = state.pathParameters['groupId']!;

        return MultiBlocProvider(
          providers: [
            BlocProvider(
              create: (_) =>
                  serviceLocator<GroupStudentsBloc>()
                    ..add(FetchGroupStudents(groupId, 1, 10)),
            ),
            BlocProvider(
              create: (_) =>
                  serviceLocator<GroupBloc>()..add(FetchGroupById(groupId)),
            ),
            BlocProvider(
              create: (_) =>
                  serviceLocator<StudentScoreBloc>()
                    ..add(FetchStudentScores(groupId)),
            ),
          ],
          child: GroupDetailsPage(groupId: groupId),
        );
      },
    ),
  ],
);

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/common/widgets/auth_gate.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/features/auth/presentation/pages/login_page.dart';
import 'package:mobile/features/auth/presentation/pages/sign_up_page.dart';
import 'package:mobile/features/groups/group_shell.dart';
import 'package:mobile/features/groups/presentation/bloc/group/group_bloc.dart';
import 'package:mobile/features/groups/presentation/bloc/students/group_students_bloc.dart';
import 'package:mobile/features/groups/presentation/pages/group_details_page.dart';
import 'package:mobile/features/home/presentation/pages/chat_page.dart';
import 'package:mobile/features/home/presentation/pages/home_page.dart';
import 'package:mobile/features/home/presentation/pages/main_screen.dart';
import 'package:mobile/features/home/presentation/pages/profile_page.dart';
import 'package:mobile/features/student_scores/presentation/bloc/student_score_bloc.dart';
import 'package:mobile/features/student_scores/presentation/pages/student_scores_page.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    // Auth Gate
    GoRoute(path: '/', builder: (_, state) => const AuthGate()),

    ShellRoute(
      builder: (context, state, child) {
        return MainScreen(child: child);
      },
      routes: [
        GoRoute(
          path: '/groups',
          pageBuilder: (context, state) =>
              NoTransitionPage(child: const GroupFeatureShell()),
        ),
        GoRoute(
          path: '/profile',
          pageBuilder: (context, state) => CustomTransitionPage(
            child: const ProfilePage(),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
                  return FadeTransition(opacity: animation, child: child);
                },
          ),
        ),
        GoRoute(
          path: '/home',
          pageBuilder: (context, state) =>
              NoTransitionPage(child: const HomePage()),
        ),
        GoRoute(
          path: '/chat',
          pageBuilder: (context, state) =>
              NoTransitionPage(child: const ChatPage()),
        ),
      ],
    ),

    /// Group List

    /// Login page
    GoRoute(path: '/login', builder: (context, state) => const LoginPage()),

    /// Profile page

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

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/common/widgets/auth_gate.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/features/auth/presentation/pages/login_page.dart';
import 'package:mobile/features/auth/presentation/pages/sign_up_page.dart';
import 'package:mobile/features/groups/presentation/bloc/group/group_bloc.dart';
import 'package:mobile/features/groups/presentation/bloc/recent_group/bloc/recent_group_bloc.dart';
import 'package:mobile/features/groups/presentation/bloc/students/group_students_bloc.dart';
import 'package:mobile/features/groups/presentation/pages/group_details_page.dart';
import 'package:mobile/features/groups/presentation/pages/my_groups_page.dart';
import 'package:mobile/features/home/presentation/pages/chat_page.dart';
import 'package:mobile/features/home/presentation/pages/home_page.dart';
import 'package:mobile/features/home/presentation/pages/main_screen.dart';
import 'package:mobile/features/home/presentation/pages/profile_page.dart';
import 'package:mobile/features/leaderboard/presentation/bloc/leaderboard_bloc.dart';
import 'package:mobile/features/student_scores/presentation/bloc/student_score_bloc.dart';
import 'package:mobile/features/student_scores/presentation/pages/student_scores_page.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (_, state) => const AuthGate()),

    ShellRoute(
      builder: (context, state, child) {
        return MainScreen(child: child);
      },
      routes: [
        GoRoute(
          path: '/groups',
          pageBuilder: (context, state) =>
              NoTransitionPage(child: const MyGroupsPage()),
        ),

        GoRoute(
          path: '/groups/:groupId',
          builder: (context, state) {
            final groupId = state.pathParameters['groupId']!;

            return MultiBlocProvider(
              providers: [
                BlocProvider(
                  create: (_) =>
                      serviceLocator<GroupBloc>()..add(FetchGroupById(groupId)),
                ),
                BlocProvider(
                  create: (_) => serviceLocator<GroupStudentsBloc>(),
                ),
                BlocProvider(create: (_) => serviceLocator<StudentScoreBloc>()),
                BlocProvider.value(value: serviceLocator<LeaderboardBloc>()),
                BlocProvider(
                  create: (_) =>
                      serviceLocator<RecentGroupBloc>()
                        ..add(LoadRecentGroups()),
                ),
              ],
              child: GroupDetailsPage(groupId: groupId),
            );
          },
        ),

        GoRoute(
          path: '/profile',
          pageBuilder: (context, state) => CustomTransitionPage(
            child: const ProfilePage(),
            transitionsBuilder: (_, animation, idx, child) =>
                FadeTransition(opacity: animation, child: child),
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

    GoRoute(path: '/login', builder: (_, idx) => const LoginPage()),
    GoRoute(path: '/signup', builder: (_, idx) => const SignUpPage()),

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
  ],
);

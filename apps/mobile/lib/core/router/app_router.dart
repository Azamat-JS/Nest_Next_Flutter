import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/common/cubit/auth_check_cubit.dart';
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
import 'package:mobile/features/student_scores/presentation/bloc/one_student_score_bloc.dart';
import 'package:mobile/features/student_scores/presentation/bloc/student_score_bloc.dart';
import 'package:mobile/features/student_scores/presentation/pages/student_scores_page.dart';

GoRouter createRouter(AuthCheckCubit authCheckCubit) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: authCheckCubit,
    redirect: (context, state) {
      final authState = context.read<AuthCheckCubit>().state;

      final isLoggedIn = authState is AuthUserLoggedIn;
      final isLoggingIn = state.matchedLocation == '/login';

      if (!isLoggedIn) {
        return isLoggingIn ? null : '/login';
      }

      if (isLoggedIn && isLoggingIn) {
        return '/groups';
      }

      return null;
    },
    routes: [
      GoRoute(path: '/', redirect: (_, __) => '/groups'),

      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainScreen(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/groups',
                pageBuilder: (context, state) =>
                    NoTransitionPage(child: const MyGroupsPage()),
                routes: [
                  GoRoute(
                    path: ':groupId',
                    builder: (context, state) {
                      final groupId = state.pathParameters['groupId']!;

                      return MultiBlocProvider(
                        providers: [
                          BlocProvider(
                            create: (_) =>
                                serviceLocator<GroupBloc>()
                                  ..add(FetchGroupById(groupId)),
                          ),
                          BlocProvider(
                            create: (_) => serviceLocator<GroupStudentsBloc>(),
                          ),
                          BlocProvider(
                            create: (_) => serviceLocator<StudentScoreBloc>(),
                          ),
                          BlocProvider(
                            create: (_) => serviceLocator<LeaderboardBloc>(),
                          ),
                          BlocProvider(
                            create: (_) =>
                                serviceLocator<RecentGroupBloc>()
                                  ..add(LoadRecentGroups()),
                          ),
                        ],
                        child: GroupDetailsPage(groupId: groupId),
                      );
                    },
                    routes: [
                      GoRoute(
                        path: 'student-scores/:studentId',
                        builder: (context, state) {
                          final studentId = state.pathParameters['studentId']!;
                          final groupId = state.uri.queryParameters['groupId']!;
                          final username =
                              state.uri.queryParameters['username']!;
                          return BlocProvider(
                            create: (_) =>
                                serviceLocator<OneStudentScoreBloc>()..add(
                                  FetchOneStudentScores(
                                    studentId: studentId,
                                    groupId: groupId,
                                  ),
                                ),
                            child: StudentScoresPage(
                              studentId: studentId,
                              groupId: groupId,
                              username: username,
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),

          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                pageBuilder: (context, state) => CustomTransitionPage(
                  child: const ProfilePage(),
                  transitionsBuilder: (_, animation, idx, child) =>
                      FadeTransition(opacity: animation, child: child),
                ),
              ),
            ],
          ),

          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                pageBuilder: (context, state) =>
                    NoTransitionPage(child: const HomePage()),
              ),
            ],
          ),

          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/chat',
                pageBuilder: (context, state) =>
                    NoTransitionPage(child: const ChatPage()),
              ),
            ],
          ),
        ],
      ),

      GoRoute(path: '/login', builder: (_, idx) => const LoginPage()),
      GoRoute(path: '/signup', builder: (_, idx) => const SignUpPage()),
    ],
  );
}

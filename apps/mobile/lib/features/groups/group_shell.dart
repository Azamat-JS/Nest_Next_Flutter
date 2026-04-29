import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/features/groups/presentation/bloc/group/group_bloc.dart';
import 'package:mobile/features/groups/presentation/pages/my_groups_page.dart';

class GroupFeatureShell extends StatelessWidget {
  const GroupFeatureShell({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => serviceLocator<GroupBloc>(),
      child: const MyGroupsPage(),
    );
  }
}

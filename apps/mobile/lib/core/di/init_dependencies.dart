import 'package:mobile/core/di/auth_di.dart';
import 'package:mobile/core/di/core_di.dart';
import 'package:mobile/core/di/group_di.dart';

Future<void> initDependencies() async {
  await initCore();
  await initAuth();
  await initGroup();
}

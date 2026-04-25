import 'package:mobile/core/common/entities/user_entity.dart';

abstract class UserLocalDataSource {
  Future<UserEntity?> getUser(String id);
  Future<void> cacheUser(UserEntity user);
}

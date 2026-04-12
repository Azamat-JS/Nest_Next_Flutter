class UserEntity {
  final String id;
  final String username;
  final String email;
  final String? role;

  UserEntity({
    required this.id,
    required this.username,
    required this.email,
    this.role,
  });
}

import "package:sqflite/sqflite.dart";
import "package:path/path.dart";
import "package:path_provider/path_provider.dart";

class DatabaseHelper {
  static Database? _db;

  static Future<Database> get database async {
    _db ??= await _initDb();
    return _db!;
  }

  static Future<Database> _initDb() async {
    final dir = await getApplicationDocumentsDirectory();
    final path = join(dir.path, 'app.db');

    return await openDatabase(
      path,
      version: 2,
      onCreate: _createDb,
      onUpgrade: (db, oldVersion, newVersion) async {
        if (oldVersion < 2) {
          await db.execute('ALTER TABLE groups ADD COLUMN last_opened INTEGER');
          await db.execute(
            'ALTER TABLE groups ADD COLUMN is_recent INTEGER DEFAULT 0',
          );
        }
      },
      onConfigure: (db) {
        db.execute('PRAGMA foreign_keys = ON');
      },
    );
  }

  static Future<void> _createDb(Database db, int version) async {
    await db.execute('''
    CREATE TABLE groups (
      id TEXT PRIMARY KEY,
      name TEXT,
      teacher_id TEXT,
      created_at TEXT
    );
  ''');

    await db.execute('''
    CREATE TABLE current_user (
      id TEXT PRIMARY KEY,
      username TEXT,
      role TEXT,
      email TEXT,
      token TEXT,
      created_at TEXT
    );
  ''');

    await db.execute('''
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT,
  email TEXT,
  role TEXT
);
  ''');

    await db.execute('''
    CREATE TABLE parent_student (
      id TEXT PRIMARY KEY,
      parent_id TEXT,
      student_id TEXT
    );
  ''');

    await db.execute('''
    CREATE TABLE student_group (
      id TEXT PRIMARY KEY,
      student_id TEXT,
      group_id TEXT,
      joined_at TEXT
    );
  ''');

    await db.execute('''
    CREATE TABLE student_score (
      student_id TEXT,
      group_id TEXT,
      total INTEGER DEFAULT 0,
      homework INTEGER DEFAULT 0,
      attendance INTEGER DEFAULT 0,
      updated_at TEXT,
      PRIMARY KEY (student_id, group_id)
    );
  ''');

    await db.execute('''
    CREATE TABLE score_event (
      id TEXT PRIMARY KEY,
      student_id TEXT,
      group_id TEXT,
      type TEXT,
      value INTEGER,
      date TEXT
    );
  ''');

    await db.execute('''
    CREATE INDEX idx_student_group ON student_group (student_id, group_id);
  ''');

    await db.execute('''
    CREATE INDEX idx_score_event ON score_event (student_id, group_id, date);
  ''');

    await db.execute('''
    CREATE INDEX idx_parent_student ON parent_student (parent_id, student_id);
  ''');

    await db.execute('''
    CREATE INDEX idx_users_role ON users (role);
  ''');

    await db.execute('''
    CREATE INDEX idx_groups_teacher ON groups (teacher_id);
  ''');
  }
}

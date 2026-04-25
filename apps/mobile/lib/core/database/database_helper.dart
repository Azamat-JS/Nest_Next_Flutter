import "package:sqflite/sqflite.dart";
import "package:path/path.dart";
import "package:path_provider/path_provider.dart";

class DatabaseHelper {
  static Database? _db;

  static Future<Database> get database async {
    if (_db != null) return _db!;

    _db = await _initDb();
    return _db!;
  }

  static Future<Database> _initDb() async {
    final dir = await getApplicationDocumentsDirectory();
    final path = join(dir.path, 'app.db');

    return await openDatabase(path, version: 1, onCreate: _createDb);
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
  CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT,
  role TEXT,
  email TEXT,
  created_at TEXT
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
  PRIMARY KEY (student_id, group_id)
);
''');
  }
}

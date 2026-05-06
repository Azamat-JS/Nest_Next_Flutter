import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/core/utils/notification_service.dart';
import 'package:mobile/firebase_options.dart';

Future<void> initializeAppService() async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

  serviceLocator<NotificationService>().init();
}

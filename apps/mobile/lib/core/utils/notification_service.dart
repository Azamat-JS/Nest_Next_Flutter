import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:mobile/core/network/dio_client.dart';

class NotificationService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final DioClient dioClient;

  NotificationService({required this.dioClient});

  Future<void> init() async {
    await _messaging.requestPermission();

    String? token = await _messaging.getToken();
    print("FCM Token: $token");

    await sendTokenToBackend(token);

    FirebaseMessaging.instance.onTokenRefresh.listen((newToken) async {
      print('Token refreshed: $newToken');
      await sendTokenToBackend(newToken);
    });

    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Notification received: ${message.notification?.title}');
    });

    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      print('notification opened');
      handleNavigationMessage(message);
    });

    RemoteMessage? initialMessage = await FirebaseMessaging.instance
        .getInitialMessage();

    if (initialMessage != null) {
      handleNavigationMessage(initialMessage);
    }
  }

  Future<void> sendTokenToBackend(String? token) async {
    try {
      await dioClient.dio.post('/users/device-token', data: {'token': token});
    } catch (e) {
      print('Error sending token to backend: $e');
    }
  }

  Future<void> handleNavigationMessage(RemoteMessage message) async {
    /// Handle navigation message here
  }
}

Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print("Background message: ${message.messageId}");
}

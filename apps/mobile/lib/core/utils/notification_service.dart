import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:mobile/core/network/dio_client.dart';

class NotificationService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final DioClient dioClient;

  NotificationService({required this.dioClient});

  Future<void> init() async {
    NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      sound: true,
      badge: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      String? apnsToken;

      for (int i = 0; i < 10; i++) {
        try {
          apnsToken = await _messaging.getAPNSToken();
          if (apnsToken != null) {
            break;
          }
        } catch (e) {
          print('waiting for apns token');
        }
        await Future.delayed(const Duration(seconds: 1));
      }

      print('APNS token: $apnsToken');

      if (apnsToken != null) {
        String? token = await _messaging.getToken();
        print("FCM Token: $token");
        await sendTokenToBackend(token);
      } else {
        print('apns token not available');
      }
    }

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

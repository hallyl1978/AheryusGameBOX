/// AheryusGameBOX - i18n Support
/// Flutter localization helper
///
/// Usage:
/// ```dart
/// import 'package:flutter/material.dart';
/// import 'l10n/app_localizations.dart';
///
/// Text(AppLocalizations.of(context).translate('MENU_PLAY'))
/// ```

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppLocalizations {
  final Locale locale;
  Map<String, String> _localizedStrings = {};

  AppLocalizations(this.locale);

  /// Helper method to keep syntax short
  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  /// Load JSON translations from assets
  Future<bool> load() async {
    try {
      // Load all translation files for this locale
      final categories = ['common', 'ui', 'errors', 'games'];

      for (final category in categories) {
        try {
          String jsonString = await rootBundle.loadString(
            'assets/locales/${locale.languageCode}-${locale.countryCode}/$category.json'
          );

          Map<String, dynamic> jsonMap = json.decode(jsonString);

          jsonMap.forEach((key, value) {
            _localizedStrings[key] = value.toString();
          });
        } catch (e) {
          debugPrint('Error loading $category translations for ${locale.languageCode}: $e');
        }
      }

      return true;
    } catch (e) {
      debugPrint('Error loading localizations: $e');
      return false;
    }
  }

  /// Get translated string by key
  String translate(String key, {Map<String, dynamic>? params}) {
    String? text = _localizedStrings[key];

    if (text == null) {
      debugPrint('Translation key not found: $key');
      return key;
    }

    // Replace parameters if provided
    if (params != null) {
      params.forEach((key, value) {
        text = text!.replaceAll('{$key}', value.toString());
      });
    }

    return text!;
  }

  /// Shorthand for translate
  String t(String key, {Map<String, dynamic>? params}) {
    return translate(key, params: params);
  }

  /// Common translations (shortcuts)
  String get yes => translate('COMMON_YES');
  String get no => translate('COMMON_NO');
  String get ok => translate('COMMON_OK');
  String get cancel => translate('COMMON_CANCEL');
  String get confirm => translate('COMMON_CONFIRM');
  String get save => translate('COMMON_SAVE');
  String get delete => translate('COMMON_DELETE');
  String get edit => translate('COMMON_EDIT');
  String get close => translate('COMMON_CLOSE');
  String get back => translate('COMMON_BACK');
  String get next => translate('COMMON_NEXT');
  String get loading => translate('COMMON_LOADING');
  String get error => translate('COMMON_ERROR');
  String get success => translate('COMMON_SUCCESS');

  /// Menu translations
  String get menuHome => translate('MENU_HOME');
  String get menuGames => translate('MENU_GAMES');
  String get menuPlay => translate('MENU_PLAY');
  String get menuProfile => translate('MENU_PROFILE');
  String get menuLeaderboard => translate('MENU_LEADERBOARD');
  String get menuFriends => translate('MENU_FRIENDS');
  String get menuSettings => translate('MENU_SETTINGS');
}

class AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const AppLocalizationsDelegate();

  /// Supported locales
  static const supportedLocales = [
    Locale('tr', 'TR'), // Turkish
    Locale('en', 'US'), // English
  ];

  @override
  bool isSupported(Locale locale) {
    return supportedLocales.any(
      (l) => l.languageCode == locale.languageCode && l.countryCode == locale.countryCode
    );
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    AppLocalizations localizations = AppLocalizations(locale);
    await localizations.load();
    return localizations;
  }

  @override
  bool shouldReload(AppLocalizationsDelegate old) => false;
}

var config = {};

config.musicDir = 'C:/GMusic';

config.providers = [
  {   
    name: 'GoogleMusic',
    options: {
      // Create a password here: https://security.google.com/settings/security/apppasswords?pli=1
      email: "google@email", 
      password: "google password"
    }
  }
];

config.downloads = [
  {
    provider: 'GoogleMusic',
    stations: [
      {
        // Favourites
        type: 'favourites',
        folder: null
      },
      {
        // The Ultimate Pop Party
        type: 'station',
        id: '585d152c-8d7e-31bf-bbd5-468736845a5b',
        folder: null
      }
    ]
  }
];

module.exports = config;
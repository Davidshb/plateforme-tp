# Plateforme IOT

![logo eseo](https://res.cloudinary.com/davidshbo/image/upload/v1618266961/eseo_logo.png)


[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com)
[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=shields)](http://makeapullrequest.com)

Mise en place d'un prototype d'une plateforme complète d'IOT

![image](https://res.cloudinary.com/davidshbo/image/upload/v1618294472/plateforme-iot/iot_representation.png)


# Table of contents

- [Utilisation](#utilisation)
- [Installation](#installation)
- [Pulling](#mchanisme-du-pulling)  
- [Mise à jour](#mise--jour)
- [License](#license)

# Utilisation

[(Back to top)](#table-of-contents)

la commande pour lancer le serveur
```sh
npm run server
```

la commande pour exucuter le script client
```sh
npm run client
```

# Installation

[(Back to top)](#table-of-contents)

1. Installez Node (version >= 12.* ) et NPM (version >= 6.* )
2. `npm install --save`
3. personnalisez les variables `host` et `port` dans le fichier [main.js](src/main.js)
4. Commencez à l'utiliser !


I'm an inline-style link](https://www.somewebsite.com)


# Méchanisme du pulling

## [TP3](https://github.com/Davidshb/plateforme-tp/tree/tp3)

Le client instancie une connexion avec le serveur.
Ce dernier envoie des données et reçois en réponse les commandes du serveur.
Le client envoie une requête toutes les `PUSHDATA_INTERVAL` (variable définie dans le fichier [client.js](https://github.com/Davidshb/plateforme-tp/tree/tp3/bin/client.js#L25)).
On distingue deux Commandes :
* log : indique au client d'afficher une donnée
* end : indique au client d'arrêter 

# Mise à jour

[(Back to top)](#table-of-contents)

Vous voulez mettre à jour la plateforme ?

```sh
git pull
```

ou alors récupérer de nouveaux les fichiers sur le dépôt

# License

[(Back to top)](#table-of-contents)


The General Public License (GNU) 2007. Veuillez regarder le fichier [LICENSE.md](LICENSE.md) pour plus de détails.

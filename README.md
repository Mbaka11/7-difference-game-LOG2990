# Information

Ce projet était mon deuxième projet de session a Polytechnique Montreal. Le but de ce projet était de programmer une application de dessin du genre Sketch.IO (https://sketch.io/sketchpad/). Cette application possède une grande sélection de fonctionalité et possède aussi la possibilité de sauvegarder les images
dessiné. L'application possède aussi un serveur sur lesquels les dessins peuvent être sauvegardé.

# Important

Les commandes commençant par `npm` devront être exécutées dans les dossiers `client` et `server`. Les scripts non-standard doivent être lancés en faisant `npm run myScript`.

## Installation des dépendances de l'application

-   Installer `npm`. `npm` vient avec `Node` que vous pouvez télecharger [ici](https://nodejs.org/en/download/)

-   Lancer `npm install`. Il se peut que cette commande prenne du temps la première fois qu'elle est lancée. Ceci génère un fichier `package-lock.json` avec les verisons exactes de chaque dépendance.
-   Les fois suivants, lancer `npm ci` pour installer les versions exactes des dépendances du projet. Ceci est possiblement seulement si le fichier `package-lock.json` existe.

## Développement de l'application

Pour lancer l'application, il suffit d'exécuter: `npm start`. Vous devez lancer cette commande dans le dossier `client` et `server`

#### Client :
Une page menant vers `http://localhost:4200/` s'ouvrira automatiquement.

#### Serveur :
Votre serveur est accessible sur `http://localhost:3000`. Par défaut, votre client fait une requête `GET` vers le serveur pour obtenir un message.

L'application se relancera automatiquement si vous modifiez le code source de celle-ci.

## Génération de composants du client

Pour créer de nouveaux composants, nous vous recommandons l'utilisation d'angular CLI. Il suffit d'exécuter `ng generate component component-name` pour créer un nouveau composant.

Il est aussi possible de générer des directives, pipes, services, guards, interfaces, enums, muodules, classes, avec cette commande `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Exécution des tests unitaires

-   Exécuter `npm run test` pour lancer les tests unitaires.

-   Exécuter `npm run coverage` pour générer un rapport de couverture de code.

## Exécution de TSLint

-   Exécuter `npm run lint` pour lancer TSLint.

Les règles pour le linter sont disponibles dans le fichier `tslint.json` du dossier `/common`. Toute modification de ces règles doit être approuvé par un chargé de laboratoire.


## Aide supplémentaire

Pour obtenir de l'aide supplémentaire sur Angular CLI, utilisez `ng help` ou [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

Pour la documentation d'Angular, vous pouvez la trouver [ici](https://angular.io/docs)

Pour la documentation d'Express, vous pouvez la trouver [ici](https://expressjs.com/en/4x/api.html)

Pour obtenir de l'aide supplémentaire sur les tests avec Angular, utilisez [Angular Testing](https://angular.io/guide/testing)

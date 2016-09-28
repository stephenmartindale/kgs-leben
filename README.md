KGS Leben
=========

*KGS Leben* is a client for the [KGS Go Server](http://www.gokgs.com/), written for modern, standards-compliant web browsers such as Chrome, Firefox and Microsoft Edge. It connects to the server via the [JSON API for KGS](https://www.gokgs.com/help/protocol.html) and has no other dynamic, server-side dependencies. The source-code for the client is released under the [MIT License](LICENSE) and a list of [contributors and noteable people](CONTRIBUTORS.md) can be found in the root of the source tree.

The *KGS Leben* project is only a few months old and not presently suited for general consumption. The following features have been implemented:

  * **Spectating**  --  Games played by other people can be joined and the user can watch as play continues. _Kibitz_ messages sent to the chat box will be broadcast to other spectators in the channel but the chat feature is currently non-functional in _game_ channels so the user will see neither these nor the messages typed by others.
  * **Game Playing** -- Once a game has started in which the user is a player, the user can play moves, pass, resign, win and lose on time and mark live and dead groups, should the game proceed to the scoring phase, and agree on the game's result.
  * **Joining open Challenges** -- The user can join an existing _game challenge_ in a room, negotiate the terms of the game via the usual dialogue and proceed to play.
  * **Auto-match** -- On the _Home_ view, in the sidebar, a selection of controls allows the user to set their preferences for the _automatic match-making queue_ and provides a button to join (and leave) the queue. Preferences are synchronised with the server automatically.
  * **Chatting in Rooms** -- Conversing in _rooms_ is operational in both directions. Upon a successful sign-in, the user will join the rooms that they were in when they last signed out of the server, from the _Leben_ client or the legacy one, _Cgoban_. Joining new rooms is not implemented simply because no room-list screen has been created - behind the scenes, work to do this is complete.

##Technologies

*KGS Leben* is implemented _low-tech_, without undue dependence on third-party frameworks or packages. The artefacts produced by the build-script are all static content which can be served by even the most primitive HTTP web-server and they depend only on the JQuery Javascript library.

Development dependencies are limited:

  * [Node.js](http://nodejs.org/) and its package manager, NPM
  * [Sass](http://sass-lang.com/) for convenient and maintainable style-sheets
  * [TypeScript](http://www.typescriptlang.org/) provides type-safety for scripts and insulates the code-base from obscure JavaScript quirks
  * [Gulp](http://gulpjs.com/) is used as a flexible and scriptable build system
  * [Mocha](https://mochajs.org/) provides a framework for testing domain models and algorithms

##Building the Source

Prior to compiling artefacts to be served, one must first install [Node.js](http://nodejs.org/) and clone the source repository. Thereafter, simply follow the instructions below. (Command-line commands should be executed relative to the root of the cloned source tree; paths are also relative.)

  1. Use NPM to fetch the dependencies and development dependencies defined in [package.json](package.json)

     `npm install`

  2. Execute the _build_ script defined in [package.json](package.json). This will run the Gulp task: _build_

     `npm run build`

  3. A sub-directory named `dist` will be produced, containing all artefacts required to host _KGS Leben_.

##Running the Unit-Tests

The suite of automated tests for various domain models and algorithms within the project, powered by [Mocha](https://mochajs.org/), can be built and executed with a single NPM script:

        npm test

##Serving _KGS Leben_

Any HTTP web-server should be able to serve the _KGS Leben_ web application but the path to the [JSON API](https://www.gokgs.com/help/protocol.html) is currently not configurable so the ability to serve Java Servlets is also required. [Apache Tomcat](http://tomcat.apache.org/) is recommended. The web-server must be configured to serve two _routes_:

  * `/` should route to the static content found in the `dist` sub-directory produced by the build script
  * `/jsonClient/` should route to the [KGS JSON Client Servlet](https://www.gokgs.com/help/protocol.html) (distributed as a .WAR archive)

##See Also

  * [Probabilism](https://probabilism.wordpress.com/category/kgs-leben/) for news on the project
  * [Life in 19x19](http://www.lifein19x19.com/forum/viewtopic.php?f=24&t=13145) for a discussion thread
  * [KGS Client Coding Google Group](https://groups.google.com/forum/#!forum/kgs-client-coding) for discussions related to the [KGS JSON API](https://www.gokgs.com/help/protocol.html)

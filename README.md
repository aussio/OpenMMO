# OpenMMO
A placeholder repo for a dream of mine - an open source MMO.

If you are interested in where this project goes or just want to lend me some encouragement, please Star this repo.

If you would like to ask me questions, feel free to create an Issue on GitHub and I will respond reasonably quickly.

## Goals
_roughly in priority order_
1. A modular set of practical, functioning systems that comprise a larger-scale server-authoritative online multiplayer game.
2. Created in a fashion that invites collaboration and contributions.
3. Has a non-trivial playable demo. I'm not interested in just a "framework" that isn't actually used. If there aren't games, what's the point?


### Definitions
**modular** - Game creators are able to pick and choose the pieces of the framework that are applicable to them. This may include things like account save data, physics, world generation, in-game inventory systems, chat, etc.

**larger-scale** - On the order of hundreds or thousands of players per server, not tens.

**server-authoritative** - In online games the server needs to be the source of truth for everything. Otherwise clients (players) will just cheat and break the game. For an overview see: https://www.gabrielgambetta.com/client-server-game-architecture.html

## Approach

I currently intend to attempt this project using Javascript.

I theorize that one of the largest reasons this project hasn't already been tackled is due to games traditionally only being created in very low-level languages like C++. This makes the overhead to contributing too high. However, the main reason many games are written in this fashion is that performance is a requirement to games running smoothly enough to be enjoyable. I also theorize that this is possible with higher level languages like Python, Javascript, or Go. We'll see how quickly I prove wrong. 😅

I theorize that the second largest reason hurdle is that for practical purposes _(see "server-authoritative" above)_, the client logic and server logic for multiplayer games need to be written in the same language. Otherwise you have to write everything twice. This ends up ruling out a lot of otherwise nicer languages to use.

**Why not Python or Go?** - Mostly because there doesn't exist nice game libraries. 3D libraries, physics engines, etc. Otherwise, I absolutely would have preferred to write the server in one of these languages due to personal familiarity (I'm a Python developer by trade).

**Why Javascript?** - I think it will meet our needs. The largest open question is client-side performance.
* Client-side libraries like [threejs](https://threejs.org/) and [babylonjs](https://www.babylonjs.com/) are mature, feature-rich, and performant.
* Server-side libraries like [nodejs](https://nodejs.org/en/) are also battle-tested and fast.
* Javascript is (arguably) [the most popular programming language in the world](https://insights.stackoverflow.com/survey/2020#technology-programming-scripting-and-markup-languages) and probably will be for the foreseeable future.
* Javascript enables an easy path to the game being playable on the most-used platform in the world - an internet browser.

## Documentation
[Learning Resources](learning/RESOURCES.md)
"use strict"

//
//
//Entry point for game
//
//

document.addEventListener('DOMContentLoaded', function () {
	var PIXI = require('pixi.js')
	var SpriteStack = require('./SpriteStack.js')
	var assets = require('../assets/assets.json')

	/**
	 * Sprite sheet names are stored in assets.json.
	 * Add the sprite sheets to the PIXI loader.
	 */
	for(let i in assets['spritePaths']){
		PIXI.loader.add(i, assets['spritePaths'][i])

	}

	PIXI.loader.load((loader, resources) => {
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST //makes text sharper

		// var myView = document.getElementById('game');
		// var app = new PIXI.Application(800, 600, {view: myView, antialias: false});

		var app = new PIXI.Application(1000, 600, 
		{
			antialias: false, 
			// forceCanvas: true,
			backgroundColor : 0x000000,
			view: game
		})

		document.body.appendChild(app.view)

		var ss = new SpriteStack(app, assets)
	})
})
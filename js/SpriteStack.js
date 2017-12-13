"use strict"

let perlin = require('perlin-noise')

class SpriteStack{
	constructor(app, assets){
		this.app = app
		this.W = app.renderer.width
		this.H = app.renderer.height

		//
		//
		//CONTAINERS
		//
		//

		this.rootContainer = new PIXI.Container()

		//initialize camera to 0,0 of world
		this.rootContainer.position.set(
			(app.renderer.width / 2), 
			(app.renderer.height / 2))
		
		this.worldContainer = new PIXI.Container()
		// this.worldContainer = new PIXI.particles.ParticleContainer(10000, {})

		this.rootContainer.addChild(this.worldContainer)
		app.stage.addChild(this.rootContainer)

		//
		//
		//INPUT
		//
		//

		this.mouseX
		this.mouseY
		this.mouseMoveX
		this.mouseMoveY

		this.rotSpeed = 0.5
		this.scaleSpeed = 0.7
		this.panSpeed = 5
		this.lastMag = 0

		//prevent right click menu
		document.addEventListener('contextmenu', event => event.preventDefault())

		this.keyState = {}
		window.addEventListener('keydown', (e)=>{
			this.keyState[e.key] = true
		},true)	
		window.addEventListener('keyup', (e)=>{
			this.keyState[e.key] = false
		},true)
		window.addEventListener('wheel', (e)=>{
			if(e.deltaY < 0){
				this.keyState['zoomIn'] = true
			}
			else if(e.deltaY > 0){
				this.keyState['zoomOut'] = true
			}
		}, {passive: true})
		window.addEventListener('mousedown', (event)=>{
			//if right mouse button down, and in canvas
			if(event.which === 3 
				&& event.offsetX > 0 && event.offsetX < this.W
				&& event.offsetY > 0 && event.offsetY < this.H){
				this.keyState['rightmouse'] = true
			}

			if(event.which === 1 
				&& event.offsetX > 0 && event.offsetX < this.W
				&& event.offsetY > 0 && event.offsetY < this.H){
				this.keyState['leftmouse'] = true
			}
		})
		window.addEventListener('mouseup', (event)=>{
			if(event.which === 3){
				this.keyState['rightmouse'] = false
			}
			if(event.which === 1){
				this.keyState['leftmouse'] = false
			}
		})
		window.addEventListener('mouseupoutside', (event)=>{
			if(event.which === 3){
				this.keyState['rightmouse'] = false
			}
			if(event.which === 1){
				this.keyState['leftmouse'] = false
			}
		})
		window.addEventListener('mousemove', (event)=>{
			if(event.clientX > -1 && event.clientX < this.W){
				this.mouseX = event.clientX
				this.mouseMoveX = event.movementX
			}

			if(event.clientY > -1 && event.clientY < this.H){
				this.mouseY = event.clientY
				this.mouseMoveY = event.movementY
			}
		})
		window.addEventListener
		('click', (evt)=>{
			this.keyState["click"] = true
		})

		//
		//
		//MAP GENERATION
		//
		//

		let stackNames = []
		let stackFrames = []

		for(let i in PIXI.loader.resources){
			if(i.includes("_image"))
				continue

			stackNames.push(i)
			stackFrames.push(PIXI.loader.resources[i].data.frames)
		}

		this.spriteStacks = []
		this.arc = (Math.PI / 180) * 0
		this.worldContainer.rotation = this.arc
		this.stackHeight = 1
		this.storyHeight = 25

		let spriteCount = 0
		let stackIter = 0

		let makeThePerlin = (x, y, sprData, order, pileContainer)=>{
			// let thingContainer = new PIXI.Container()
			let thingContainer = new PIXI.particles.ParticleContainer(126, {})

			let frames = Object.keys(PIXI.loader.resources[sprData.name].data.frames)
			this.spriteStacks.push([])

			for(let i = 0; i < frames.length; i++){
				let spr = PIXI.Sprite.fromFrame(frames[i])

				spr.origX = x
				spr.origY = y
				spr.story = sprData.story

				spr.x = -Math.sin(this.arc) 
				* ((i + (spr.story * this.storyHeight)) * this.stackHeight) 
				+ spr.origX

				spr.y = -Math.cos(this.arc) 
				* ((i + (spr.story * this.storyHeight)) * this.stackHeight) 
				+ spr.origY

				spr.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST
				spr.scale.y = -1
				spr.anchor.set(0.5, 0.5)
				spr.order = order

				//reference
				this.spriteStacks[stackIter].push(spr)

				spriteCount++
			
				//actual
				thingContainer.addChild(spr)
			}
			pileContainer.addChild(thingContainer)
			// this.worldContainer.addChild(thingContainer)
			stackIter++
		}

		this.map = []
		this.piles = []
		let d = 20
		this.tileSize = 15
		const h = perlin.generatePerlinNoise(d, d)

		let allowed = []
		for(let i in stackNames){
			if(stackNames[i].includes("scene"))
				allowed.push(stackNames[i])
		}

		for(let y = 0; y < d; y++){
			let row = []
			for(let x = 0; x < d; x++){
				row.push({})
			}
			this.map.push(row)
		}


		for(let y = 0; y < d; y++){
			for(let x = 0; x < d; x++){
				let perl = h[(d * y) + x]

				let storyiter = 0;
				
				this.map[x][y][storyiter] = {}
				this.map[x][y][storyiter].name = "grass15"
				this.map[x][y][storyiter].story = 0
				storyiter++

				if(perl < 0.5){
					this.map[x][y][storyiter] = {}
					this.map[x][y][storyiter].name = "stonewallcorner15"
					this.map[x][y][storyiter].story = 0
					storyiter++

					this.map[x][y][storyiter] = {}
					this.map[x][y][storyiter].name = "jewrat15"
					this.map[x][y][storyiter].story = 1
					storyiter++

					this.map[x][y][storyiter] = {}
					this.map[x][y][storyiter].name = "dudu15"
					this.map[x][y][storyiter].story = 2
				}else{
					
				}

				
			}
		}

		for(let y = 0; y < d; y++){
			for(let x = 0; x < d; x++){
				let pileContainer = new PIXI.Container()
				for(let i = 0;; i++){
					if(this.map[x][y][i] !== undefined){
						makeThePerlin(x * this.tileSize, y * this.tileSize, this.map[x][y][i], i, pileContainer)
					}
					else{
						break
					}
				}
				this.worldContainer.addChild(pileContainer)
				this.piles.push(pileContainer)
			}
		}

		console.log(this.piles)

		

		

		console.log(spriteCount)

		

		let callUpdate = ()=> { 
			this.update()
		}
		let ticker = PIXI.ticker.shared
		ticker.add(callUpdate)
		ticker.start()
	}

	getdist(x1, y1, x2, y2){
		return Math.sqrt(
			Math.pow((x2 - x1), 2)
			+
			Math.pow((y2 - y1), 2)
			)
	}

	updateSpriteRotations(){
		// for(let i = 0; i < this.worldContainer.children.length; i++){
		// 	for(let j = 0; j < this.worldContainer.children[i].children.length; j++){
		// 		for(let k = 0; k < this.worldContainer.children[i].children[j].children.length; k++){
		// 			let spr = this.worldContainer.children[i].children[j].children[k]

		// 			spr.x = -Math.sin(this.arc) * (k * this.stackHeight) + spr.origX
		// 			spr.y = -Math.cos(this.arc) * (k * this.stackHeight) + spr.origY
		// 		}
		// 	}
		// }

		for(let i = 0; i < this.spriteStacks.length; i++){
			for(let j = 0; j < this.spriteStacks[i].length; j++){
				let spr = this.spriteStacks[i][j]

				spr.x = -Math.sin(this.arc) 
				* ((j + (spr.story * this.storyHeight)) * this.stackHeight) 
				+ spr.origX

				spr.y = -Math.cos(this.arc) 
				* ((j + (spr.story * this.storyHeight)) * this.stackHeight) 
				+ spr.origY
			}
		}
	}

	update(){
		let rotRight = false
		let rotLeft = false
		let rotMag = 0

		let updateRotations = false

		if(this.mouseX < this.W / 2){
			rotLeft = true
			rotMag = 1 - (this.mouseX / (this.W / 2))
			rotMag = -rotMag
		}
		else if(this.mouseX >= this.W / 2){
			rotRight = true
			rotMag = 1 - (this.mouseX / (this.W / 2))
		}

		//rotate right with mouse
		if(
			rotRight
			&& this.keyState['rightmouse'])
		{
			this.arc += (Math.PI / 180) * rotMag
			this.worldContainer.rotation = this.arc
			updateRotations = true
		}

		//rotate right with keyboard
		if(
			this.keyState['e'])
		{
			this.arc += (Math.PI / 180) * -1
			this.worldContainer.rotation = this.arc
			updateRotations = true
		}

		//rotate left with mouse
		if(
			rotLeft
			&& this.keyState['rightmouse'])
		{
			this.arc -= (Math.PI / 180) * rotMag
			this.worldContainer.rotation = this.arc
			updateRotations = true
		}

		//rotate left with keyboard
		if(
			this.keyState['q'] )
		{
			this.arc -= (Math.PI / 180) * -1
			this.worldContainer.rotation = this.arc
			updateRotations = true
		}
		
		if(this.keyState['leftmouse'])
		{
			let mag = 0
			let dist = 0
			let mult = 0.3

			//get magnitude based on mouse movement
			if(this.mouseY < this.H / 2){
				let mag2 = (1 - this.mouseY / (this.H / 2)) * 2
				mag += this.mouseMoveX * mult
			}else if(this.mouseY >= this.H / 2){
				let mag2 = (1 - this.mouseY / (this.H / 2)) * 2
				mag += this.mouseMoveX * -mult
			}
			if(this.mouseX < this.W / 2){
				let mag2 = (1 - this.mouseX / (this.W / 2)) * 2
				mag += this.mouseMoveY * -mult
			}else if(this.mouseX >= this.W / 2){
				mag += this.mouseMoveY * mult
			}

			//if we're probably jittering back and forth,
			//don't rotate
			if(mag == -this.lastMag)
				mag = 0
			if(mag != 0){
				this.lastMag = mag
			}

			//make a multiplier that's greater the farther the 
			//mouse is from the center of the screen
			dist = this.getdist((this.W / 2), (this.H / 2), this.mouseX, this.mouseY)
			let maxDist = this.getdist((this.W / 2), (this.H / 2), this.W, this.H)
			let distMult = (dist / maxDist)
			if(distMult < 0.1)
				distMult = 0
			else
				distMult *= 1.4

			this.arc += (Math.PI / 180) * mag // * distMult

			this.worldContainer.rotation = this.arc

			updateRotations = true

			this.mouseMoveX = 0
			this.mouseMoveY = 0
		}

		//rotate a stack
		if(this.keyState['f']){
			for(let j = 0; j < this.worldContainer.children[0].children.length; j++){
				for(let k = 0; k < this.worldContainer.children[0].children[j].children.length; k++){
					this.worldContainer.children[0].children[j].children[k].rotation += 45 * (Math.PI / 180 )
					this.worldContainer.children[0].children[j].onChildrenChange(0)
				}
			}
			
		}

		if(updateRotations)
			this.updateSpriteRotations()

		//swap stack
		if(this.keyState['g']){
			for(let k = 0; k < this.spriteStacks.length; k++){
				// let newFrames = PIXI.loader.resources["the4"].textures
				let newFrames = PIXI.loader.resources[
					Object.keys(PIXI.loader.resources)[
					Math.floor(Math.random() * Object.keys(PIXI.loader.resources).length)]
				].textures

				let randStackIndex = Math.floor(Math.random() * this.spriteStacks.length)
				// let randStack = this.spriteStacks[randStackIndex]
				let randStack = this.spriteStacks[k]

				let sprIter = 0
				for(let i in newFrames){
					if(randStack[sprIter] !== undefined){
						randStack[sprIter].visible = true
						randStack[sprIter].texture = newFrames[i]
						sprIter++
					}else{
						break
					}
				}

				//if any left over, make them blank
				for(let i = sprIter; i < randStack.length; i++){
					// randStack[i].visible = false //only work for not particle container
					let blankTex = PIXI.loader.resources["scene_houseaa_126"].textures["scene_houseaa_60"]
					randStack[i].texture = blankTex
				}

			}

			for(let i = 0; i < this.worldContainer.children.length; i++){
				this.worldContainer.children[i].onChildrenChange(0)
			}

			// this.worldContainer.children[randStackIndex].onChildrenChange(0)

		}

		//sort things by global y to make occlusion work
		this.worldContainer.children.sort((a, b) => {
		    return this.worldContainer.toGlobal(
				a.children[0].children[0].position).y
				- 
				this.worldContainer.toGlobal(
				b.children[0].children[0].position).y
		})

		// for(let i in this.piles){
		// 	this.piles[i].children.sort((a, b) => {
		// 	    return a.children[0].order - b.children[0].order
		// 	})
		// }

		// for(let i = 0; i < this.worldContainer.children.length; i++){
		// 	// console.log(this.worldContainer.children[i])
		// 	this.worldContainer.children[i].children.sort((a, b) => {
		// 	    return a.children[0].order - b.children[0].order
		// 	})
		// }
		

		

		//
		//
		//PANNING
		//
		//
		
		let down = false
		let up = false
		let left = false
		let right = false

		if(this.keyState['d'] || this.keyState['D']){
			right = true
		}
		if(this.keyState['a'] || this.keyState['A']){
			left = true
		}
		if(this.keyState['w'] || this.keyState['W']){
			up = true
		}
		if(this.keyState['s'] || this.keyState['S']){
			down = true
		}
		if(right){
			this.worldContainer.pivot.set(
				this.worldContainer.pivot.x + Math.cos(this.arc) * this.panSpeed,
				this.worldContainer.pivot.y + -Math.sin(this.arc) * this.panSpeed)
		}
		if(left){
			this.worldContainer.pivot.set(
				this.worldContainer.pivot.x + -Math.cos(this.arc) * this.panSpeed,
				this.worldContainer.pivot.y + Math.sin(this.arc) * this.panSpeed)
		}
		if(up){
			this.worldContainer.pivot.set(
				this.worldContainer.pivot.x + -Math.sin(this.arc) * this.panSpeed,
				this.worldContainer.pivot.y + -Math.cos(this.arc) * this.panSpeed)
		}
		if(down){
			this.worldContainer.pivot.set(
				this.worldContainer.pivot.x + Math.sin(this.arc) * this.panSpeed,
				this.worldContainer.pivot.y + Math.cos(this.arc) * this.panSpeed)
		}
		
		//
		//
		//ZOOMING
		//
		//
		
		if (this.keyState['zoomIn']){
			this.rootContainer.scale.x /= this.scaleSpeed
			this.rootContainer.scale.y /= this.scaleSpeed
			this.keyState['zoomIn'] = false

		}else if (this.keyState['zoomOut']){
			this.rootContainer.scale.x *= this.scaleSpeed
			this.rootContainer.scale.y *= this.scaleSpeed
			this.keyState['zoomOut'] = false
		}


		var point = new PIXI.Point(this.mouseX, this.mouseY)
		// console.log(this.worldContainer.toLocal(point))

		let worldMouseX = this.worldContainer.toLocal(point).x
		let worldMouseY = this.worldContainer.toLocal(point).y

		let mouseTileX = Math.floor((worldMouseX + (this.tileSize / 2)) / this.tileSize)
		let mouseTileY = Math.floor((worldMouseY + (this.tileSize / 2)) / this.tileSize)

		

		if(this.keyState["click"]){
			if(this.map[mouseTileX] !== undefined
				&& this.map[mouseTileX][mouseTileY] !== undefined)
			{
				console.log(this.map[mouseTileX][mouseTileY])
				//do somethin
			}
			

			this.keyState["click"] = false
		}
	}
}

module.exports = SpriteStack
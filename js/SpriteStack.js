"use strict"

//vox2png 

class SpriteStack{
	constructor(app, assets){
		this.rootContainer = new PIXI.Container()

		//initialize camera to 0,0 of world
		this.rootContainer.position.set(
			(app.renderer.width / 2), 
			(app.renderer.height / 2))
		
		this.worldContainer = new PIXI.Container()
		// this.worldContainer = new PIXI.particles.ParticleContainer(10000, {})

		this.rootContainer.addChild(this.worldContainer)
		app.stage.addChild(this.rootContainer)

		this.W = app.renderer.width
		this.H = app.renderer.height

		//
		//
		//input
		//
		//
		
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

		this.mouseX
		this.mouseY
		this.mouseMoveX
		this.mouseMoveY

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

		// this.rootContainer.interactive = true
		// this.rootContainer.on('mousemove', (event)=>{
		// 	if(event.data.global.x > -1 && event.data.global.x < this.W){
		// 		this.mouseX = event.data.global.x
		// 		this.mouseMoveX = event.data.originalEvent.movementX
		// 	}

		// 	if(event.data.global.y > -1 && event.data.global.y < this.H){
		// 		this.mouseY = event.data.global.y
		// 		this.mouseMoveY = event.data.originalEvent.movementY
		// 	}
		// })
		// .on('rightdown', (event)=>{
		// 	this.keyState['rightmouse'] = true
		// })
		// .on('rightup', (event)=>{
		// 	this.keyState['rightmouse'] = false
		// })
		// .on('rightupoutside', (event)=>{
		// 	this.keyState['rightmouse'] = false
		// })

		//create game
		console.log(PIXI.loader.resources)

		let stackNames = []
		let stackFrames = []

		for(let i in PIXI.loader.resources){
			if(i.includes("_image"))
				continue

			stackNames.push(i)
			stackFrames.push(PIXI.loader.resources[i].data.frames)
		}

		this.stacks = []

		// let frames = Object.keys(stackFrames)
		// let spriteStack = []

		this.arc = (Math.PI / 180) * 135
		this.worldContainer.rotation = this.arc
		this.stackHeight = 1

		let makeThe = (x, y, stackNum)=>{
			// let thingContainer = new PIXI.Container()
			let thingContainer = new PIXI.particles.ParticleContainer(126, {})

			let randStack = stackFrames[Math.floor(Math.random() * stackFrames.length)]
			let frames = Object.keys(randStack)
			this.stacks.push([])

			for(let i = 0; i < frames.length; i++){
				let spr = PIXI.Sprite.fromFrame(frames[i])

				spr.origX = x
				spr.origY = y
				spr.x = -Math.sin(this.arc) * (i * this.stackHeight) + spr.origX
				spr.y = -Math.cos(this.arc) * (i * this.stackHeight) + spr.origY
				spr.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST
				spr.scale.y = -1
				spr.anchor.set(0.5, 0.5)

				//reference
				this.stacks[stackNum].push(spr)
				//actual
				thingContainer.addChild(spr)
			}
			this.worldContainer.addChild(thingContainer)
		}

		let radius = 2000
		for(let i = 0; i < 100; i++){
			makeThe(Math.random() * radius, Math.random() * radius, i)
		}

		this.rotSpeed = 0.5
		this.scaleSpeed = 0.9
		this.panSpeed = 2
		this.lastMag = 0

		//start update loop
		setInterval(()=>{
			requestAnimationFrame(this.update.bind(this))
		}, 1)
	}

	getdist(x1, y1, x2, y2){
		return Math.sqrt(
			Math.pow((x2 - x1), 2)
			+
			Math.pow((y2 - y1), 2)
			)
	}

	update(){
		// let rotRight = false
		// let rotLeft = false
		// let rotMag = 0

		// if(this.mouseX < this.W / 2){
		// 	rotLeft = true
		// 	rotMag = 1 - (this.mouseX / (this.W / 2))
		// 	rotMag = -rotMag
		// }
		// else if(this.mouseX >= this.W / 2){
		// 	rotRight = true
		// 	rotMag = 1 - (this.mouseX / (this.W / 2))
		// }

		// //rotate right
		// if(
		// 	this.keyState['e'] 
		// 	|| 
		// 	(rotRight
		// 	&& this.keyState['rightmouse'])
		// 	)
		// {
		// 	this.arc += (Math.PI / 180) * rotMag
		// 	this.worldContainer.rotation = this.arc

		// 	for(let i = 0; i < this.worldContainer.children.length; i++){
		// 		for(let j = 0; j < this.worldContainer.children[i].children.length; j++){
		// 			let spr = this.worldContainer.children[i].children[j]

		// 			spr.x = -Math.sin(this.arc) * (j * this.stackHeight) + spr.origX
		// 			spr.y = -Math.cos(this.arc) * (j * this.stackHeight) + spr.origY
		// 		}
		// 	}
		// }

		// //rotate left
		// if(
		// 	this.keyState['q'] 
		// 	|| 
		// 	(rotLeft
		// 	&& this.keyState['rightmouse'])
		// 	)
		// {
		// 	this.arc -= (Math.PI / 180) * rotMag
		// 	this.worldContainer.rotation = this.arc

		// 	for(let i = 0; i < this.worldContainer.children.length; i++){
		// 		for(let j = 0; j < this.worldContainer.children[i].children.length; j++){
		// 			let spr = this.worldContainer.children[i].children[j]

		// 			spr.x = -Math.sin(this.arc) * (j * this.stackHeight) + spr.origX
		// 			spr.y = -Math.cos(this.arc) * (j * this.stackHeight) + spr.origY
		// 		}
		// 	}
		// }
		
		if(this.keyState['leftmouse'])
		{
			let mag = 0
			let dist = 0
			let mult = 1

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

			for(let i = 0; i < this.stacks.length; i++){
				for(let j = 0; j < this.stacks[i].length; j++){
					let spr = this.stacks[i][j]

					spr.x = -Math.sin(this.arc) * (j * this.stackHeight) + spr.origX
					spr.y = -Math.cos(this.arc) * (j * this.stackHeight) + spr.origY
				}
			}

			// for(let i = 0; i < this.worldContainer.children.length; i++){
			// 	for(let j = 0; j < this.worldContainer.children[i].children.length; j++){
			// 		let spr = this.worldContainer.children[i].children[j]

			// 		spr.x = -Math.sin(this.arc) * (j * this.stackHeight) + spr.origX
			// 		spr.y = -Math.cos(this.arc) * (j * this.stackHeight) + spr.origY
			// 	}
			// }

			this.mouseMoveX = 0
			this.mouseMoveY = 0
		}

		//rotate a stack
		if(this.keyState['f']){
			for(let j = 0; j < this.worldContainer.children[0].children.length; j++){
				this.worldContainer.children[0].children[j].rotation += 0.01
			}
			this.worldContainer.children[0].onChildrenChange(0)
		}

		//swap stack
		if(this.keyState['g']){
			for(let k = 0; k < this.stacks.length; k++){
				// let newFrames = PIXI.loader.resources["the4"].textures
				let newFrames = PIXI.loader.resources[
					Object.keys(PIXI.loader.resources)[Math.floor(Math.random() * Object.keys(PIXI.loader.resources).length)]
				].textures

				let randStackIndex = Math.floor(Math.random() * this.stacks.length)
				// let randStack = this.stacks[randStackIndex]
				let randStack = this.stacks[k]

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
					let blankTex = PIXI.loader.resources["the4"].textures["samidle_19"]
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
				a.children[0].position).y
				- 
				this.worldContainer.toGlobal(
				b.children[0].position).y
		})

		let down = false
		let up = false
		let left = false
		let right = false

		//panning
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
		
		//zoom
		if (this.keyState['zoomIn']){
			this.rootContainer.scale.x /= this.scaleSpeed
			this.rootContainer.scale.y /= this.scaleSpeed
			this.keyState['zoomIn'] = false

		}else if (this.keyState['zoomOut']){
			this.rootContainer.scale.x *= this.scaleSpeed
			this.rootContainer.scale.y *= this.scaleSpeed
			this.keyState['zoomOut'] = false
		}
	}
}

module.exports = SpriteStack
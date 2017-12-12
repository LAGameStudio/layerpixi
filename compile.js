"use strict"

//vox2png assets/voxdrafts/samidle1.vox assets/fake3ds/samidle1.png

let jsonfile = require('jsonfile')
var fs = require('fs'),
    PNG = require('pngjs').PNG
let recursive = require('recursive-readdir')
let exec = require('child_process').exec
var shell = require('shelljs')

let fileName = "samidle1"
let fileDim = 10

let dirPath = "./assets/voxes/"
let voxes = []

//where we save each png to
let pngSaveDirectories = []

//vox file names
let voxFileNames = []

//collect voxes that we need to convert
new Promise(function(resolve, reject){
	recursive(dirPath, ['*.exe'], function (err, files){
		files.forEach(file => {
			if(file.indexOf(".vox") != -1){
				voxes.push(file)
			}
		})
		resolve()
	})
}).then(createPNGs)

//use vox2png to generate PNGs from .vox files
function createPNGs(){
	//vox directory without vox file
	let voxFileDirectories = []

	for(let i = 0; i < voxes.length; i++){
		let voxPath = voxes[i]

		let voxPathArr = voxPath.split("\\")
		let voxFile = voxPathArr[voxPathArr.length - 1]
		voxFileNames.push(voxFile)

		let voxDir = voxPath.replace(voxFile, "")
		voxFileDirectories.push(voxDir.replace(/\\/g, "/"))
		
		let pngSaveDir = voxDir.replace("voxes", "pngs").replace(/\\/g, "\\\\")
		pngSaveDirectories.push(pngSaveDir)

		//make save directory if it doesn't exist
		shell.mkdir('-p', pngSaveDir)
	}



	//run vox2png on every .vox file
	let vox2pngPromises = []
	for(let i = 0; i < voxes.length; i++){
		vox2pngPromises.push(
			new Promise(function(resolve, reject){
				//vox2png command
				let cmd = "vox2png " + voxFileDirectories[i] 
				+ voxFileNames[i] + " " + pngSaveDirectories[i].replace(/\\\\/g, "/")
				+ voxFileNames[i].replace(".vox", ".png")

				exec(cmd, function(error, stdout, stderr) {
					if(error)
						console.log(error)
					resolve()
				})
			})
		)
	}
	Promise.all(vox2pngPromises).then(function(){
		createAtlases()
	})
}

function createAtlases(){
	let program = []
	let assets = {}

	for(let i = 0; i < voxes.length; i++){
		let pngInfo

		let pngDir = pngSaveDirectories[i].replace(/\\\\/g, "/")
		let pngName = voxFileNames[i].replace(".vox", ".png")

		program.push(
			new Promise(function(resolve, reject){
				fs.createReadStream(pngDir + pngName)
				    .pipe(new PNG({
				        filterType: 4
				    }))
				    .on('parsed', (res)=> {
				    	pngInfo = res
				    	let atlas = fillInAtlas(pngInfo, voxFileNames[i].replace(".vox", ""))

						let jsonName = pngName.replace(".png", ".json")

						jsonfile.writeFile(
							pngDir + jsonName, 
							atlas, 
							{spaces: 4}, 
							function(err) {
								// console.error("writefile error: " + err)
							}
						)

						assignObject(assets, 
							['spritePaths', voxFileNames[i].replace(".vox", "")], 
							pngDir + jsonName)

				        resolve()
				    })
			})
		)
	}

	Promise.all(program).then(function(){
		jsonfile.writeFile("assets/assets.json", assets, {spaces: 4}, function(err) {
			// console.error(err)
		})
	})
}

function fillInAtlas(result, name){
	let atlas = {}
	let frameIter = -1

	atlas['meta'] = {}
	atlas['meta']['image'] = name + '.png'
	atlas['meta']['size'] = {
		"w": result.width,
		"h": result.height
	}
	atlas['meta']['scale'] = '1'

	atlas['frames'] = {}

	let frameW = fileDim
	let frameH = fileDim
	let numFrames = result.width / (frameW + 1)

	for(let i = 0; i < numFrames; i++){
		var n = name + "_" + i
		atlas['frames'][n] = {}
		atlas['frames'][n]['frame'] = {}

		atlas['frames'][n]['frame'].x = (i * frameW) + i
		atlas['frames'][n]['frame'].y = 0
		atlas['frames'][n]['frame'].w = frameW
		atlas['frames'][n]['frame'].h = frameH

		atlas['frames'][n]['rotated'] = false
		atlas['frames'][n]['trimmed'] = false

		atlas['frames'][n]['spriteSourceSize'] = {}
		atlas['frames'][n]['spriteSourceSize'].x = 0
		atlas['frames'][n]['spriteSourceSize'].y = 0
		atlas['frames'][n]['spriteSourceSize'].w = frameW
		atlas['frames'][n]['spriteSourceSize'].h = frameH

		atlas['frames'][n]['sourceSize'] = {}
		atlas['frames'][n]['sourceSize'].w = frameW
		atlas['frames'][n]['sourceSize'].h = frameH
	}

	return atlas
}

/**
 * Shove an object into a nested object
 * 
 * @param  {[type]}
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
function assignObject(obj, keyPath, value) {
	let lastKeyIndex = keyPath.length - 1

	for (let i = 0; i < lastKeyIndex; i++) {
		let key = keyPath[i]
		if (!(key in obj))
			obj[key] = {}
		obj = obj[key]
	}
	obj[keyPath[lastKeyIndex]] = value
}





// Globaal variables
var canvas
var canvas2
var init = false
var track = new Audio()
var timeout
var stopped = false

const elemCanvas = document.getElementById("canvas")
const elemCanvas2 = document.getElementById("canvas2")
const overlay = document.getElementById("overlay")
const overlayTrans = document.getElementById("overlayTrans")
const outer = document.getElementById("outer")
const controls = document.getElementById("playback-icon-container-container")

animEfectos = [
    { estilo: "opacity", efectoIn: "", efectoOut: "" }, // 0 - Sin Efecto 
    { estilo: "opacity", efectoIn: "easeInQuart", efectoOut: "easeInQuart" }, // 1 - 🡆 Transparente 🡆
    { estilo: "left", efectoIn: "easeInQuad", efectoOut: "easeOutQuart" }, // 2 - 🡆 Acelerado 🡆
    { estilo: "left", efectoIn: "easeOutBounce", efectoOut: "easeInOutBack" }, // 3 - 🡆 Rebote 🡆
    { estilo: "top", efectoIn: "easeInQuad", efectoOut: "easeOutQuart" }, // 4 - 🡇 Acelerado 🡅
    { estilo: "top", efectoIn: "easeOutBounce", efectoOut: "easeInOutBack" }, // 5 - 🡇 Rebote 🡅
]

// Create canvas
createCanvas = () => {

    // Set canvas dimension according browser size

    const r = 1.777778
    const rz = 1
    var w = outer.offsetWidth - 20
    var h = w/r
    if (h >= outer.offsetHeight - 20) {
        h= outer.offsetHeight - 20 
        w= h*r
    }
    var z =w/640*rz
    elemCanvas.width = w*rz
    elemCanvas.height = w/r *rz

    elemCanvas2.width = w*rz
    elemCanvas2.height = w/r *rz

    // Create a wrapper around native canvas element (with id="canvas")
    canvas = new fabric.Canvas("canvas")
    canvas.width = w*rz
    canvas.height = h*rz

    canvas2 = new fabric.Canvas("canvas2")
    canvas2.width = w*rz
    canvas2.height = h*rz

    // Center the canvas
    elemCanvas.style.left = Math.round(( outer.offsetWidth - canvas.width ) / 2 ) + "px"
    elemCanvas.style.top = Math.round(( outer.offsetHeight - canvas.height ) / 2 ) + "px" 

    elemCanvas2.style.left = Math.round(( outer.offsetWidth - canvas.width ) / 2 ) + "px"
    elemCanvas2.style.top = Math.round(( outer.offsetHeight - canvas.height ) / 2 - canvas.height) + "px" 

    // Maximize canvas to container  
    canvas.setZoom(z)
    canvas2.setZoom(z)
}

// Load and renderize scene
loadScene = (numScene) => {

    let escena = project.escenas[numScene].fabric

    canvas.loadFromJSON(escena, () => {
        canvas.renderAll()

        escena.objects.forEach( (obj, i) =>{
            effectIn(canvas.item(i), canvas)
        })

    })

    setTimeout(() => {
        console.info(project.escenas.length, numScene )
        if (project.escenas.length - 1 > numScene) {
            outScene(numScene)
        }
        
    }, 5000)
}

// Load scene without animation
loadCanvasScene = (currentCanvas, numScene) => {

    let escena = project.escenas[numScene].fabric
    currentCanvas.loadFromJSON(escena, () => {
        currentCanvas.renderAll()
        if (numScene==0) {
            loadInAnimation(currentCanvas, numScene) 
        }

    })

}

// Perform IN animation for each scene element
loadInAnimation = (currentCanvas, numScene) => {

    let escena = project.escenas[numScene].fabric
    escena.objects.forEach( (obj, i) =>{
        effectIn(currentCanvas.item(i), currentCanvas)
        
    })

    if (currentCanvas==canvas) {
        if (project.escenas.length - 1 > numScene) {
            loadCanvasScene (canvas2, numScene+1)
        }
        
    } else {
        if (project.escenas.length - 1 > numScene) {
            loadCanvasScene (canvas, numScene+1)
        }
        
    }

    if (init) {
        let audio = new Audio()
        audio.src = "./" + numScene + ".wav"
        audio.load()
        audio.play()
        audio.addEventListener("ended", () => {
            console.info("Fin audio")
            
            if (project.escenas.length - 1 > numScene && !stopped) {
                stopped = false
                loadOutAnimation(currentCanvas, numScene)
            } else {
                setTimeout(()=>{
                    track.pause()
                }, 3000)
            }
        })

        
    }

}

// Perform OUT animation for each scene element
loadOutAnimation = (currentCanvas, numScene) => {

    let escena = project.escenas[numScene].fabric
    escena.objects.forEach( (obj, i) =>{
        effectOut(currentCanvas.item(i), currentCanvas)
    })

    if (currentCanvas==canvas) {
        console.info("Entro !")
        setTimeout( () => {
            
            elemCanvas2.style.visibility = "visible"
            elemCanvas.style.visibility = "hidden"
            
            if (project.escenas.length - 1 > numScene) {
                loadInAnimation(canvas2, numScene+1)
            }
        } , 1000)
        
    } else {
        setTimeout( () => {
            
            elemCanvas.style.visibility = "visible"
            elemCanvas2.style.visibility = "hidden"
            if (project.escenas.length - 1 > numScene) {
                loadInAnimation(canvas, numScene+1)
            }
        } , 1000)
    }
}

// Exit from scene
outScene = (numScene) => {

    // overlayTrans.style.transition= "opacity 0.2s ease"
    // overlayTrans.style.opacity = 1

    // setTimeout(()=>{
    //     overlayTrans.style.transition= "opacity 0.2s ease"
    //     overlayTrans.style.opacity = 0
    // }, 300)

    let escena = project.escenas[numScene].fabric

    escena.objects.forEach( (obj, i) =>{
        effectOut(canvas.item(i), canvas)
    })


    setTimeout(() => {
        numScene++
        loadScene(numScene)
    }, 600)
}

// Perform the enter effect
effectIn = (obj, canvas) => {
    console.info("obj.animation", obj.animation)
    const efecto = this.animEfectos[obj.animation.inEffect].efectoIn
    const estilo = this.animEfectos[obj.animation.inEffect].estilo
    const offset = parseFloat(String(obj.animation.inSeg))*1000 

    console.info("Animation:", estilo, efecto, offset)

    let valorFinal

    switch (estilo) {

        case 'opacity':
            valorFinal = obj.opacity
            obj.opacity = efecto == "" ? 1: 0
            break

        case 'left':
            valorFinal = obj.left
            obj.left = -obj.width * obj.scaleX - 10
            break

        case 'top':
            valorFinal = obj.top
            obj.top = -obj.height * obj.scaleY - 10
            break

    }


    obj.hasControls = false
    obj.hasBorders = false


    setTimeout(()=>{
        obj.animate(estilo, valorFinal, {
            duration: 500,
            onChange: canvas.renderAll.bind(canvas)
            , easing: fabric.util.ease[efecto]
        })
        if (obj.animation.inSeg && obj.animation.inSeg != null ) {
            const duration = parseFloat(String(obj.animation.duration))*1000 
            if (duration > 0.5) {
                setTimeout(()=>{
                    effectOut(obj, canvas)
                }, duration)
            }
        }
    }, offset )
    
}

// Perform the exit effect
effectOut = (obj, canvas) => {

    const efecto = this.animEfectos[obj.animation.outEffect].efectoOut
    const estilo = this.animEfectos[obj.animation.outEffect].estilo

    let valorFinal = 0
    let valorInicial = 0

    switch (estilo) {

        case 'opacity':
            valorFinal =  efecto == "" ? 1: 0
            valorInicial = 1
            break

        case 'left':
            valorFinal = (obj.width * obj.scaleX) / 2 + 50 + 640
            valorInicial = obj.left
            break

        case 'top':
            valorInicial = obj.top
            valorFinal = -obj.height * obj.scaleY - 10
            break


    }


    obj.animate(estilo, valorFinal, {
        duration: 500,
        onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease['easeInOutBack']
    })
}

function onClickInit() {
    console.info("Starting...")
    init = true
    overlay.style.display = "none"
    track.src = "./track.mp3"
    track.load()
    track.volume = 0.1;
    track.play()
    loadCanvasScene(canvas, 0)

}

/************************** PLAY CONTROL FUNCTIONS*****************************/

function onMove() {
    controls.style.opacity = 1
    clearTimeout(timeout);
    timeout = setTimeout(()=>{
        controls.style.opacity = 0
    }, 2000)

}

function onStop() {
    stopped = true
}

function onNext() {
    //loadOutAnimation(currentCanvas, numScene)
}

function onSwitchMute() {
    console.info(audio.volume)
}



/******************************************************************************/

// Init
createCanvas()
loadCanvasScene(canvas, 0)
//loadInAnimation (canvas, 0)
// Load first scene
//loadScene(0)










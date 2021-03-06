;(function () {
    let canvas, ctx;

    class LogicObject {
        constructor (x = 0, y = 0) {
            this.x = Number(x);
            this.y = Number(y);
            this.size = 50;
            this.outputNode = null;
            this.inputNodes = [];

            this.isSelected = false;
        }

        draw(ctx) {}

        updateState(updatedNodes) {}

        clickCallback() {}

        getAllNodes() {
            // Ineffiecent to do this everytime. Consider generater or precomputing.
            let nodes = [];
            for (let node of this.inputNodes) {
                nodes.push(node);
            }
            nodes.push(this.outputNode);
            return nodes;
        }

        moveBy(dx, dy) {
            this.x += dx;
            this.y += dy;

            for (let node of this.inputNodes) {
                node.x += dx;
                node.y += dy;
            }
            this.outputNode.x += dx;
            this.outputNode.y += dy;
        }

        inHitBox(x, y) {
            return (this.x <= x && x <= this.x+this.size && this.y <= y && y <= this.y+this.size);
        }


    }

    class Switch extends LogicObject {
        constructor (x = 0, y = 0) {
            super(x, y);
            this.outputNode = new Node(this.x+70, this.y+25, true);
            this.state = false;
        }

        draw(ctx, scale) {
            ctx.save();
            if (this.state) {
                ctx.fillStyle = 'red'
            } else {
                ctx.fillStyle = 'white';
            }
            if (this.isSelected) {
                ctx.strokeStyle = 'blue';
            } else {
                ctx.strokeStyle = 'black';
            }
            
            ctx.lineWidth = 2;
        
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x+50, this.y);
            ctx.lineTo(this.x+50, this.y+50);
            ctx.lineTo(this.x, this.y+50);
            ctx.closePath();

            ctx.fill();
            ctx.stroke();
        }

        clickCallback() {
            this.outputNode.hardState = !this.outputNode.hardState;
            this.state = !this.state;
        }
    }

    class NANDGate extends LogicObject {
        constructor (x = 0, y = 0) {
            super(x, y);
            this.inputNodes = [new Node(this.x-20, this.y+12, true), 
                               new Node(this.x-20, this.y+38, true)];
            
            this.outputNode = new Node(this.x+95, this.y+25, true);

            for (let node of this.inputNodes) {
                node.logicObject = this;
            }
        }
    
        draw (ctx, scale) {
            ctx.save();
    
            ctx.fillStyle = 'white';
            ctx.lineWidth = 2;
    
            ctx.beginPath();
            if (this.isSelected) {
                ctx.strokeStyle = 'blue';
            } else {
                ctx.strokeStyle = 'black';
            }
            ctx.moveTo(this.x*scale, this.y*scale);
            ctx.lineTo((this.x+25)*scale, this.y*scale);
    
            ctx.arc((this.x+50)*scale, (this.y+25)*scale, 25*scale, -Math.PI/2, Math.PI/2);
            ctx.lineTo(this.x*scale, (this.y+50)*scale);
            ctx.closePath();

            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(this.x, this.y+12);
            ctx.lineTo(this.x-16, this.y+12);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.x, this.y+38);
            ctx.lineTo(this.x-16, this.y+38);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.x+75, this.y+25);
            ctx.lineTo(this.x+91, this.y+25);
            ctx.stroke();


            // for (let node of this.inputNodes) {
            //     node.draw(ctx);
            // }

            ctx.restore();
        }

        updateState(updated) {
            this.outputNode.hardState = false;
            // for (let node of this.inputNodes) {
            //     if (!updated.has(node)) {
            //         node.updateState(updated);
            //     }
            // }
            for (let node of this.inputNodes) {
                this.outputNode.hardState |= !node.softState;                
            }
            this.outputNode.prev = this.outputNode.hardState;
            // this.outputNode.updateState(updated);
        }
    }

    class Node {
        constructor (x = 0, y = 0, isAnchor=false) {
            this.x = x;
            this.y = y;
            // this.filled = false;
            this.isAnchor = isAnchor;
            this.neighbours = new Set();
            this.hardState = false;
            this.softState = false;
            this.logicObject = null;
        }

        addNeigbour(node) {
            this.neighbours.add(node);
        }

        isConnected(node, prev = null) {
            if (node === this) {
                return true;
            } else {
                for (let v of this.neighbours) {
                    if (v !== prev) {
                        if (v.isConnected(node, this)) {
                            return true;
                        }
                    }
                }
                return false;
            }
        }

        removeNeigbour(node) {
            this.neighbours.delete(node);
        }

        removeFromNeibours() {
            for (let node of this.neighbours) {
                node.removeNeigbour(this);
            }
        }

        removeAllNodes() {
            this.neighbours = new Set();
        }

        updateState(updated) {
            this.softState = this.hardState;
            updated.add(this);
            for (let node of this.neighbours) {
                if (!updated.has(node)) {
                    node.updateState(updated);
                }
                this.softState |= node.softState;
            }
            // if (this.logicObject) {
            //     this.logicObject.updateState(updated);
            // }
        }

        draw(ctx, updated) {
            ctx.save();
            ctx.strokeStyle = 'black';

            if (this.softState) {
                ctx.fillStyle = 'red';
            } else {
                ctx.fillStyle = 'black';
            }
            
            ctx.lineWidth = 2;

            ctx.moveTo(this.x, this.y);
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, 2*Math.PI);
            ctx.stroke();
            
            if (this.neighbours.size > 1 || (this.isAnchor && this.neighbours.size > 0) || this.softState) {
                ctx.fill();
            }
            ctx.restore();
            updated.add(this)
            for (let node of this.neighbours) {
                if (!updated.has(node)) {
                   
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(node.x, node.y);
                    ctx.stroke();
                 
                    node.draw(ctx, updated);
                    // console.log(prev);
                    // console.log(node);
                }
            }

            
        }

        inHitBox(x, y) {
            return false;
        }

        getAllNodes() {
            return [];
        }
    }

    class Scene {
        constructor (canvas, ctx) {
            this.ctx = ctx;
            this.objects = [];
            this.draggedObjects = [];
            this.camera = new Camera();
            this.draggingScene = false;
            this.draggingMode = false;
            this.constructionNode = null;
            this.consturctionHistory = [];
            this.allNodes = new Set();

            this.selectedObjects = [];
            this.selectionRectangleStart = null;

            this.mousePos = {sceneX: 0, sceneY: 0, canvasX: 0, canvasY: 0};
            
            canvas.addEventListener('mousemove', e => {
                if (this.draggingScene) {
                    this.camera.moveBy(e.offsetX-this.mousePos.canvasX, e.offsetY-this.mousePos.canvasY);
                } else {
                    this.mousePos.sceneX += e.offsetX - this.mousePos.canvasX;
                    this.mousePos.sceneY += e.offsetY - this.mousePos.canvasY;
                }
                if (this.draggedObjects.length > 0) {
                    for (let object of this.draggedObjects) {
                        if (object.isSelected) {
                            for (let selectedObject of this.selectedObjects) {
                                selectedObject.moveBy(e.offsetX-this.mousePos.canvasX, e.offsetY-this.mousePos.canvasY);
                            }
                        } else {
                            object.moveBy(e.offsetX-this.mousePos.canvasX, e.offsetY-this.mousePos.canvasY);
                        }
                    }
                }
                this.update();

                this.mousePos.canvasX = e.offsetX;
                this.mousePos.canvasY = e.offsetY;
            });

            canvas.addEventListener('mousedown', e => {   
                this.mousePos.canvasX = e.offsetX;
                this.mousePos.canvasY = e.offsetY;

                if (e.button === 0 && this.draggingMode) {
                    this.draggingScene = true;
                } else {
                    if (e.button === 0) {
                        let clickedObject = false;
                        for (let object of this.objects) {
                            if (object.inHitBox(this.mousePos.sceneX, this.mousePos.sceneY)) {
                                this.draggedObjects.push(object);
                                clickedObject = true;
                            }
                        }
                        if (!clickedObject && this.selectionRectangleStart == null) {
                            this.selectionRectangleStart = {x: this.mousePos.sceneX, y: this.mousePos.sceneY};
                        }
                    } else if (e.button === 2) {
                        if (this.constructionNode) {
                            this.consturctionHistory.pop();
                            if (this.consturctionHistory.length === 0 ) {
                                // this.constructionNode.removeFromNeibours();
                                this.constructionNode = null;
                            } else {
                                this.allNodes.delete(this.constructionNode);
                                this.constructionNode.removeFromNeibours();
                                this.constructionNode =  this.consturctionHistory[this.consturctionHistory.length-1];
                            }
                        }
                    }
                    
                    let canCreate = true;
                    let newObjects = [];
                    for (let p of this.allNodes) {
                        // console.log(p);
                        if ((p.x-this.mousePos.sceneX)*(p.x-this.mousePos.sceneX)
                            + (p.y-this.mousePos.sceneY)*(p.y-this.mousePos.sceneY) <= 50) {
                                // console.log("hi");
                                if (e.button === 0) {
                                    if (this.constructionNode) {
                                        if (!this.constructionNode.isConnected(p)) {
                                            // p.filled = true;
                                            this.constructionNode.addNeigbour(p);
                                            p.addNeigbour(this.constructionNode);
                                            // this.constructionWire.stopConstruction();
                                            // newObjects.push(this.constructionNode);
                                            this.constructionNode = null;
                                            this.consturctionHistory = [];
                                        } else {
                                            canCreate = false;
                                        }
                                    } else {
                                        this.constructionNode = p;
                                        this.consturctionHistory.push(p);
                                        canCreate = false;
                                    }
                                } else if (e.button === 2) {
                                    if (!p.isAnchor) {
                                        this.allNodes.delete(p);
                                    }
                                    p.removeFromNeibours();
                                    p.removeAllNodes();
                                }
                            }
                        if (this.objects.length > 1000) {
                            console.log("Oh no! thats a lot of stuff.");
                            console.log(this.objects);
                            this.objects = [];
                            break;
                        }
                    }
                    this.objects.push(...newObjects);
    
                    if (e.button === 0 && this.constructionNode && canCreate) {
                        let newNode = new Node(this.mousePos.sceneX, this.mousePos.sceneY);
                        this.constructionNode.addNeigbour(newNode);
                        newNode.addNeigbour(this.constructionNode);
                        this.constructionNode = newNode;
                        this.allNodes.add(newNode);
                        this.consturctionHistory.push(newNode);
                    }
    
                }
                return false;
            });

            canvas.addEventListener('contextmenu', e => { 
                e.preventDefault();
            });

            canvas.addEventListener('mouseup', e => {
                this.draggingScene = false;
                this.draggedObjects = [];
                this.selectionRectangleStart = null;

                for (let object of this.objects) {
                    if (object.inHitBox(this.mousePos.sceneX, this.mousePos.sceneY)) {
                        object.clickCallback();
                    }
                }
                this.update();
            });

            canvas.addEventListener('mouseout', e => {
                this.draggingScene = false;
            });

            // this.canvas.addEventListener('wheel', e => {
            //     if (e.deltaY > 0) {
            //         this.distance += 1;
            //     } else {
            //         this.distance -= 1;
            //         if (this.distance < 1) this.distance = 1;
            //     }
            //     this.update();
            // });
        }

        addObject(object) {
            this.objects.push(object);
            for (let node of object.getAllNodes()) {
                this.allNodes.add(node);
            }
        }

        clearCanvas() {
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.ctx.restore();
        }

        update() {
            document.getElementById('mousepos').innerHTML = this.mousePos.sceneX.toString() + " " + 
                                                            this.mousePos.sceneY.toString() + "    " +
                                                            this.mousePos.canvasX.toString() + " " + 
                                                            this.mousePos.canvasY.toString();
            this.clearCanvas();
            
            this.camera.applyTransformations(ctx);

            for (let node of this.allNodes) {
                node.softState = false;
            }
            let updatedNodes = new Set();
            for (let node of this.allNodes) {
                node.updateState(updatedNodes);
            }

            for (let object of this.objects) {
                object.updateState();
            }

            updatedNodes = new Set();
            for (let node of this.allNodes) {
                if (!updatedNodes.has(node)) {
                    node.draw(ctx, updatedNodes)
                }
            }

            for (let object of this.objects) {
                object.draw(this.ctx, 1);
            }

            if (this.constructionNode) {
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.moveTo(this.constructionNode.x, this.constructionNode.y);
                ctx.lineTo(this.mousePos.sceneX, this.mousePos.sceneY);
                ctx.stroke();
            }

            if (this.selectionRectangleStart) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'black';
                ctx.rect(this.selectionRectangleStart.x, this.selectionRectangleStart.y,
                         this.mousePos.sceneX-this.selectionRectangleStart.x, 
                         this.mousePos.sceneY-this.selectionRectangleStart.y);
                ctx.stroke();
                this.selectedObjects = []
                for (let object of this.objects) {
                    object.isSelected = false;
                    if (Math.min(this.selectionRectangleStart.x, this.mousePos.sceneX) <= object.x && object.x <= Math.max(this.selectionRectangleStart.x, this.mousePos.sceneX) &&
                        Math.min(this.selectionRectangleStart.y, this.mousePos.sceneY) <= object.y && object.y <= Math.max(this.selectionRectangleStart.y, this.mousePos.sceneY)) {
                            object.isSelected = true;
                            this.selectedObjects.push(object);
                    }
                }

            }
        }
    }

    class Camera {
        constructor () {
            this.isDragged = false;
            
            this.deltaX = 0;
            this.deltaY = 0;

            this.x = 0;
            this.y = 0;

            this.distance = 1;
        }

        applyTransformations(ctx) {
            ctx.translate(this.deltaX, this.deltaY);
            this.x += this.deltaX;
            this.y += this.deltaY;
            this.deltaX = 0;
            this.deltaY = 0;
        }

        moveBy(dx, dy) {
            this.deltaX += dx;
            this.deltaY += dy;
        }
    }

    function init() {
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');

        let scene = new Scene(canvas, ctx);

        for (let i=0; i<10; i++) {
            scene.addObject(new NANDGate(i*50, i*50));
        }
        scene.addObject(new Switch(50, 200));
        scene.addObject(new Switch(50, 300));
        // scene.addObject(new Switch(350, 450));
        // scene.addObject(new Switch(400, 400));
        scene.update();

        document.addEventListener("keydown", function(event) {
            if (event.keyCode == 16) {
                scene.draggingMode = true;
            }
        });

        document.addEventListener("keyup", function(event) {
            if (event.keyCode == 16) {
                scene.draggingMode = false;
            }
        });

        setInterval(scene.update.bind(scene), 16);
    }

    document.addEventListener('DOMContentLoaded', init);
  
  })()

  
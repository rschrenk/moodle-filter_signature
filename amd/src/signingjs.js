filter_signing_handler = [];

define(['jquery'], function ($) {
    return {
        uniqid: undefined,
        mousePressed: undefined,
        lastX: undefined, lastY: undefined,
        ctx: undefined,
        canvas: undefined,
        drawing: undefined,
        mousePos: undefined,
        lastPos: undefined,
        isMobile: undefined,

        init: function (uniqid) {
            this.uniqid = uniqid;
            filter_signing_handler[uniqid] = this;
            $('#canvas-' + uniqid).attr('data-uniqid', uniqid);
            console.log('Signing handlers are', filter_signing_handler);
            handler = this;
            console.log('filter_signature/signingjs:initialize(uniqid)', handler.uniqid);

            if (document.getElementById('image-' + handler.uniqid) != null) {
                var image = document.getElementById('image-' + handler.uniqid);
                //image.setAttribute('height', image.offsetWidth / 1000 * 320);
                return;
            }

            handler.canvas = document.getElementById('canvas-' + handler.uniqid);
            //handler.canvas.setAttribute('height', handler.canvas.offsetWidth / 1000 * 320);
            handler.canvas.setAttribute('data-uniqid', handler.uniqid);

            handler.ctx = handler.canvas.getContext('2d');
            var rect = handler.canvas.getBoundingClientRect();
            console.log('set bounds to ', rect);
            handler.canvas.width = rect.width;
            handler.canvas.height = rect.height;
            // setup lines styles ..
            handler.canvas.strokeStyle = "#000";
            handler.canvas.lineWidth = 1;

            // some variables we'll need ..
            handler.drawing = false;
            handler.mousePos = {x:0, y:0};
            handler.lastPos = handler.mousePos;
            handler.isMobile = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;

            $('#clearCanvas-' + handler.uniqid).bind('click', function () {
                console.log('Cleared', handler.uniqid);
                handler.clearCanvas(handler.canvas, ctx);
            });
            $('#id_submitbutton-' + handler.uniqid).click(function () {
                var contextid = $('#contextid-' + handler.uniqid).val();
                var subkey = $('#subkey-' + handler.uniqid).val();
                var signature = $('#canvas-' + handler.uniqid)[0].toDataURL();
                console.log('Submitted', handler.uniqid, contextid, subkey, signature);
                $('#id_signing-' + handler.uniqid).val(signature);
                require(['core/ajax'], function(ajax) {
                    ajax.call([{
                        methodname: 'filter_signature_sign',
                        args: { contextid: contextid, subkey: subkey, signature: signature },
                        done: function(imagepath) {
                            console.log('Answer is ', imagepath);
                        },
                        fail: function() {

                        }
                    }]);
                });
            });

            // mouse/touch events ..
            handler.canvas.addEventListener((handler.isMobile ? 'touchstart' : 'mousedown'), handler.eventStart);
            handler.canvas.addEventListener((handler.isMobile ? 'touchmove' : 'mousemove'), handler.eventMove);
            handler.canvas.addEventListener((handler.isMobile ? 'touchend' : 'mouseup'), handler.eventStop);

            document.body.addEventListener("touchstart", handler.eventStartBody, false);
            document.body.addEventListener("touchmove", handler.eventMoveBody, false);
            document.body.addEventListener("touchend", handler.eventStopBody, false);

            $(window).on('resize', function () {
                var W = handler.canvas.width, H = handler.canvas.height;
                var temp = handler.ctx.getImageData(0,0,W,H);
                var rect = handler.canvas.getBoundingClientRect();
                handler.canvas.width = rect.width;
                handler.canvas.height = rect.height;
                W = handler.canvas.width, H = handler.canvas.height
                handler.ctx.putImageData(temp,0,0);
            });
        },
        getMousePos: function(handler, canvasDom, touchOrMouseEvent) {
            var rect = canvasDom.getBoundingClientRect();
            return {
                x: (handler.isMobile ? touchOrMouseEvent.touches[0].clientX : touchOrMouseEvent.clientX) - rect.left,
                y: (handler.isMobile ? touchOrMouseEvent.touches[0].clientY : touchOrMouseEvent.clientY) - rect.top
            };
        },
        renderCanvas: function(handler) {
            console.log('renderCanvas', handler.uniqid);
            if (handler.drawing) {
                handler.ctx.moveTo(handler.lastPos.x, handler.lastPos.y);
                handler.ctx.lineTo(handler.mousePos.x, handler.mousePos.y);
                handler.ctx.stroke();
                handler.lastPos = handler.mousePos;
            }
        },
        clearCanvas: function(canvas, ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = canvas.width;
        },
        eventStart: function(e){
            uniqid = $(this).attr('data-uniqid');
            handler = filter_signing_handler[uniqid];
            //console.log('start', uniqid, handler);
            e.preventDefault();
            e.stopPropagation();
            if (typeof handler !== 'undefined') {
                handler.drawing = true;
                handler.lastPos = handler.getMousePos(handler, handler.canvas, e);
                handler.mousePos = handler.lastPos;
            } else {
                console.error('No handler found for uniqid', uniqid);
            }
        },
        eventStartBody: function(e) {
            //console.log('bodystart', this);
            uniqid = $(e).attr('data-uniqid');
            if (typeof uniqid !== 'undefined') {
                handler = filter_signing_handler[uniqid];
                if (e.target == handler.canvas) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        },
        eventMove: function(e) {
            uniqid = $(this).attr('data-uniqid');
            //console.log('Signing handlers are', filter_signing_handler);
            handler = filter_signing_handler[uniqid];
            console.log('move', uniqid, handler.uniqid);
            e.preventDefault();
            e.stopPropagation();
            if (typeof handler !== 'undefined') {
                handler.mousePos = handler.getMousePos(handler, handler.canvas, e);
                if (handler.drawing) {
                    handler.renderCanvas(handler);
                }
            } else {
                console.error('No handler found for uniqid', uniqid);
            }
        },
        eventMoveBody: function(e) {
            //console.log('bodystart', this);
            uniqid = $(e).attr('data-uniqid');
            if (typeof uniqid !== 'undefined') {
                handler = filter_signing_handler[uniqid];
                if (e.target == handler.canvas) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        },
        eventStop: function(e) {
            uniqid = $(this).attr('data-uniqid');
            //console.log('Signing handlers are', filter_signing_handler);
            handler = filter_signing_handler[uniqid];
            //console.log('end', uniqid, handler);
            e.preventDefault();
            e.stopPropagation();
            if (typeof handler !== 'undefined') {
                handler.drawing = false;
            } else {
                console.error('No handler found for uniqid', uniqid);
            }
        },
        eventStopBody: function(e) {
            //console.log('bodystart', this);
            uniqid = $(e).attr('data-uniqid');
            if (typeof uniqid !== 'undefined') {
                handler = filter_signing_handler[uniqid];
                if (e.target == handler.canvas) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        },

    };
});

// drawing ..
window.requestAnimFrame = (function(callback) {
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000/60);
            };
})();

define(['jquery'], function ($) {
    return {
        debug: false,
        isSetUp: false,
        mousePressed: undefined,
        lastX: undefined, lastY: undefined,
        ctx: [],
        canvas: [],
        drawing: undefined,
        mousePos: undefined,
        lastPos: undefined,

        init: function (uniqid) {
            var O = this;
            if (O.debug) console.log('filter_signature/signingjs:initialize(uniqid)', uniqid);

            $('#canvas-' + uniqid).attr('data-uniqid', uniqid);

            var canvas = document.getElementById('canvas-' + uniqid);
            O.canvas[uniqid] = canvas;
            //console.log('height', canvas.offsetWidth, Math.ceil(canvas.offsetWidth / 1000 * 320));
            canvas.setAttribute('height', Math.ceil(canvas.offsetWidth / 1000 * 320));
            canvas.setAttribute('data-uniqid', uniqid);

            if (!this.isSetUp) {
                var isMobile = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
                // Set up event handlers
                if (O.debug) console.log('filter_signature/signingjs:initialize - setup handlers');
                // mouse/touch events ..
                canvas.addEventListener((isMobile ? 'touchstart' : 'mousedown'), O.eventStart);
                canvas.addEventListener((isMobile ? 'touchmove' : 'mousemove'), O.eventMove);
                canvas.addEventListener((isMobile ? 'touchend' : 'mouseup'), O.eventStop);

                document.body.addEventListener("touchstart", O.eventStartBody, false);
                document.body.addEventListener("touchmove", O.eventMoveBody, false);
                document.body.addEventListener("touchend", O.eventStopBody, false);

                $(window).on('resize', O.eventResize, false);
            }

            if (document.getElementById('image-' + uniqid) != null) {
                var image = document.getElementById('image-' + uniqid);
                //image.setAttribute('height', image.offsetWidth / 1000 * 320);
                return;
            }

            O.ctx[uniqid] = canvas.getContext('2d');
            var rect = canvas.getBoundingClientRect();
            if (O.debug) console.log('set bounds to ', rect);
            canvas.width = rect.width;
            canvas.height = rect.height;
            // setup lines styles ..
            canvas.strokeStyle = "#000";
            canvas.lineWidth = 1;

            // some variables we'll need ..
            O.drawing = false;
            O.mousePos = {x:0, y:0};
            O.lastPos = O.mousePos;

            $('#clearCanvas-' + uniqid).bind('click', function () {
                if (O.debug) console.log('Cleared', uniqid);
                O.clearCanvas(O.canvas[uniqid], O.ctx[uniqid]);
            });
            $('#id_submitbutton-' + uniqid).click(function () {
                var contextid = $('#contextid-' + uniqid).val();
                var subkey = $('#subkey-' + uniqid).val();
                var signature = $('#canvas-' + uniqid)[0].toDataURL();
                if (O.debug) console.log('Submitted', uniqid, contextid, subkey, signature);
                $('#id_signing-' + uniqid).val(signature);
                require(['core/ajax'], function(ajax) {
                    ajax.call([{
                        methodname: 'filter_signature_sign',
                        args: { contextid: contextid, subkey: subkey, signature: signature },
                        done: function(imagepath) {
                            if (O.debug) console.log('Answer is ', imagepath);
                        },
                        fail: function() {

                        }
                    }]);
                });
            });

            if (O.debug) console.log('Signing handlers are', this.handlers);
        },
        getMousePos: function(handler, canvasDom, touchOrMouseEvent) {
            var isMobile = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
            var rect = canvasDom.getBoundingClientRect();
            return {
                x: (isMobile ? touchOrMouseEvent.touches[0].clientX : touchOrMouseEvent.clientX) - rect.left,
                y: (isMobile ? touchOrMouseEvent.touches[0].clientY : touchOrMouseEvent.clientY) - rect.top
            };
        },
        renderCanvas: function(uniqid) {
            require(['filter_signature/signingjs'], function(O) {
                if (O.debug) console.log('renderCanvas', uniqid);
                if (O.drawing) {
                    O.ctx[uniqid].moveTo(O.lastPos.x, O.lastPos.y);
                    O.ctx[uniqid].lineTo(O.mousePos.x, O.mousePos.y);
                    O.ctx[uniqid].stroke();
                    O.lastPos = O.mousePos;
                }
            });
        },
        clearCanvas: function(canvas, ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = canvas.width;
        },
        eventStart: function(e){
            var uniqid = $(this).attr('data-uniqid');
            require(['filter_signature/signingjs'], function(O) {
                if (O.debug) console.log('start', uniqid, O.canvas[uniqid]);
                e.preventDefault();
                e.stopPropagation();
                O.drawing = true;
                O.lastPos = O.getMousePos(O, O.canvas[uniqid], e);
                O.mousePos = O.lastPos;
            });
        },
        eventStartBody: function(e) {
            var uniqid = $(this).attr('data-uniqid');
            require(['filter_signature/signingjs'], function(O) {
                if (O.debug) console.log('bodystart', this);
                if (typeof uniqid !== 'undefined') {
                    if (e.target == O.canvas[uniqid]) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            });
        },
        eventMove: function(e) {
            var uniqid = $(this).attr('data-uniqid');
            require(['filter_signature/signingjs'], function(O) {
                if (typeof uniqid !== 'undefined') {
                    if (O.debug) console.log('move', uniqid, O.canvas[uniqid]);
                    e.preventDefault();
                    e.stopPropagation();
                    O.mousePos = O.getMousePos(O, O.canvas[uniqid], e);
                    if (O.drawing) {
                        O.renderCanvas(uniqid);
                    }
                }
            });
        },
        eventMoveBody: function(e) {
            var uniqid = $(this).attr('data-uniqid');
            require(['filter_signature/signingjs'], function(O) {
                if (O.debug) console.log('bodystart', this);
                if (typeof uniqid !== 'undefined') {
                    if (e.target == O.canvas[uniqid]) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            });
        },
        eventResize: function() {
            require(['filter_signature/signingjs'], function(O) {
                O.canvas.forEach(function(uniqid) {
                    var W = O.canvas[uniqid].width, H = O.canvas[uniqid].height;
                    var temp = O.ctx[uniqid].getImageData(0,0,W,H);
                    var rect = O.canvas[uniqid].getBoundingClientRect();
                    O.canvas[uniqid].width = rect.width;
                    O.canvas[uniqid].height = rect.height;
                    W = O.canvas[uniqid].width, H = O.canvas[uniqid].height
                    O.canvas[uniqid].putImageData(temp,0,0);
                });
            });
        },
        eventStop: function(e) {
            var uniqid = $(this).attr('data-uniqid');
            require(['filter_signature/signingjs'], function(O) {
                if (O.debug) console.log('end', uniqid);
                e.preventDefault();
                e.stopPropagation();
                O.drawing = false;
            });
        },
        eventStopBody: function(e) {
            var uniqid = $(this).attr('data-uniqid');
            require(['filter_signature/signingjs'], function(O) {
                if (O.debug) console.log('bodystart', this);
                if (typeof uniqid !== 'undefined') {
                    if (e.target == O.canvas[uniqid]) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            });
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

define(['jquery'], function ($) {
    return {
        mousePressed: undefined,
        lastX: undefined, lastY: undefined,
        ctx: undefined,
        canvas: undefined,
        drawing: undefined,
        mousePos: undefined,
        lastPos: undefined,
        isMobile: undefined,

        init: function (uniqid) {
            var handler = this;
            handler.uniqid = uniqid;
            console.log('filter_signature/signingjs:initialize(uniqid)', handler.uniqid);

            if (document.getElementById('image-' + handler.uniqid) != null) {
                var image = document.getElementById('image-' + handler.uniqid);
                image.setAttribute('height', image.offsetWidth / 1000 * 320);
                return;
            }

            handler.canvas = document.getElementById('canvas-' + handler.uniqid);
            handler.canvas.setAttribute('height', handler.canvas.offsetWidth / 1000 * 320);
            handler.canvas.setAttribute('data-uniqid', handler.uniqid);

            handler.ctx = handler.canvas.getContext('2d');
            var rect = handler.canvas.getBoundingClientRect();
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
                console.log('Submitted', handler.uniqid);
                var contextid = $('#contextid-' + handler.uniqid).val();
                var subkey = $('#subkey-' + handler.uniqid).val();
                var signature = $('#canvas-' + handler.uniqid)[0].toDataURL();
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
            handler.canvas.addEventListener((handler.isMobile ? 'touchstart' : 'mousedown'), function(e) {
                console.log('start');
                e.preventDefault();
                e.stopPropagation();
                handler.drawing = true;
                handler.lastPos = handler.getMousePos(handler.canvas, e);
                handler.mousePos = handler.lastPos;
            });
            handler.canvas.addEventListener((handler.isMobile ? 'touchmove' : 'mousemove'), function(e) {
                console.log('move');
                e.preventDefault();
                e.stopPropagation();
                handler.mousePos = handler.getMousePos(handler.canvas, e);
            });
            handler.canvas.addEventListener((handler.isMobile ? 'touchend' : 'mouseup'), function(e) {
                console.log('end');
                e.preventDefault();
                e.stopPropagation();
                handler.drawing = false;
            });

            document.body.addEventListener("touchstart", function (e) {
                console.log('bodystart');
                if (e.target == handler.canvas) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, false);
            document.body.addEventListener("touchend", function (e) {
                console.log('bodyend');
                if (e.target == handler.canvas) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, false);
            document.body.addEventListener("touchmove", function (e) {
                console.log('bodymove');
                if (e.target == handler.canvas) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, false);

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
        save: function () {
            initialize();
        },
        getMousePos: function(canvasDom, touchOrMouseEvent) {
            var rect = canvasDom.getBoundingClientRect();
            return {
                x: (handler.isMobile ? touchOrMouseEvent.touches[0].clientX : touchOrMouseEvent.clientX) - rect.left,
                y: (handler.isMobile ? touchOrMouseEvent.touches[0].clientY : touchOrMouseEvent.clientY) - rect.top
            };
        },
        renderCanvas: function() {
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
        downloadCanvas: function() {
           this.href = handler.canvas.toDataURL();
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
